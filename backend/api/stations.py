from fastapi import APIRouter, HTTPException, Query, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.database.supabase_client import supabase_client
from backend.digital_twin.state_engine import digital_twin_engine
from backend.digital_twin.causal_chain import causal_chain_engine
from backend.adapters.ncpor_adapter import ncpor_adapter
from backend.security.rbac import (
    get_current_user,
    get_current_user_optional,
    require_station_access,
    require_permission
)
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/stations", tags=["Stations"])

class CausalSimulatePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ambient_temp_c: Optional[float] = Field(default=None, ge=-80.0, le=40.0)
    wind_speed_ms: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    shed_priority_1_loads: bool = False
    engage_aux_genset: bool = False
    discharge_bess: bool = False

class MitigatePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    mitigation_type: str = "AUTO_RECOVERY"

@router.get("")
def list_stations(current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """
    List Antarctic research stations with live state overview.
    Enforces server-side station scoping and operational authority indicators.
    """
    stations = supabase_client.get_table("stations")
    allowed_scope = current_user.get("station_scope", ["station_bharati", "station_maitri"])
    is_cross_station = current_user.get("canonical_role") in ["ADMIN", "MISSION_CONTROL"] or current_user.get("station") == "GLOBAL"
    
    result = []
    for s in stations:
        s_id = s.get("id")
        twin = digital_twin_engine.get_station_twin(s_id)
        is_authorized = is_cross_station or (s_id in allowed_scope)
        result.append({
            **s,
            "overall_health_score": twin["overall_health_score"],
            "life_support_state": twin["life_support_state"],
            "environment": twin["environment"],
            "active_alerts_count": twin["active_alerts_count"],
            "generation_kw": twin["microgrid_summary"]["total_demand_kw"],
            "fuel_burn_lph": twin["physics_telemetry"]["generator_state"]["fuel_flow_lph"],
            "thermal_indoor_c": twin["thermal_summary"]["indoor_temp_c"],
            "is_authorized_to_operate": is_authorized
        })
    return result

@router.get("/{station_id}")
def get_station(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Retrieve details for a specific station with BOLA scope verification."""
    require_station_access(station_id, current_user)
    stations = supabase_client.get_table("stations", {"id": f"eq.{station_id}"})
    if not stations:
        raise HTTPException(status_code=404, detail="Station not found")
    return stations[0]

@router.get("/{station_id}/digital-twin")
def get_station_digital_twin(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Retrieve the full dynamic digital twin state snapshot across 15 canonical domains with station scope validation."""
    require_station_access(station_id, current_user)
    return digital_twin_engine.get_station_twin(station_id)

@router.get("/{station_id}/causal-chain")
def get_station_causal_chain(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """
    Evaluates the 10-link cross-domain causal chain for the current live environment:
    Environment -> Energy Forecast -> Load Impact -> Battery/Gen Optimization ->
    Fuel Surge -> Inventory Forecast -> Logistics Risk -> Alert -> Scenario Analysis -> Decision Support.
    """
    require_station_access(station_id, current_user)
    env_raw = ncpor_adapter.fetch_observations(station_id)
    ambient_temp = env_raw.get("temperature_c", -18.5)
    wind_speed = env_raw.get("wind_speed_ms", 11.2)
    return causal_chain_engine.evaluate(
        station_id=station_id,
        ambient_temp_c=ambient_temp,
        wind_speed_ms=wind_speed
    )

@router.post("/{station_id}/causal-chain/simulate")
def simulate_station_causal_chain(
    station_id: str,
    payload: CausalSimulatePayload,
    current_user: Dict[str, Any] = Depends(require_permission("run_simulations"))
):
    """
    Executes operator parameter perturbation simulation through the 10-link causal chain.
    Allows testing ambient drops, wind speed spikes, and mitigation options in real-time.
    Enforces 'run_simulations' permission and BOLA station scope.
    """
    require_station_access(station_id, current_user)
    return causal_chain_engine.evaluate(
        station_id=station_id,
        ambient_temp_c=payload.ambient_temp_c,
        wind_speed_ms=payload.wind_speed_ms,
        shed_priority_1_loads=payload.shed_priority_1_loads,
        engage_aux_genset=payload.engage_aux_genset,
        discharge_bess=payload.discharge_bess
    )

@router.post("/{station_id}/mitigate")
def apply_mitigation(
    station_id: str,
    payload: MitigatePayload,
    current_user: Dict[str, Any] = Depends(require_permission("approve_mitigations"))
):
    """
    Applies operator-approved mitigation strategy to stabilize microgrid, shed loads,
    and bring auxiliary assets online.
    Enforces 'approve_mitigations' RBAC permission, station scope, and immutable audit logging.
    """
    require_station_access(station_id, current_user)
    res = digital_twin_engine.apply_mitigation(
        station_id=station_id,
        mitigation_type=payload.mitigation_type
    )

    security_audit_logger.log_event(
        action="STATION_MITIGATION_APPLIED",
        actor_id=current_user.get("username", "operator"),
        role=current_user.get("role", "OPERATOR"),
        station_id=station_id,
        status="EXECUTED",
        details={"mitigation_type": payload.mitigation_type}
    )

    return res
