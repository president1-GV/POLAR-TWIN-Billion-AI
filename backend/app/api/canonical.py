from fastapi import APIRouter, Query, HTTPException, status
from typing import Dict, Any
from backend.app.services.canonical_state import canonical_state_service
from backend.app.schemas.schemas import VALID_STATION_IDS

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin Canonical State"])


@router.get("/canonical-state", response_model=Dict[str, Any])
def get_canonical_state(
    station_id: str = Query("station_bharati", description="Target station ID (station_bharati or station_maitri)")
):
    """
    Returns the unified, authoritative DigitalTwinState domain model satisfying Section 21 & 28:
    ONE REAL ASSET -> ONE ASSET ID -> ONE AUTHORITATIVE DIGITAL RECORD
    Consumed identically by 3D, Command Center, Energy, Weather, Logistics,
    Prediction, Simulation, and Audit.
    """
    if station_id not in VALID_STATION_IDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid station ID: '{station_id}'. Allowed values: {list(VALID_STATION_IDS)}"
        )
    return canonical_state_service.get_canonical_state(station_id)
