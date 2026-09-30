import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List

from backend.database.supabase_client import supabase_client
from backend.app.schemas.schemas import AuditLogCreateSchema


class ImmutableAuditService:
    """
    Immutable-style operational & security audit service satisfying Section 24 & 25.
    
    Records:
    - user
    - action
    - resource
    - before_state
    - after_state
    - timestamp
    - source
    - request_id
    - hash_signature (cryptographic link to previous log entry)
    """

    def __init__(self):
        self._last_hash = "GENESIS_POLAR_TWIN_LINEAGE_ROOT_0000000000000000"
        self._local_buffer: List[Dict[str, Any]] = []

    def record_audit_event(
        self,
        event: AuditLogCreateSchema
    ) -> Dict[str, Any]:
        """
        Appends an immutable audit entry with cryptographic tamper-evidence.
        """
        event_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Redact sensitive parameters
        sanitized_details = self._sanitize_dict(event.details)
        sanitized_before = self._sanitize_dict(event.before_state) if event.before_state else None
        sanitized_after = self._sanitize_dict(event.after_state) if event.after_state else None

        # Compute cryptographic block signature
        sig_data = f"{self._last_hash}:{event.user_id}:{event.action}:{event.resource}:{now_iso}"
        block_hash = hashlib.sha256(sig_data.encode("utf-8")).hexdigest()
        self._last_hash = block_hash

        record = {
            "id": event_id,
            "request_id": event.request_id or str(uuid.uuid4()),
            "user_id": event.user_id,
            "role": event.role,
            "station_id": event.station_id or "GLOBAL",
            "action": event.action,
            "resource": event.resource,
            "before_state": sanitized_before,
            "after_state": sanitized_after,
            "details": sanitized_details,
            "client_ip": event.client_ip or "127.0.0.1",
            "source": event.source,
            "hash_signature": block_hash,
            "timestamp": now_iso
        }

        self._local_buffer.append(record)
        if len(self._local_buffer) > 2000:
            self._local_buffer.pop(0)

        # Persist to Supabase audit_logs
        try:
            supabase_client.insert_row("audit_logs", record)
        except Exception:
            pass

        return record

    def _sanitize_dict(self, d: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not d:
            return {}
        cleaned = {}
        for k, v in d.items():
            if any(s in k.lower() for s in ["password", "token", "secret", "key", "authorization"]):
                cleaned[k] = "[REDACTED]"
            else:
                cleaned[k] = v
        return cleaned

    def query_audit_trail(self, limit: int = 100, resource: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries immutable audit logs."""
        try:
            params = {"order": "timestamp.desc", "limit": str(limit)}
            if resource:
                params["resource"] = f"eq.{resource}"
            db_res = supabase_client.get_table("audit_logs", params)
            if db_res:
                return db_res
        except Exception:
            pass
        return list(reversed(self._local_buffer[-limit:]))


immutable_audit_service = ImmutableAuditService()
