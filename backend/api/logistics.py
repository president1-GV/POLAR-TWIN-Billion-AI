from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from backend.database.supabase_client import supabase_client
from backend.ai.forecasting import forecasting_service

router = APIRouter(prefix="/logistics", tags=["Logistics"])

class DelaySimulationPayload(BaseModel):
    delay_days: int = 14
    station_id: str = "station_bharati"

FALLBACK_INVENTORY = {
    "station_bharati": [
        {
            "id": "inv_bh_fuel",
            "station_id": "station_bharati",
            "category": "FUEL",
            "name": "Aviation Jet A-1 / Polar Diesel (Additised)",
            "sku": "POL-DSL-A1",
            "current_stock": 170500.0,
            "unit": "LITRES",
            "daily_burn_rate": 915.0,
            "minimum_reserve": 35000.0,
            "days_remaining": 186.3,
            "shortage_risk_level": "LOW",
            "storage_location": "Bulk Fuel Tanks 01 & 02"
        },
        {
            "id": "inv_bh_food",
            "station_id": "station_bharati",
            "category": "FOOD",
            "name": "Long-Shelf Freeze-Dried & Frozen Rations",
            "sku": "RAT-POL-FOOD",
            "current_stock": 4320.0,
            "unit": "MAN_DAYS",
            "daily_burn_rate": 24.0,
            "minimum_reserve": 1200.0,
            "days_remaining": 180.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Main Deep Freeze & Dry Pantry"
        },
        {
            "id": "inv_bh_med",
            "station_id": "station_bharati",
            "category": "MEDICAL",
            "name": "Emergency Trauma & Surgical Consumables",
            "sku": "MED-TRM-KIT",
            "current_stock": 95.0,
            "unit": "KITS",
            "daily_burn_rate": 0.15,
            "minimum_reserve": 30.0,
            "days_remaining": 633.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Station Medical Bay Dispensary"
        },
        {
            "id": "inv_bh_spares",
            "station_id": "station_bharati",
            "category": "SPARE_PARTS",
            "name": "Kirloskar 250kVA Turbo & Filter Maintenance Sets",
            "sku": "KIR-FLT-SET",
            "current_stock": 14.0,
            "unit": "UNITS",
            "daily_burn_rate": 0.05,
            "minimum_reserve": 5.0,
            "days_remaining": 280.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Heavy Spares Container B4"
        },
        {
            "id": "inv_bh_water",
            "station_id": "station_bharati",
            "category": "WATER",
            "name": "Treated Potable Water Storage",
            "sku": "H2O-POT-L",
            "current_stock": 16500.0,
            "unit": "LITRES",
            "daily_burn_rate": 1200.0,
            "minimum_reserve": 4000.0,
            "days_remaining": 13.8,
            "shortage_risk_level": "MEDIUM",
            "storage_location": "Insulated Buffer Storage Bladders"
        }
    ],
    "station_maitri": [
        {
            "id": "inv_ma_fuel",
            "station_id": "station_maitri",
            "category": "FUEL",
            "name": "Polar Diesel Grade A-1 (Low Temp)",
            "sku": "POL-DSL-MA-01",
            "current_stock": 58200.0,
            "unit": "LITRES",
            "daily_burn_rate": 680.0,
            "minimum_reserve": 18000.0,
            "days_remaining": 85.6,
            "shortage_risk_level": "LOW",
            "storage_location": "Fuel Farm Pad Tanks"
        },
        {
            "id": "inv_ma_food",
            "station_id": "station_maitri",
            "category": "FOOD",
            "name": "Sub-Zero Freeze-Dried & Tinned Provisions",
            "sku": "RAT-MA-FOOD",
            "current_stock": 3600.0,
            "unit": "MAN_DAYS",
            "daily_burn_rate": 20.0,
            "minimum_reserve": 900.0,
            "days_remaining": 180.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Main Block Cold Store"
        },
        {
            "id": "inv_ma_med",
            "station_id": "station_maitri",
            "category": "MEDICAL",
            "name": "High-Altitude Polar Trauma & Hypothermia Packs",
            "sku": "MED-MA-HYPO",
            "current_stock": 60.0,
            "unit": "KITS",
            "daily_burn_rate": 0.1,
            "minimum_reserve": 15.0,
            "days_remaining": 600.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Maitri Medical Dispensary"
        },
        {
            "id": "inv_ma_spares",
            "station_id": "station_maitri",
            "category": "SPARE_PARTS",
            "name": "Kirloskar 125kVA Genset Overhaul & Filter Kits",
            "sku": "KIR-MA-FLT",
            "current_stock": 8.0,
            "unit": "UNITS",
            "daily_burn_rate": 0.04,
            "minimum_reserve": 2.0,
            "days_remaining": 200.0,
            "shortage_risk_level": "LOW",
            "storage_location": "Workshop & Garage"
        },
        {
            "id": "inv_ma_water",
            "station_id": "station_maitri",
            "category": "WATER",
            "name": "Lake Priyadarshini Potable Water Buffer",
            "sku": "H2O-PRIYA-MA",
            "current_stock": 23550.0,
            "unit": "LITRES",
            "daily_burn_rate": 1100.0,
            "minimum_reserve": 6000.0,
            "days_remaining": 21.4,
            "shortage_risk_level": "MEDIUM",
            "storage_location": "Potable Water Storage Reservoir"
        }
    ]
}

