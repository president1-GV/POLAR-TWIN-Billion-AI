from fastapi import APIRouter, HTTPException, Depends, Request, status
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime, timezone
import json

from backend.simulation.scenario_engine import simulation_engine
from backend.database.supabase_client import supabase_client
from backend.digital_twin.state_engine import digital_twin_engine
from backend.security.rbac import (
    get_current_user,
    require_permission,
    require_station_access
)
from backend.security.rate_limiter import check_simulation_rate_limit
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/simulation", tags=["Simulation"])

class RunSimulationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    scenario_key: str = Field(..., min_length=2, max_length=64)
    station_id: str = Field(default="station_bharati", min_length=2, max_length=32)
    ambient_temp_c: Optional[float] = Field(default=None, ge=-80.0, le=40.0)
    wind_speed_ms: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    custom_params: Optional[Dict[str, Any]] = None

class ReviewActionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    action: str = Field(..., pattern="^(APPROVED|REJECTED|EXECUTED_SIMULATED)$")
    notes: Optional[str] = Field(default=None, max_length=500)

@router.get("/scenarios")
def list_scenarios():
    """List available emergency simulation scenarios."""
    return [
        {"key": k, **v} for k, v in simulation_engine.SCENARIOS.items()
    ]

@router.post("/run", dependencies=[Depends(check_simulation_rate_limit)])
def execute_simulation(
    payload: RunSimulationPayload,
    current_user: Dict[str, Any] = Depends(require_permission("run_simulations"))
):
    """
    Execute what-if simulation and compute quantitative downstream impact.
    Enforces RBAC ('run_simulations') and BOLA/IDOR station scope validation.
    """
    # BOLA / IDOR Verification: ensure user is authorized for target station
    require_station_access(payload.station_id, current_user)

    temp = payload.ambient_temp_c if payload.ambient_temp_c is not None else -22.0
    wind = payload.wind_speed_ms if payload.wind_speed_ms is not None else 12.0
    
    res = simulation_engine.run_simulation(
        scenario_key=payload.scenario_key,
        station_id=payload.station_id,
        ambient_temp_c=temp,
        wind_speed_ms=wind,
        custom_params=payload.custom_params
    )

    actor_username = current_user.get("username", "operator")

    # Persist simulation run
    try:
        supabase_client.insert_row("simulation_runs", {
            "scenario_name": payload.scenario_key,
            "station_id": payload.station_id,
            "trigger_asset_id": res["trigger_asset"],
            "severity": res["severity"],
            "initial_conditions": res["initial_conditions"],
            "parameters": res["parameters"],
            "consequences": res["consequences"],
            "recommendations": res["recommendations"],
            "operator_action": "PENDING_REVIEW"
        })
    except Exception as e:
        print(f"[SimulationAPI] Note on persistence: {e}")

    # Security Audit log
    security_audit_logger.log_event(
        action="SIMULATION_EXECUTED",
        actor_id=actor_username,
        role=current_user.get("role", "OPERATOR"),
        station_id=payload.station_id,
        details={"scenario": payload.scenario_key, "simulation_id": res["simulation_id"]}
    )

    return res

@router.post("/{simulation_id}/review")
def review_mitigation(
    simulation_id: str,
    payload: ReviewActionPayload,
    current_user: Dict[str, Any] = Depends(require_permission("approve_mitigations"))
):
    """
    Operator review of AI-recommended mitigation plan.
    Strictly derives operator identity from verified server-side session token.
    Enforces 'approve_mitigations' RBAC permission.
    """
    actor_username = current_user.get("username", "operator")
    actor_role = current_user.get("role", "OPERATOR")
    user_station = current_user.get("station", "GLOBAL")

    action_status = "MITIGATION_ENACTED" if payload.action == "APPROVED" else "MITIGATION_REJECTED"
    
    # If approved, mutate the simulated digital twin state safely
    if payload.action == "APPROVED":
        target_station = user_station if user_station != "GLOBAL" else "station_bharati"
        digital_twin_engine.apply_mitigation(
            station_id=target_station,
            mitigation_type="AUTO_RECOVERY"
        )

    # Record security audit event
    audit_record = security_audit_logger.log_event(
        action=f"SIMULATION_{payload.action}",
        actor_id=actor_username,
        role=actor_role,
        station_id=user_station,
        details={
            "simulation_id": simulation_id,
            "notes": payload.notes,
            "action_status": action_status
        }
    )

    return {
        "simulation_id": simulation_id,
        "reviewed_by": actor_username,
        "role": actor_role,
        "action": payload.action,
        "status": action_status,
        "reviewed_at": datetime.now(timezone.utc).isoformat(),
        "audit_event_id": audit_record["id"],
        "notes": payload.notes
    }

@router.get("/runs")
def list_simulation_runs(limit: int = 10):
    """List recent scenario execution runs."""
    return supabase_client.get_table("simulation_runs", {"order": "started_at.desc", "limit": str(limit)})
