from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.edge.edge_node import edge_node
from backend.security.rbac import get_current_user, require_permission
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/edge", tags=["Edge Telemetry"])

class LinkStatusPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: str = Field(..., pattern="^(ONLINE|DEGRADED|OFFLINE|SYNCING)$")

class IngestReadingPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    metric: str = Field(..., min_length=1, max_length=64)
    value: float
    unit: str = Field(..., min_length=1, max_length=32)
    asset_id: str = Field(default="bh_gen_01", min_length=1, max_length=64)
    source_type: str = Field(default="EDGE_SIMULATED", pattern="^(REAL_PUBLIC|PHYSICS_SYNTHETIC|EDGE_SIMULATED|FUTURE_IOT|MOCK)$")

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
def toggle_edge_link(
    payload: LinkStatusPayload,
    current_user: Dict[str, Any] = Depends(require_permission("toggle_edge_link"))
):
    """
    Toggle satellite link between ONLINE, DEGRADED, OFFLINE, and SYNCING.
    Enforces 'toggle_edge_link' RBAC permission and writes audit record.
    """
    res = edge_node.set_link_status(payload.status)

    security_audit_logger.log_event(
        action="EDGE_LINK_STATUS_CHANGED",
        actor_id=current_user.get("username", "operator"),
        role=current_user.get("role", "OPERATOR"),
        station_id=edge_node.station_id,
        details={"new_status": payload.status, "device_id": edge_node.device_id}
    )

    return res

@router.post("/telemetry")
def ingest_edge_telemetry(payload: IngestReadingPayload):
    """
    Ingest reading on edge node. Direct forward if ONLINE; buffers with CRC32 if OFFLINE.
    """
    return edge_node.ingest_telemetry_reading(
        metric=payload.metric,
        value=payload.value,
        unit=payload.unit,
        asset_id=payload.asset_id,
        source_type=payload.source_type
    )

@router.post("/sync")
def trigger_sync(current_user: Dict[str, Any] = Depends(require_permission("trigger_edge_sync"))):
    """
    Trigger store-and-forward replay synchronization from edge buffer to central Supabase.
    Enforces 'trigger_edge_sync' RBAC permission.
    """
    sync_res = edge_node.trigger_reconnection_sync()

    security_audit_logger.log_event(
        action="EDGE_SYNC_TRIGGERED",
        actor_id=current_user.get("username", "operator"),
        role=current_user.get("role", "OPERATOR"),
        station_id=edge_node.station_id,
        details={"records_synced": sync_res.get("records_synced", 0), "checksum_valid": sync_res.get("checksum_valid", True)}
    )

    return sync_res
