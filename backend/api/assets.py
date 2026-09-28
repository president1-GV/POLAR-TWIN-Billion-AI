from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.database.supabase_client import supabase_client
from backend.digital_twin.asset_graph import asset_graph
from backend.ai.anomaly_detector import anomaly_detector
from backend.ai.predictive_maintenance import predictive_maintenance
from backend.digital_twin.state_engine import digital_twin_engine

router = APIRouter(prefix="/assets", tags=["Assets"])

class TelemetryUpdatePayload(BaseModel):
    exhaust_temp_c: Optional[float] = None
    vibration_mms: Optional[float] = None
    load_pct: Optional[float] = None
    oil_pressure_bar: Optional[float] = None
    fuel_flow_lph: Optional[float] = None
    status: Optional[str] = None

@router.get("/station/{station_id}")
def list_station_assets(station_id: str):
    """Retrieve all physical assets for a station."""
    return supabase_client.get_table("station_assets", {"station_id": f"eq.{station_id}"})

@router.get("/{asset_id}")
def get_asset_detail(asset_id: str):
    """Retrieve asset details, live predictive maintenance, and AI diagnostic score."""
    assets = supabase_client.get_table("station_assets", {"id": f"eq.{asset_id}"})
    if not assets:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset = assets[0]
    curr_state = asset.get("current_state", {}) or {}

    # Run AI anomaly & predictive maintenance on current telemetry
    anomaly_res = anomaly_detector.analyze(curr_state, asset_id)
    pred_res = predictive_maintenance.evaluate_asset(asset_id, curr_state, anomaly_res)

    return {
        **asset,
        "ai_anomaly_diagnostics": anomaly_res,
        "predictive_maintenance": pred_res,
        "graph_node": asset_graph.node_metadata.get(asset_id, {})
    }

@router.get("/{asset_id}/consequences")
def evaluate_asset_consequences(asset_id: str, ambient_temp_c: float = -20.0):
    """Evaluate downstream cascading consequences if this specific asset fails."""
    return asset_graph.calculate_downstream_impact(asset_id, ambient_temp_c)

@router.post("/{asset_id}/telemetry")
def update_asset_telemetry(asset_id: str, payload: TelemetryUpdatePayload):
    """Update asset telemetry, trigger AI evaluation, and update digital twin state."""
    assets = supabase_client.get_table("station_assets", {"id": f"eq.{asset_id}"})
    if not assets:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    asset = assets[0]
    curr = asset.get("current_state", {}) or {}
    updates_dict = {k: v for k, v in payload.dict().items() if v is not None}
    curr.update(updates_dict)

    # Run AI evaluation
    anomaly_res = anomaly_detector.analyze(curr, asset_id)
    pred_res = predictive_maintenance.evaluate_asset(asset_id, curr, anomaly_res)

    new_health = pred_res["health_score"]
    new_status = payload.status or ("CRITICAL" if new_health < 40.0 else ("WARNING" if new_health < 75.0 else "NORMAL"))

    res = digital_twin_engine.update_asset_telemetry(asset_id, {
        "current_state": curr,
        "health_score": new_health,
        "status": new_status
    }, asset.get("station_id", "station_bharati"))

    return {
        "status": "UPDATED",
        "asset_id": asset_id,
        "health_score": new_health,
        "asset_status": new_status,
        "anomaly_result": anomaly_res,
        "predictive_maintenance": pred_res
    }
