from typing import Dict, Any, List, Set, Optional
from collections import deque

class StationAssetGraph:
    """
    Directed operational dependency graph of Antarctic station assets.
    Tracks topological relationships and calculates downstream failure propagation.
    """
    def __init__(self, station_id: str = "station_bharati"):
        self.station_id = station_id
        # Adjacency lists: node -> list of (target_node, relationship_type, impact_weight)
        self.downstream_edges: Dict[str, List[Dict[str, Any]]] = {}
        self.upstream_edges: Dict[str, List[Dict[str, Any]]] = {}
        self.node_metadata: Dict[str, Dict[str, Any]] = {}
        self._initialize_graph()

    def _initialize_graph(self):
        # Register nodes for Bharati
        nodes = [
            {"id": "bh_fuel_tank_01", "name": "Polar Fuel Tank Alpha", "type": "FUEL", "criticality": "CRITICAL", "shed_priority": None},
            {"id": "bh_fuel_tank_02", "name": "Polar Fuel Tank Bravo", "type": "FUEL", "criticality": "CRITICAL", "shed_priority": None},
            {"id": "bh_gen_01", "name": "Primary Genset 01", "type": "ENERGY", "criticality": "CRITICAL", "capacity_kw": 200.0, "shed_priority": None},
            {"id": "bh_gen_02", "name": "Auxiliary Genset 02", "type": "ENERGY", "criticality": "CRITICAL", "capacity_kw": 200.0, "shed_priority": None},
            {"id": "bh_gen_03", "name": "Emergency Genset 03", "type": "ENERGY", "criticality": "CRITICAL", "capacity_kw": 200.0, "shed_priority": None},
            {"id": "bh_solar_01", "name": "Rooftop Solar PV", "type": "ENERGY", "criticality": "MEDIUM", "capacity_kw": 30.0, "shed_priority": None},
            {"id": "bh_bess_01", "name": "Lithium BESS 200kWh", "type": "ENERGY", "criticality": "HIGH", "capacity_kwh": 200.0, "shed_priority": None},
            {"id": "bh_pdb_01", "name": "Central Switchgear PDB", "type": "ENERGY", "criticality": "CRITICAL", "shed_priority": None},
            {"id": "bh_hvac_01", "name": "Thermal Recovery HVAC", "type": "HVAC", "criticality": "CRITICAL", "load_kw": 62.0, "shed_priority": 3},
            {"id": "bh_water_01", "name": "Snow Melt & RO Plant", "type": "WATER", "criticality": "CRITICAL", "load_kw": 24.0, "freeze_risk_hours": 4.5, "shed_priority": 2},
            {"id": "bh_comms_01", "name": "Satellite Earth Station", "type": "COMMS", "criticality": "HIGH", "load_kw": 12.0, "shed_priority": 4},
            {"id": "bh_lab_01", "name": "Atmospheric Science Lab", "type": "RESEARCH", "criticality": "MEDIUM", "load_kw": 28.0, "shed_priority": 1}
        ]
        for n in nodes:
            self.node_metadata[n["id"]] = n
            self.downstream_edges[n["id"]] = []
            self.upstream_edges[n["id"]] = []

        # Register edges
        edges = [
            ("bh_fuel_tank_01", "bh_gen_01", "SUPPLIES", 1.0),
            ("bh_fuel_tank_02", "bh_gen_02", "SUPPLIES", 1.0),
            ("bh_gen_01", "bh_pdb_01", "POWERS", 1.0),
            ("bh_gen_02", "bh_pdb_01", "POWERS", 1.0),
            ("bh_solar_01", "bh_pdb_01", "POWERS", 0.6),
            ("bh_bess_01", "bh_pdb_01", "SUPPORTS", 0.8),
            ("bh_pdb_01", "bh_hvac_01", "POWERS", 1.0),
            ("bh_pdb_01", "bh_water_01", "POWERS", 0.95),
            ("bh_pdb_01", "bh_comms_01", "POWERS", 0.9),
            ("bh_pdb_01", "bh_lab_01", "POWERS", 0.7),
            ("bh_gen_02", "bh_gen_01", "BACKS_UP", 1.0)
        ]
        for src, dst, rel, weight in edges:
            self.downstream_edges[src].append({"target": dst, "relationship": rel, "weight": weight})
            self.upstream_edges[dst].append({"source": src, "relationship": rel, "weight": weight})

    def calculate_downstream_impact(self, failed_asset_id: str, ambient_temp_c: float = -20.0) -> Dict[str, Any]:
        """
        Calculates cascading downstream consequences if a specific asset fails.
        Returns affected systems, thermal decay timeline, power deficit, and load shed order.
        """
        if failed_asset_id not in self.node_metadata:
            return {"error": f"Asset {failed_asset_id} not found in station topology"}

        failed_node = self.node_metadata[failed_asset_id]
        visited: Set[str] = set()
        queue = deque([(failed_asset_id, 1.0)])
        affected_nodes: List[Dict[str, Any]] = []

        while queue:
            curr_id, current_impact = queue.popleft()
            if curr_id != failed_asset_id:
                meta = self.node_metadata.get(curr_id, {})
                affected_nodes.append({
                    "asset_id": curr_id,
                    "name": meta.get("name", curr_id),
                    "type": meta.get("type", "UNKNOWN"),
                    "criticality": meta.get("criticality", "MEDIUM"),
                    "impact_severity": round(current_impact, 2),
                    "shed_priority": meta.get("shed_priority")
                })

            for edge in self.downstream_edges.get(curr_id, []):
                tgt = edge["target"]
                if tgt not in visited:
                    visited.add(tgt)
                    rel_weight = edge["weight"]
                    queue.append((tgt, current_impact * rel_weight))

        # Specialized consequence calculations for generation loss
        power_deficit_kw = 0.0
        time_to_freeze_hours = 12.0
        critical_systems_at_risk = []
        battery_reserve_hours = 0.0

        if failed_node.get("type") == "ENERGY" and "gen" in failed_asset_id:
            power_deficit_kw = failed_node.get("capacity_kw", 200.0)
            # Battery bridging calculation: 200 kWh battery @ 85% SoC = 170 kWh
            # Critical life support load = 82 kW base - lab 28 kW = 54 kW
            battery_reserve_hours = round(170.0 / 54.0, 1)  # ~3.1 - 3.7 hours
            
            # Thermal decay calculation: Bharati envelope heat loss
            # Rate of cooling dT/dt = (U*A / C_station) * (T_in - T_out)
            # Effective station thermal mass C_station ~ 45,000 kJ/K
            # Time for indoor temp to drop from 21.5C to 5C (freeze risk threshold)
            delta_in_out = max(10.0, 21.5 - ambient_temp_c)
            loss_kw = (0.22 * 1420.0 * delta_in_out) / 1000.0
            # Hours to lose thermal buffer without HVAC:
            time_to_freeze_hours = round(max(1.5, min(14.0, 48.0 / (loss_kw / 25.0))), 1)

            critical_systems_at_risk = [
                {"system": "Snow Melt & RO Potable Water", "risk": "Lines and tank freeze risk", "window_hours": 4.5},
                {"system": "Indoor Habitat Thermal Envelope", "risk": "Temperature drops below +5°C", "window_hours": time_to_freeze_hours},
                {"system": "Atmospheric Science Lab", "risk": "Instruments safe-mode shutdown", "window_hours": 0.5}
            ]

        # Order load shed candidates by priority (1 is shed first)
        load_shed_candidates = [
            n for n in affected_nodes if n.get("shed_priority") is not None
        ]
        load_shed_candidates.sort(key=lambda x: x["shed_priority"])

        return {
            "failed_asset": {
                "id": failed_asset_id,
                "name": failed_node.get("name"),
                "criticality": failed_node.get("criticality")
            },
            "power_deficit_kw": power_deficit_kw,
            "battery_backup_duration_hours": battery_reserve_hours,
            "thermal_decay_to_5c_hours": time_to_freeze_hours,
            "affected_assets_count": len(affected_nodes),
            "affected_assets": affected_nodes,
            "critical_systems_at_risk": critical_systems_at_risk,
            "recommended_load_shedding_order": load_shed_candidates,
            "recommended_mitigation": {
                "action": "ENGAGE_AUXILIARY_GENSET_AND_SHED_LAB_LOAD",
                "step_1": "Immediately trigger Auto-Transfer Switch to start Auxiliary Genset 02 (BH-GEN-02)",
                "step_2": "Shed Non-Critical Science Instrumentation in East Wing Lab (Priority 1, saves 28 kW)",
                "step_3": "Route BESS 200kWh discharge to maintain life support and communications during sync phase",
                "estimated_stabilization_time_minutes": 4.5
            }
        }

asset_graph = StationAssetGraph("station_bharati")
