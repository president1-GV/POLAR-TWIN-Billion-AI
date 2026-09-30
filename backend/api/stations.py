from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from backend.database.supabase_client import supabase_client
from backend.digital_twin.state_engine import digital_twin_engine
from backend.digital_twin.causal_chain import causal_chain_engine
from backend.adapters.ncpor_adapter import ncpor_adapter

router = APIRouter(prefix="/stations", tags=["Stations"])

class CausalSimulatePayload(BaseModel):
    ambient_temp_c: Optional[float] = Field(default=None, ge=-80.0, le=40.0)
    wind_speed_ms: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    shed_priority_1_loads: bool = False
    engage_aux_genset: bool = False
    discharge_bess: bool = False

class MitigatePayload(BaseModel):
    mitigation_type: str = "AUTO_RECOVERY"

@router.get("")
def list_stations():
    """List all Antarctic research stations with live state overview."""
    stations = supabase_client.get_table("stations")
    result = []
    for s in stations:
        s_id = s.get("id")
        twin = digital_twin_engine.get_station_twin(s_id)
        result.append({
            **s,
            "overall_health_score": twin["overall_health_score"],
            "life_support_state": twin["life_support_state"],
            "environment": twin["environment"],
            "active_alerts_count": twin["active_alerts_count"],
            "generation_kw": twin["microgrid_summary"]["total_demand_kw"],
            "fuel_burn_lph": twin["physics_telemetry"]["generator_state"]["fuel_flow_lph"],
            "thermal_indoor_c": twin["thermal_summary"]["indoor_temp_c"]
        })
    return result

@router.get("/{station_id}")
def get_station(station_id: str):
    """Retrieve details for a specific station."""
    stations = supabase_client.get_table("stations", {"id": f"eq.{station_id}"})
    if not stations:
        raise HTTPException(status_code=404, detail="Station not found")
    return stations[0]

@router.get("/{station_id}/digital-twin")
def get_station_digital_twin(station_id: str):
    """Retrieve the full dynamic digital twin state snapshot across 15 canonical domains."""
    return digital_twin_engine.get_station_twin(station_id)

@router.get("/{station_id}/causal-chain")
def get_station_causal_chain(station_id: str):
    """
    Evaluates the 10-link cross-domain causal chain for the current live environment:
    Environment -> Energy Forecast -> Load Impact -> Battery/Gen Optimization ->
    Fuel Surge -> Inventory Forecast -> Logistics Risk -> Alert -> Scenario Analysis -> Decision Support.
    """
    env_raw = ncpor_adapter.fetch_observations(station_id)
    ambient_temp = env_raw.get("temperature_c", -18.5)
    wind_speed = env_raw.get("wind_speed_ms", 11.2)
    return causal_chain_engine.evaluate(
        station_id=station_id,
        ambient_temp_c=ambient_temp,
        wind_speed_ms=wind_speed
    )

@router.post("/{station_id}/causal-chain/simulate")
def simulate_station_causal_chain(station_id: str, payload: CausalSimulatePayload):
    """
    Executes operator parameter perturbation simulation through the 10-link causal chain.
    Allows testing ambient drops, wind speed spikes, and mitigation options in real-time.
    """
    return causal_chain_engine.evaluate(
        station_id=station_id,
        ambient_temp_c=payload.ambient_temp_c,
        wind_speed_ms=payload.wind_speed_ms,
        shed_priority_1_loads=payload.shed_priority_1_loads,
        engage_aux_genset=payload.engage_aux_genset,
        discharge_bess=payload.discharge_bess
    )

@router.post("/{station_id}/mitigate")
def apply_mitigation(station_id: str, payload: MitigatePayload):
    """
    Applies operator-approved mitigation strategy to stabilize microgrid, shed loads,
    and bring auxiliary assets online.
    """
    return digital_twin_engine.apply_mitigation(
        station_id=station_id,
        mitigation_type=payload.mitigation_type
    )
