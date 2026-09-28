from fastapi import APIRouter
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import json
from backend.database.supabase_client import supabase_client

router = APIRouter(prefix="/audit", tags=["Audit"])

class AuditLogPayload(BaseModel):
    user_id: str
    role: str
    action: str
    station_id: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

@router.get("")
def list_audit_logs(limit: int = 50):
    """Retrieve operational audit trail."""
    return supabase_client.get_table("audit_logs", {"order": "timestamp.desc", "limit": str(limit)})

@router.post("")
def record_audit_log(payload: AuditLogPayload):
    """Record an auditable operational action."""
    return supabase_client.insert_row("audit_logs", {
        "user_id": payload.user_id,
        "role": payload.role,
        "station_id": payload.station_id,
        "action": payload.action,
        "details": json.dumps(payload.details or {})
    })
