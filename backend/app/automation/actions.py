"""
POLAR-TWIN SMART AUTOMATION ACTION MODEL
Defines actionable tasks, operational recommendations, and simulation interventions.

Distinguishes explicitly between:
- RECOMMENDED (Human-in-the-loop: requires authorized operator approval)
- SIMULATION_ACTION (Executed strictly inside Digital Twin simulation sandbox)
- EXECUTED (Directly dispatched to connected operational equipment)
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, Optional, Literal
from pydantic import BaseModel, Field


ActionType = Literal[
    "ADJUST_GENERATION",
    "DISCHARGE_BATTERY",
    "CHARGE_BATTERY",
    "PRIORITIZE_CRITICAL_LOAD",
    "GENERATE_ALERT",
    "CREATE_LOGISTICS_ALERT",
    "START_SIMULATION",
    "REQUEST_OPERATOR_APPROVAL",
    "SHED_NON_CRITICAL_LOAD",
    "RESTRICT_FUEL_BURN",
]

ActionStatus = Literal[
    "RECOMMENDED",
    "SIMULATION_ACTION",
    "EXECUTED",
    "REJECTED",
    "BLOCKED",
    "COMPLETED",
    "FAILED",
]


class AutomationAction(BaseModel):
    """
    Standardized operational action model for POLAR-TWIN automation workflows.
    """
    id: str = Field(default_factory=lambda: f"ACT-2026-{uuid.uuid4().hex[:8].upper()}")
    automation_id: str
    station_id: str
    asset_id: str
    action_type: ActionType
    parameters: Dict[str, Any] = Field(default_factory=dict)
    reason: str
    expected_effect: str
    status: ActionStatus = "RECOMMENDED"
    approval_required: bool = True
    approved_by: Optional[str] = None
    approval_timestamp: Optional[str] = None
    executed_at: Optional[str] = None
    verified_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

    def approve(self, operator_username: str, role: str) -> None:
        """Approve action by authorized operator."""
        self.approved_by = f"{operator_username} ({role})"
        self.approval_timestamp = datetime.now(timezone.utc).isoformat()
        self.status = "SIMULATION_ACTION"  # In prototype environment, execute in simulation sandbox

    def reject(self, operator_username: str, reason: str) -> None:
        """Reject action by operator."""
        self.approved_by = operator_username
        self.status = "REJECTED"
        self.error = f"Rejected by operator: {reason}"

    def mark_completed(self, execution_result: Dict[str, Any]) -> None:
        """Record successful execution."""
        now_iso = datetime.now(timezone.utc).isoformat()
        self.executed_at = now_iso
        self.verified_at = now_iso
        self.status = "COMPLETED"
        self.result = execution_result

    def mark_failed(self, error_message: str) -> None:
        """Record execution failure and enter safe fallback."""
        self.status = "FAILED"
        self.error = error_message
