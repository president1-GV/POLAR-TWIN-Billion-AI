from fastapi import APIRouter, Depends
from typing import Dict, Any
from backend.adapters.ncpor_adapter import ncpor_adapter
from backend.database.supabase_client import supabase_client
from backend.security.rbac import get_current_user, get_current_user_optional, require_station_access

router = APIRouter(prefix="/environment", tags=["Environment"])

@router.get("/{station_id}")
def get_station_environment(station_id: str, current_user: Dict[str, Any] = Depends(get_current_user_optional)):
    """
    Fetch current atmospheric measurements via NCPOR Meteorological Adapter
    with strict data provenance tags (REAL_PUBLIC vs PHYSICS_SYNTHETIC fallback).
    Enforces station access validation.
    """
    require_station_access(station_id, current_user)
    return ncpor_adapter.fetch_observations(station_id)

@router.get("/{station_id}/history")
def get_environment_history(
    station_id: str,
    limit: int = 24,
    current_user: Dict[str, Any] = Depends(get_current_user_optional)
):
    """Retrieve historical environmental observations with station access validation."""
    require_station_access(station_id, current_user)
    obs = supabase_client.get_table("environment_observations", {
        "station_id": f"eq.{station_id}",
        "order": "timestamp.desc",
        "limit": str(limit)
    })
    return obs
