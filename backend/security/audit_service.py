import uuid
import time
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
from backend.database.supabase_client import supabase_client

class SecurityAuditLogger:
    """
    Zero-Trust Security & Operational Audit Service.
    Maintains an immutable record of all authentication, authorization,
    mitigation decisions, and security events for forensic traceability.
    """
    def __init__(self):
        self._local_audit_buffer: List[Dict[str, Any]] = []
        self._max_buffer = 1000

    def log_event(
        self,
        action: str,
        actor_id: str = "system",
        role: str = "SYSTEM",
        station_id: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        client_ip: Optional[str] = None,
        status: str = "SUCCESS"
    ) -> Dict[str, Any]:
        """
        Record a security or operational event.
        Sanitizes sensitive fields before persisting.
        """
        safe_details = dict(details or {})
        # Redact credentials or tokens if present
        for key in ["password", "token", "secret", "salt", "hash"]:
            if key in safe_details:
                safe_details[key] = "[REDACTED]"

        event_id = str(uuid.uuid4())
        ts = datetime.now(timezone.utc).isoformat()

        audit_record = {
            "id": event_id,
            "user_id": actor_id,
            "role": role,
            "station_id": station_id or "GLOBAL",
            "action": action,
            "details": safe_details,
            "client_ip": client_ip or "127.0.0.1",
            "timestamp": ts,
            "status": status
        }

        # Store in local memory buffer
        self._local_audit_buffer.append(audit_record)
        if len(self._local_audit_buffer) > self._max_buffer:
            self._local_audit_buffer.pop(0)

        # Persist to Supabase audit_logs
        try:
            supabase_client.insert_row("audit_logs", {
                "id": event_id,
                "user_id": actor_id,
                "role": role,
                "station_id": station_id or "GLOBAL",
                "action": action,
                "details": safe_details,
                "client_ip": client_ip or "127.0.0.1",
                "timestamp": ts
            })
        except Exception as e:
            # Audit logging must not crash primary operational workflows if DB is offline
            pass

        return audit_record

    def get_recent_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve recent security audit entries."""
        try:
            db_logs = supabase_client.get_table("audit_logs", {"order": "timestamp.desc", "limit": str(limit)})
            if db_logs and len(db_logs) > 0:
                return db_logs
        except Exception:
            pass
        return list(reversed(self._local_audit_buffer[-limit:]))

security_audit_logger = SecurityAuditLogger()
