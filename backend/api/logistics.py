from fastapi import APIRouter
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.database.supabase_client import supabase_client
from backend.ai.forecasting import forecasting_service

router = APIRouter(prefix="/logistics", tags=["Logistics"])

class DelaySimulationPayload(BaseModel):
    delay_days: int = 14
    station_id: str = "station_bharati"

@router.get("/{station_id}/inventory")
def list_inventory(station_id: str):
    """Retrieve supply chain inventory items with current burn rate and days remaining."""
    items = supabase_client.get_table("logistics_items", {"station_id": f"eq.{station_id}"})
    return items

@router.get("/{station_id}/shipments")
def list_shipments(station_id: str):
    """Retrieve resupply vessel voyages and manifests."""
    return supabase_client.get_table("shipments", {"destination_station_id": f"eq.{station_id}"})

@router.post("/simulate-delay")
def simulate_shipment_delay(payload: DelaySimulationPayload):
    """Simulate supply ship delay and compute shortage risk across all inventory categories."""
    items = supabase_client.get_table("logistics_items", {"station_id": f"eq.{payload.station_id}"})
    projections = forecasting_service.forecast_logistics_runway(items, payload.delay_days)
    return {
        "station_id": payload.station_id,
        "simulated_delay_days": payload.delay_days,
        "projections": projections
    }
