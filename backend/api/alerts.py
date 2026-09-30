from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime, timezone
import json
from backend.database.supabase_client import supabase_client
from backend.security.rbac import (
    get_current_user,
    require_permission,
    require_station_access
)
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertActionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    notes: Optional[str] = None

@router.get("")
def list_alerts(station_id: Optional[str] = None, status_filter: Optional[str] = None, limit: int = 50):
    """Retrieve operational alerts filtered by station or status."""
    params: Dict[str, str] = {"order": "created_at.desc", "limit": str(limit)}
    if station_id:
        params["station_id"] = f"eq.{station_id}"
    if status_filter:
        params["status"] = f"eq.{status_filter}"
    return supabase_client.get_table("alerts", params)

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(
    alert_id: str,
    payload: Optional[AlertActionPayload] = None,
    current_user: Dict[str, Any] = Depends(require_permission("acknowledge_alerts"))
):
    """
    Mark an operational alert as acknowledged by verified operator.
    Enforces server-side identity derivation and RBAC permission.
    """
    actor_username = current_user.get("username", "operator")
    actor_role = current_user.get("role", "OPERATOR")
    now_iso = datetime.now(timezone.utc).isoformat()

    # Verify alert exists and check BOLA
    alerts = supabase_client.get_table("alerts", {"id": f"eq.{alert_id}"})
    if not alerts or len(alerts) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    
    target_alert = alerts[0]
    alert_station = target_alert.get("station_id", "GLOBAL")
    require_station_access(alert_station, current_user)

    supabase_client.update_row("alerts", "id", alert_id, {
        "status": "ACKNOWLEDGED",
        "acknowledged_by": actor_username,
        "acknowledged_at": now_iso
    })

    security_audit_logger.log_event(
        action="ALERT_ACKNOWLEDGED",
        actor_id=actor_username,
        role=actor_role,
        station_id=alert_station,
        details={"alert_id": alert_id}
    )

    return {"status": "ACKNOWLEDGED", "alert_id": alert_id, "acknowledged_by": actor_username, "acknowledged_at": now_iso}

@router.post("/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
    payload: Optional[AlertActionPayload] = None,
    current_user: Dict[str, Any] = Depends(require_permission("acknowledge_alerts"))
):
    """
    Mark an operational alert as resolved by verified operator.
    """
    actor_username = current_user.get("username", "operator")
    actor_role = current_user.get("role", "OPERATOR")
    now_iso = datetime.now(timezone.utc).isoformat()

    alerts = supabase_client.get_table("alerts", {"id": f"eq.{alert_id}"})
    if not alerts or len(alerts) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    target_alert = alerts[0]
    alert_station = target_alert.get("station_id", "GLOBAL")
    require_station_access(alert_station, current_user)

    supabase_client.update_row("alerts", "id", alert_id, {
        "status": "RESOLVED",
        "resolved_at": now_iso
    })

    security_audit_logger.log_event(
        action="ALERT_RESOLVED",
        actor_id=actor_username,
        role=actor_role,
        station_id=alert_station,
        details={"alert_id": alert_id}
    )

    return {"status": "RESOLVED", "alert_id": alert_id, "resolved_by": actor_username, "resolved_at": now_iso}

@router.post("/{alert_id}/reopen")
def reopen_alert(
    alert_id: str,
    current_user: Dict[str, Any] = Depends(require_permission("acknowledge_alerts"))
):
    """
    Reopen a previously resolved alert back to active operational status.
    """
    actor_username = current_user.get("username", "operator")
    actor_role = current_user.get("role", "OPERATOR")

    alerts = supabase_client.get_table("alerts", {"id": f"eq.{alert_id}"})
    if not alerts or len(alerts) == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")

    target_alert = alerts[0]
    alert_station = target_alert.get("station_id", "GLOBAL")
    require_station_access(alert_station, current_user)

    supabase_client.update_row("alerts", "id", alert_id, {
        "status": "ACTIVE",
        "resolved_at": None
    })

    security_audit_logger.log_event(
        action="ALERT_REOPENED",
        actor_id=actor_username,
        role=actor_role,
        station_id=alert_station,
        details={"alert_id": alert_id}
    )

    return {"status": "ACTIVE", "alert_id": alert_id}

