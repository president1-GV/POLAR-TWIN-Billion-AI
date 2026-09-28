from fastapi import APIRouter
from typing import Dict, Any
from backend.adapters.ncpor_adapter import ncpor_adapter
from backend.database.supabase_client import supabase_client

router = APIRouter(prefix="/environment", tags=["Environment"])

@router.get("/{station_id}")
def get_station_environment(station_id: str):
    """
    Fetch current atmospheric measurements via NCPOR Meteorological Adapter
    with strict data provenance tags (REAL_PUBLIC vs PHYSICS_SYNTHETIC fallback).
    """
    return ncpor_adapter.fetch_observations(station_id)

@router.get("/{station_id}/history")
def get_environment_history(station_id: str, limit: int = 24):
    """Retrieve historical environmental observations."""
    obs = supabase_client.get_table("environment_observations", {
        "station_id": f"eq.{station_id}",
        "order": "timestamp.desc",
        "limit": str(limit)
    })
    return obs
