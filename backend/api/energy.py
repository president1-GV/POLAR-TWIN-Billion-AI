from fastapi import APIRouter
from typing import Dict, Any
from backend.adapters.ncpor_adapter import ncpor_adapter
from backend.digital_twin.physics_engine import physics_engine
from backend.ai.forecasting import forecasting_service

router = APIRouter(prefix="/energy", tags=["Energy"])

@router.get("/{station_id}")
def get_energy_status(station_id: str):
    """Retrieve microgrid energy metrics, thermal heat loss, and fuel burn rate."""
    env = ncpor_adapter.fetch_observations(station_id)
    phys = physics_engine.calculate_state(env["temperature_c"], env["wind_speed_ms"], env["solar_radiation_wm2"])
    return {
        "station_id": station_id,
        "environment": env,
        "microgrid": phys["microgrid_state"],
        "thermal_system": phys["thermal_state"],
        "primary_generator": phys["generator_state"],
        "battery_soc_pct": 86.5,
        "solar_pv_kw": phys["microgrid_state"]["solar_generation_kw"],
        "fuel_burn_lph": phys["generator_state"]["fuel_flow_lph"],
        "reserve_margin_pct": phys["microgrid_state"]["reserve_margin_pct"]
    }

@router.get("/{station_id}/forecast")
def get_energy_forecast(station_id: str):
    """Retrieve 24-hour forward projection driven by diurnal Antarctic climate equations."""
    env = ncpor_adapter.fetch_observations(station_id)
    return forecasting_service.forecast_energy_24h(env["temperature_c"], env["wind_speed_ms"])
