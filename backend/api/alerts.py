from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import json
from backend.database.supabase_client import supabase_client

router = APIRouter(prefix="/alerts", tags=["Alerts"])

class AlertActionPayload(BaseModel):
    user_id: str = "operator.default"

@router.get("")
def list_alerts(station_id: Optional[str] = None, status: Optional[str] = None, limit: int = 50):
    """Retrieve operational alerts filtered by station or status."""
    params: Dict[str, str] = {"order": "created_at.desc", "limit": str(limit)}
    if station_id:
        params["station_id"] = f"eq.{station_id}"
    if status:
        params["status"] = f"eq.{status}"
    return supabase_client.get_table("alerts", params)

@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, payload: AlertActionPayload):
    """Mark an operational alert as acknowledged by human operator."""
    now_iso = datetime.now(timezone.utc).isoformat()
    res = supabase_client.update_row("alerts", "id", alert_id, {
        "status": "ACKNOWLEDGED",
        "acknowledged_by": payload.user_id,
        "acknowledged_at": now_iso
    })
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    # Audit log
    supabase_client.insert_row("audit_logs", {
        "user_id": payload.user_id,
        "role": "OPERATOR",
        "action": "ALERT_ACKNOWLEDGED",
        "details": json.dumps({"alert_id": alert_id})
    })

    return {"status": "ACKNOWLEDGED", "alert_id": alert_id, "acknowledged_at": now_iso}

@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, payload: AlertActionPayload):
    """Mark an operational alert as resolved."""
    now_iso = datetime.now(timezone.utc).isoformat()
    res = supabase_client.update_row("alerts", "id", alert_id, {
        "status": "RESOLVED",
        "resolved_at": now_iso
    })
    if not res:
        raise HTTPException(status_code=404, detail="Alert not found")

    # Audit log
    supabase_client.insert_row("audit_logs", {
        "user_id": payload.user_id,
        "role": "OPERATOR",
        "action": "ALERT_RESOLVED",
        "details": json.dumps({"alert_id": alert_id})
    })

    return {"status": "RESOLVED", "alert_id": alert_id, "resolved_at": now_iso}
