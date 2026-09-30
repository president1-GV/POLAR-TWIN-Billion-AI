from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
import json
from backend.database.supabase_client import supabase_client
from backend.security.rbac import get_current_user, get_current_user_optional, require_permission, has_permission
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/audit", tags=["Audit"])

class AuditLogPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: str
    station_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

@router.get("")
def list_audit_logs(
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """
    Retrieve operational audit trail.
    Enforces operational observability across Antarctic command operations.
    """
    return supabase_client.get_table("audit_logs", {"order": "timestamp.desc", "limit": str(limit)})

@router.post("")
def record_audit_log(
    payload: AuditLogPayload,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Record an auditable operational action.
    Server derives verified actor identity and role from session token (Zero-Trust).
    """
    actor_username = current_user.get("username", "unknown")
    actor_role = current_user.get("role", "UNKNOWN")
    effective_station = payload.station_id or current_user.get("station", "GLOBAL")

    return supabase_client.insert_row("audit_logs", {
        "user_id": actor_username,
        "role": actor_role,
        "station_id": effective_station,
        "action": payload.action,
        "details": json.dumps(payload.details or {})
    })
