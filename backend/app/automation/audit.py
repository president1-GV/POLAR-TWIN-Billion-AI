"""
POLAR-TWIN AUTOMATION AUDIT & EVIDENCE TRAIL
Cryptographic audit record generator with latency instrumentation and tamper-evident logging.
"""

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class AutomationAuditRecord(BaseModel):
    """
    Standardized cryptographic audit record for every automation lifecycle execution.
    """
    audit_id: str = Field(default_factory=lambda: f"AUD-2026-{uuid.uuid4().hex[:8].upper()}")
    automation_id: str
    station_id: str
    trigger_type: str
    trigger_description: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    input_state_hash: str
    rule_id: Optional[str] = None
    model_version: Optional[str] = None
    decision_summary: str
    action_type: str
    action_status: str
    operator: str
    operator_role: str
    verification_result: str
    data_quality_tier: str = "VERIFIED"
    latency_breakdown_ms: Dict[str, float] = Field(default_factory=dict)
    chain_prev_hash: Optional[str] = None
    record_hash: Optional[str] = None


class AutomationAuditLedger:
    """
    In-memory and file-backed audit ledger with cryptographic SHA-256 chaining.
    """
    def __init__(self):
        self._records: List[AutomationAuditRecord] = []
        self._last_hash = "GENESIS_POLAR_TWIN_2026_AUDIT_BLOCK"

    def record_execution(
        self,
        automation_id: str,
        station_id: str,
        trigger_type: str,
        trigger_desc: str,
        input_state: Dict[str, Any],
        rule_id: Optional[str],
        model_version: Optional[str],
        decision_summary: str,
        action_type: str,
        action_status: str,
        operator: str,
        operator_role: str,
        verification_result: str,
        quality_tier: str,
        latency_breakdown_ms: Dict[str, float]
    ) -> AutomationAuditRecord:
        """
        Creates, hashes, and stores a new audit entry.
        """
        # Compute SHA-256 of input state for non-repudiation
        state_str = json.dumps(input_state, sort_keys=True, default=str)
        state_hash = hashlib.sha256(state_str.encode("utf-8")).hexdigest()

        rec = AutomationAuditRecord(
            automation_id=automation_id,
            station_id=station_id,
            trigger_type=trigger_type,
            trigger_description=trigger_desc,
            input_state_hash=state_hash,
            rule_id=rule_id,
            model_version=model_version,
            decision_summary=decision_summary,
            action_type=action_type,
            action_status=action_status,
            operator=operator,
            operator_role=operator_role,
            verification_result=verification_result,
            data_quality_tier=quality_tier,
            latency_breakdown_ms=latency_breakdown_ms,
            chain_prev_hash=self._last_hash
        )

        # Hash current record into tamper-evident chain
        rec_str = json.dumps(rec.model_dump(exclude={"record_hash"}), sort_keys=True)
        rec.record_hash = hashlib.sha256(rec_str.encode("utf-8")).hexdigest()
        self._last_hash = rec.record_hash

        self._records.insert(0, rec)  # Newest first
        return rec

    def get_recent_audits(self, limit: int = 50, station_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """Returns recent audit entries, optionally filtered by station."""
        records = self._records
        if station_id:
            records = [r for r in records if r.station_id == station_id]
        return [r.model_dump() for r in records[:limit]]

    def get_audit_by_id(self, audit_id: str) -> Optional[Dict[str, Any]]:
        """Finds specific audit record by ID."""
        for r in self._records:
            if r.audit_id == audit_id:
                return r.model_dump()
        return None


# Global Singleton Ledger Instance
audit_ledger = AutomationAuditLedger()
