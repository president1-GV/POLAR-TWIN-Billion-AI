from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from backend.edge.edge_node import edge_node

router = APIRouter(prefix="/edge", tags=["Edge Telemetry"])

class LinkStatusPayload(BaseModel):
    status: str  # ONLINE, DEGRADED, OFFLINE, SYNCING

class IngestReadingPayload(BaseModel):
    metric: str
    value: float
    unit: str
    asset_id: str = "bh_gen_01"
    source_type: str = "EDGE_SIMULATED"

@router.get("/status")
def get_edge_status():
    """Retrieve rugged on-station IoT edge node health, link status, buffer queue, and local alerts."""
    return {
        "device_id": edge_node.device_id,
        "station_id": edge_node.station_id,
        "link_status": edge_node.link_status,
        "sequence_counter": edge_node.sequence_counter,
        "buffer_queue_size": len(edge_node.local_buffer),
        "local_buffer_sample": edge_node.local_buffer[-5:] if edge_node.local_buffer else [],
        "local_alerts_count": len(edge_node.local_alerts),
        "local_alerts": edge_node.local_alerts[-5:] if edge_node.local_alerts else [],
        "hardware_specification": "Advantech ARK-3531 Rugged IoT Industrial PC (Dual SSD RAID-1, -40°C to +70°C Operating)"
    }

@router.post("/link-status")
def toggle_edge_link(payload: LinkStatusPayload):
    """Toggle satellite link between ONLINE, DEGRADED, OFFLINE, and SYNCING."""
    return edge_node.set_link_status(payload.status)

@router.post("/telemetry")
def ingest_edge_telemetry(payload: IngestReadingPayload):
    """Ingest reading on edge node. Direct forward if ONLINE; buffers with CRC32 if OFFLINE."""
    return edge_node.ingest_telemetry_reading(
        metric=payload.metric,
        value=payload.value,
        unit=payload.unit,
        asset_id=payload.asset_id,
        source_type=payload.source_type
    )

@router.post("/sync")
def trigger_sync():
    """Trigger store-and-forward replay synchronization from edge buffer to central Supabase."""
    return edge_node.trigger_reconnection_sync()