FALLBACK_SHIPMENTS = {
    "station_bharati": [
        {
            "id": "ship_vasiliy_44",
            "vessel_name": "MV Vasiliy Golovnin",
            "voyage_number": "V44-IND-ANTARCTIC",
            "departure_port": "Cape Town, South Africa",
            "destination_station_id": "station_bharati",
            "scheduled_departure": "2026-11-20T08:00:00Z",
            "scheduled_arrival": "2026-12-15T14:00:00Z",
            "delay_days": 0,
            "status": "EN_ROUTE",
            "icebreaker_escort": True,
            "cargo_manifest": [
                {"item": "Polar Diesel Fuel", "quantity": 180000, "unit": "Litres"},
                {"item": "Heavy Genset Overhaul Kit", "quantity": 3, "unit": "Sets"},
                {"item": "Fresh Expedition Rations", "quantity": 3500, "unit": "Kg"}
            ]
        }
    ],
    "station_maitri": [
        {
            "id": "ship_papanin_44",
            "vessel_name": "MV Ivan Papanin",
            "voyage_number": "V44-MAITRI-EXP",
            "departure_port": "Cape Town, South Africa",
            "destination_station_id": "station_maitri",
            "scheduled_departure": "2026-11-25T06:00:00Z",
            "scheduled_arrival": "2026-12-28T12:00:00Z",
            "delay_days": 0,
            "status": "EN_ROUTE",
            "icebreaker_escort": True,
            "cargo_manifest": [
                {"item": "Arctic Diesel Fuel", "quantity": 120000, "unit": "Litres"},
                {"item": "Kirloskar 125kVA Overhaul Modules", "quantity": 4, "unit": "Sets"},
                {"item": "Antarctic Winter Food Rations", "quantity": 8500, "unit": "Kg"}
            ]
        }
    ]
}

from backend.security.rbac import get_current_user, get_current_user_optional, require_station_access, require_permission

@router.get("/{station_id}/inventory")
def list_inventory(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Retrieve supply chain inventory items with current burn rate and days remaining."""
    require_station_access(station_id, current_user)
    items = supabase_client.get_table("logistics_items", {"station_id": f"eq.{station_id}"})
    if not items or len(items) == 0:
        return FALLBACK_INVENTORY.get(station_id, FALLBACK_INVENTORY["station_bharati"])
    return items

@router.get("/{station_id}/shipments")
def list_shipments(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """Retrieve resupply vessel voyages and manifests."""
    require_station_access(station_id, current_user)
    shipments = supabase_client.get_table("shipments", {"destination_station_id": f"eq.{station_id}"})
    if not shipments or len(shipments) == 0:
        return FALLBACK_SHIPMENTS.get(station_id, FALLBACK_SHIPMENTS["station_bharati"])
    return shipments

@router.post("/simulate-delay")
def simulate_shipment_delay(
    payload: DelaySimulationPayload,
    current_user: Dict[str, Any] = Depends(require_permission("run_simulations"))
):
    """Simulate supply ship delay and compute shortage risk across all inventory categories."""
    require_station_access(payload.station_id, current_user)
    items = supabase_client.get_table("logistics_items", {"station_id": f"eq.{payload.station_id}"})
    if not items or len(items) == 0:
        items = FALLBACK_INVENTORY.get(payload.station_id, FALLBACK_INVENTORY["station_bharati"])
    projections = forecasting_service.forecast_logistics_runway(items, payload.delay_days)
    return {
        "station_id": payload.station_id,
        "simulated_delay_days": payload.delay_days,
        "projections": projections
    }
