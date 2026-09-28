from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.database.supabase_client import supabase_client
from backend.digital_twin.state_engine import digital_twin_engine
from backend.adapters.ncpor_adapter import ncpor_adapter

router = APIRouter(prefix="/stations", tags=["Stations"])

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
    """Retrieve the full dynamic digital twin state snapshot."""
    return digital_twin_engine.get_station_twin(station_id)
