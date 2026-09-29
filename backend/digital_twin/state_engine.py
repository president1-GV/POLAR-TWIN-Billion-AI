from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import json
from backend.database.supabase_client import supabase_client
from backend.digital_twin.physics_engine import physics_engine
from backend.adapters.ncpor_adapter import ncpor_adapter

class DigitalTwinStateEngine:
    """
    Central Digital Twin State Engine for Maitri and Bharati stations.
    Maintains real-time asset hierarchy, calculates aggregate health, detects transitions,
    and dispatches operational alerts.
    """
    def __init__(self):
        # In-memory station twin states for high-frequency access
        self.station_states: Dict[str, Dict[str, Any]] = {}
        self.asset_states: Dict[str, Dict[str, Any]] = {}
        self._initialize_local_cache()

    def _initialize_local_cache(self):
        # Seed initial memory representations
        for s_id in ["station_bharati", "station_maitri"]:
            self.station_states[s_id] = {
                "station_id": s_id,
                "overall_health_score": 96.5,
                "thermal_balance_state": "BALANCED",
                "energy_grid_state": "NORMAL",
                "life_support_state": "OPTIMAL",
                "active_threats": 0,
                "last_transition": datetime.now(timezone.utc).isoformat(),
                "connectivity_status": "ONLINE"
            }

    def get_station_twin(self, station_id: str) -> Dict[str, Any]:
        """
        Retrieves complete operational digital twin representation including
        asset states, 3D coordinates, real weather, and energy balance.
        """
        # Fetch current assets from Supabase
        assets_raw = supabase_client.get_table("station_assets", {"station_id": f"eq.{station_id}"})
        env_raw = ncpor_adapter.fetch_observations(station_id)
        
        # Calculate dynamic physics state
        ambient_temp = env_raw.get("temperature_c", -18.5)
        wind_speed = env_raw.get("wind_speed_ms", 11.2)
        phys = physics_engine.calculate_state(ambient_temp, wind_speed)

        # Merge assets with live metrics
        processed_assets = []
        criticality_weights = {"CRITICAL": 1.0, "HIGH": 0.7, "MEDIUM": 0.4, "LOW": 0.2}
        total_weight = 0.0
        weighted_health = 0.0

        for a in assets_raw:
            a_id = a.get("id")
            status = a.get("status", "NORMAL")
            w = criticality_weights.get(a.get("criticality", "MEDIUM"), 0.5)
            if status == "OFFLINE":
                w *= 0.2  # Offline / isolated assets have low impact on active operational grid
            h = float(a.get("health_score", 100.0))
            
            # If this is the active primary generator, bind live physics
            if a_id == "bh_gen_01":
                gen_state = phys["generator_state"]
                # If degraded or offline in storage, reflect it
                if a.get("status") in ["CRITICAL", "FAILED"]:
                    h = min(h, 25.0)
                elif a.get("status") == "OFFLINE":
                    h = float(a.get("health_score", 70.0))
                else:
                    h = gen_state["health_score"]
                a["health_score"] = h
                a["status"] = a.get("status") or gen_state["status"]
                a["current_state"] = gen_state

            total_weight += w
            weighted_health += (h * w)
            processed_assets.append(a)

        overall_health = round(weighted_health / max(1.0, total_weight), 1)

        # Fetch active alerts
        alerts_raw = supabase_client.get_table("alerts", {
            "station_id": f"eq.{station_id}",
            "status": "eq.ACTIVE"
        })

        return {
            "station_id": station_id,
            "overall_health_score": overall_health,
            "environment": env_raw,
            "physics_telemetry": phys,
            "assets": processed_assets,
            "active_alerts_count": len(alerts_raw),
            "active_alerts": alerts_raw[:5],
            "microgrid_summary": phys["microgrid_state"],
            "thermal_summary": phys["thermal_state"],
            "life_support_state": "CRITICAL" if overall_health < 50.0 else ("DEGRADED" if overall_health < 80.0 else "OPTIMAL"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def update_asset_telemetry(self, asset_id: str, updates: Dict[str, Any], station_id: str = "station_bharati") -> Dict[str, Any]:
        """
        Updates an asset's health, status, and telemetry, triggering transitions if thresholds crossed.
        """
        res = supabase_client.update_row("station_assets", "id", asset_id, updates)
        
        # Check if alert needs to be generated on transition to WARNING or CRITICAL
        new_status = updates.get("status")
        if new_status in ["WARNING", "CRITICAL", "FAILED"]:
            supabase_client.insert_row("alerts", {
                "station_id": station_id,
                "asset_id": asset_id,
                "title": f"State Transition: {asset_id} escalated to {new_status}",
                "severity": "CRITICAL" if new_status in ["CRITICAL", "FAILED"] else "WARNING",
                "status": "ACTIVE",
                "source_type": "PHYSICS_SYNTHETIC",
                "evidence": [f"Health dropped to {updates.get('health_score', 0)}%", f"Status set to {new_status}"],
                "predicted_consequence": "Potential generation deficit or thermal instability",
                "recommended_action": "Inspect asset telemetry and review automated mitigation plan"
            })

        return res[0] if res else {"status": "ok"}

    def apply_mitigation(self, station_id: str = "station_bharati", mitigation_type: str = "AUTO_RECOVERY") -> Dict[str, Any]:
        """
        Applies operator-approved mitigation strategy to stabilize microgrid and life support:
        - Brings backup/auxiliary genset online
        - Sheds non-critical laboratory load
        - Re-stabilizes asset health scores and microgrid balance
        """
        # Synchronize Aux Genset 02 onto the bus
        supabase_client.update_row("station_assets", "id", "bh_gen_02", {
            "status": "NORMAL",
            "health_score": 96.0,
            "current_state": {
                "load_pct": 74.0,
                "exhaust_temp_c": 360.0,
                "vibration_mms": 1.6,
                "fuel_flow_lph": 38.5,
                "oil_pressure_bar": 4.8
            }
        })
        # Set primary genset to isolated OFFLINE maintenance standby
        supabase_client.update_row("station_assets", "id", "bh_gen_01", {
            "status": "OFFLINE",
            "health_score": 60.0
        })
        # Update in-memory station state
        if station_id in self.station_states:
            self.station_states[station_id].update({
                "overall_health_score": 94.0,
                "energy_grid_state": "STABILIZED",
                "life_support_state": "OPTIMAL",
                "last_transition": datetime.now(timezone.utc).isoformat()
            })
        return {
            "status": "STABILIZED",
            "station_id": station_id,
            "mitigation_type": mitigation_type,
            "stabilized_health_score": 94.0
        }

digital_twin_engine = DigitalTwinStateEngine()
