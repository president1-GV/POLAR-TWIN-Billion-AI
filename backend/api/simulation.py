from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from datetime import datetime, timezone
import json
from backend.simulation.scenario_engine import simulation_engine
from backend.database.supabase_client import supabase_client
from backend.digital_twin.state_engine import digital_twin_engine

router = APIRouter(prefix="/simulation", tags=["Simulation"])

class RunSimulationPayload(BaseModel):
    scenario_key: str
    station_id: str = "station_bharati"
    ambient_temp_c: Optional[float] = None
    wind_speed_ms: Optional[float] = None
    custom_params: Optional[Dict[str, Any]] = None

class ReviewActionPayload(BaseModel):
    action: str  # APPROVED, REJECTED, EXECUTED_SIMULATED
    operator_id: str = "operator.current"
    notes: Optional[str] = None

@router.get("/scenarios")
def list_scenarios():
    """List available emergency simulation scenarios."""
    return [
        {"key": k, **v} for k, v in simulation_engine.SCENARIOS.items()
    ]

@router.post("/run")
def execute_simulation(payload: RunSimulationPayload):
    """Execute what-if simulation and compute quantitative downstream impact."""
    temp = payload.ambient_temp_c if payload.ambient_temp_c is not None else -22.0
    wind = payload.wind_speed_ms if payload.wind_speed_ms is not None else 12.0
    
    res = simulation_engine.run_simulation(
        scenario_key=payload.scenario_key,
        station_id=payload.station_id,
        ambient_temp_c=temp,
        wind_speed_ms=wind,
        custom_params=payload.custom_params
    )

    # Persist simulation run
    try:
        supabase_client.insert_row("simulation_runs", {
            "scenario_name": payload.scenario_key,
            "station_id": payload.station_id,
            "trigger_asset_id": res["trigger_asset"],
            "severity": res["severity"],
            "initial_conditions": json.dumps(res["initial_conditions"]),
            "parameters": json.dumps(res["parameters"]),
            "consequences": json.dumps(res["consequences"]),
            "recommendations": json.dumps(res["recommendations"]),
            "operator_action": "PENDING_REVIEW"
        })
    except Exception as e:
        print(f"[SimulationAPI] Note on persistence: {e}")

    return res

@router.post("/{simulation_id}/review")
def review_simulation_mitigation(simulation_id: str, payload: ReviewActionPayload):
    """
    Human-in-the-Loop decision: Approve or Reject mitigation recommendation.
    If APPROVED: Applies simulated stabilization to Digital Twin and writes audit record.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    if payload.action not in ["APPROVED", "REJECTED", "EXECUTED_SIMULATED"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    # If approved, perform simulated stabilization
    if payload.action in ["APPROVED", "EXECUTED_SIMULATED"]:
        # 1. Isolate failed Gen 01 for bearing overhaul
        supabase_client.update_row("station_assets", "id", "bh_gen_01", {
            "status": "OFFLINE",
            "health_score": 50.0,
            "current_state": {"status": "ISOLATED_FOR_BEARING_OVERHAUL"}
        })
        # 2. Stabilize genset 02 and life support
        supabase_client.update_row("station_assets", "id", "bh_gen_02", {
            "status": "NORMAL",
            "health_score": 98.0,
            "current_state": {"load_pct": 72.0, "status": "SYNCHRONIZED_ACTIVE"}
        })
        supabase_client.update_row("station_assets", "id", "bh_hvac_01", {
            "status": "NORMAL",
            "health_score": 96.0,
            "current_state": {"indoor_temp_c": 21.5}
        })
        supabase_client.update_row("station_assets", "id", "bh_lab_01", {
            "status": "OFFLINE",
            "current_state": {"state": "LOAD_SHED_TO_CONSERVE_POWER"}
        })
        # Clear critical alerts
        supabase_client.query_sql("UPDATE alerts SET status = 'RESOLVED' WHERE station_id = 'station_bharati' AND severity = 'CRITICAL';")

    # Audit log
    supabase_client.insert_row("audit_logs", {
        "user_id": payload.operator_id,
        "role": "OPERATOR",
        "action": f"SIMULATION_{payload.action}",
        "details": json.dumps({"simulation_id": simulation_id, "notes": payload.notes})
    })

    return {
        "simulation_id": simulation_id,
        "operator_action": payload.action,
        "reviewed_at": now_iso,
        "stabilization_status": "EXECUTED_SIMULATED" if payload.action in ["APPROVED", "EXECUTED_SIMULATED"] else "DISCARDED"
    }
