import copy
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from backend.digital_twin.asset_graph import asset_graph
from backend.digital_twin.physics_engine import physics_engine
from backend.app.optimization.microgrid_solver import microgrid_optimizer
from backend.app.schemas.schemas import EnergyDispatchInputSchema, SimulationRunRequestSchema
from backend.app.services.canonical_state import canonical_state_service


class IsolatedSimulationEngine:
    """
    Production Isolated Simulation Engine satisfying Section 16:
    Current Digital Twin State -> Scenario Clone -> Parameter Modification -> Simulation -> Result -> Impact Analysis.
    
    CRITICAL INVARIANT:
    Never mutates or pollutes observed empirical telemetry or authoritative production state.
    All evaluations are conducted in memory on deep-cloned transient sandboxes.
    """

    SCENARIO_PRESETS = {
        "GENERATOR_FAILURE": {
            "title": "Primary Genset 01 Catastrophic Mechanical Failure",
            "category": "MICROGRID_FAILURE",
            "severity": "CRITICAL",
            "trigger_asset": "bh_gen_01",
            "parameter_mods": {"generator_offline": "bh_gen_01", "load_shed_required": True}
        },
        "EXTREME_WEATHER_POLAR_VORTEX": {
            "title": "Deep Polar Vortex & Extreme Chill (-55°C, 42 m/s Wind)",
            "category": "ENVIRONMENTAL_EXTREME",
            "severity": "CRITICAL",
            "trigger_asset": "bh_hab_core",
            "parameter_mods": {"ambient_temp_c": -55.0, "wind_speed_ms": 42.0}
        },
        "FUEL_DELIVERY_DELAY": {
            "title": "Supply Vessel Sea-Ice Trapping (30-Day Resupply Delay)",
            "category": "SUPPLY_CHAIN_CRISIS",
            "severity": "HIGH",
            "trigger_asset": "bh_fuel_tank_01",
            "parameter_mods": {"shipment_delay_days": 30}
        },
        "BATTERY_BESS_FAILURE": {
            "title": "Station Lithium BESS 200kWh Thermal Disconnect",
            "category": "ENERGY_STORAGE_TRIP",
            "severity": "HIGH",
            "trigger_asset": "bh_bess_01",
            "parameter_mods": {"bess_available_kw": 0.0, "battery_soc_pct": 0.0}
        },
        "ENERGY_DEMAND_SURGE": {
            "title": "Mission Equipment Peak Power Surge (+45 kW Scientific Load)",
            "category": "DEMAND_SURGE",
            "severity": "MEDIUM",
            "trigger_asset": "bh_pdb_01",
            "parameter_mods": {"load_increase_kw": 45.0}
        },
        "RENEWABLE_GENERATION_DROP": {
            "title": "Polar Night Total Solar Eclipse / Rime Icing on PV",
            "category": "RENEWABLE_CURTAILMENT",
            "severity": "LOW",
            "trigger_asset": "bh_solar_01",
            "parameter_mods": {"solar_pv_kw": 0.0, "wind_kw": 0.0}
        }
    }

    def execute_isolated_scenario(
        self,
        request: SimulationRunRequestSchema
    ) -> Dict[str, Any]:
        """
        Executes an isolated contingency simulation without altering production telemetry.
        """
        sim_id = str(uuid.uuid4())
        started_at = datetime.now(timezone.utc).isoformat()
        station_id = request.station_id
        preset = self.SCENARIO_PRESETS.get(request.scenario_key, {
            "title": request.scenario_key.replace("_", " ").title(),
            "category": "CUSTOM_CONTINGENCY",
            "severity": request.severity,
            "trigger_asset": "bh_gen_01",
            "parameter_mods": {}
        })

        # 1. Fetch Current Authoritative Production State
        production_state = canonical_state_service.get_canonical_state(station_id)

        # 2. Scenario Clone (Deep Copy ensures absolute memory isolation)
        sim_state = copy.deepcopy(production_state)

        # 3. Apply Parameter Modifications to the clone
        mods = {**preset.get("parameter_mods", {}), **request.parameter_modifications}
        
        baseline_temp = float(production_state["environment"].get("temperature_c", -18.5))
        baseline_wind = float(production_state["environment"].get("wind_speed_ms", 11.2))
        baseline_load = float(production_state["energy"]["current_metrics"].get("total_demand_kw", 112.5))

        sim_temp = float(mods.get("ambient_temp_c", baseline_temp))
        sim_wind = float(mods.get("wind_speed_ms", baseline_wind))
        sim_load = float(baseline_load + mods.get("load_increase_kw", 0.0))

        # 4. Simulation Execution on Cloned Sandbox
        # Run physics coupling under modified environment
        sim_phys = physics_engine.calculate_state(
            ambient_temp_c=sim_temp,
            wind_speed_ms=sim_wind,
            simulation_id=sim_id
        )

        # Re-dispatch microgrid under failure conditions
        generators = copy.deepcopy(sim_state["assets"])
        active_gens = [
            {"id": a["id"], "name": a["name"], "rated_kw": 200.0, "min_kw": 40.0, "status": a["status"]}
            for a in generators if "gen" in a.get("id", "").lower()
        ]

        if "generator_offline" in mods:
            failed_gen_id = mods["generator_offline"]
            for g in active_gens:
                if g["id"] == failed_gen_id:
                    g["status"] = "OFFLINE"

        bess_soc = 0.0 if "bess_available_kw" in mods and mods["bess_available_kw"] == 0 else float(sim_state["energy"]["current_metrics"].get("battery_charge_pct", 75.0))
        solar_gen = 0.0 if "solar_pv_kw" in mods and mods["solar_pv_kw"] == 0 else float(sim_phys["microgrid_state"].get("solar_generation_kw", 14.5))

        dispatch_req = EnergyDispatchInputSchema(
            station_id=station_id,
            current_load_kw=sim_load,
            solar_pv_generation_kw=solar_gen,
            wind_generation_kw=0.0,
            battery_current_soc_pct=max(5.0, bess_soc),
            available_generators=active_gens
        )
        sim_dispatch = microgrid_optimizer.solve_dispatch(dispatch_req)

        # Run downstream cascading failure analysis
        cascade_impact = asset_graph.calculate_downstream_impact(
            preset.get("trigger_asset", "bh_gen_01"),
            sim_temp
        )

        # Logistics impact (if delayed)
        delay_days = int(mods.get("shipment_delay_days", 0))
        sim_logistics = []
        for item in sim_state.get("logistics", []):
            curr_stock = float(item.get("current_stock", 1000.0))
            burn_rate = float(item.get("daily_burn_rate", 10.0))
            nominal_days = round(curr_stock / max(0.1, burn_rate), 1)
            sim_days = round(max(0.0, nominal_days - delay_days), 1)
            risk = "CRITICAL" if sim_days < 15.0 else ("HIGH" if sim_days < 30.0 else "LOW")
            sim_logistics.append({
                "item_id": item.get("id"),
                "name": item.get("name"),
                "category": item.get("category"),
                "nominal_runway_days": nominal_days,
                "simulated_runway_days": sim_days,
                "delay_incurred_days": delay_days,
                "shortage_risk": risk
            })

        # 5. Impact Analysis & Mitigation Protocols
        impact_analysis = {
            "power_deficit_kw": max(0.0, sim_load - sim_dispatch["generators_total_kw"] - sim_dispatch["renewable_contribution_kw"]),
            "spinning_reserve_margin_pct": sim_dispatch["spinning_reserve_margin_pct"],
            "reserve_breach": not sim_dispatch["reserve_constraint_satisfied"],
            "thermal_freeze_window_hours": cascade_impact["thermal_decay_to_5c_hours"],
            "subsystems_affected_count": cascade_impact["affected_assets_count"],
            "critical_subsystems_compromised": cascade_impact["critical_systems_at_risk"],
            "fuel_burn_delta_lph": round(sim_dispatch["total_fuel_burn_lph"] - float(sim_phys["generator_state"]["fuel_flow_lph"]), 2),
            "logistics_shortage_critical_count": sum(1 for l in sim_logistics if l["shortage_risk"] == "CRITICAL")
        }

        recommendations = [
            {
                "step": 1,
                "action": "AUTOMATED_LOAD_SHEDDING",
                "target": cascade_impact["recommended_load_shedding_order"],
                "rationale": "Preserve 415V bus frequency and isolate non-essential scientific experiments"
            },
            {
                "step": 2,
                "action": "START_AUXILIARY_GENSET",
                "target": "bh_gen_02",
                "rationale": "Restore spinning reserve margin to > 20% within 180 seconds"
            },
            {
                "step": 3,
                "action": "ENABLE_HEAT_RECOVERY_BYPASS",
                "target": "bh_hvac_01",
                "rationale": f"Slow indoor thermal decay (currently {cascade_impact['thermal_decay_to_5c_hours']}h until freezing)"
            }
        ]

        result = {
            "simulation_id": sim_id,
            "scenario_key": request.scenario_key,
            "station_id": station_id,
            "title": preset["title"],
            "category": preset["category"],
            "severity": preset["severity"],
            "initial_state_fingerprint": production_state["state_fingerprint"],
            "parameter_modifications": mods,
            "impact_analysis": impact_analysis,
            "optimal_contingency_dispatch": sim_dispatch,
            "logistics_projections": sim_logistics,
            "recommended_mitigations": recommendations,
            "operator_review_status": "PENDING_REVIEW",
            "isolated_from_telemetry": True,
            "execution_provenance": "ISOLATED_SCENARIO_ENGINE_MEMORY_SANDBOX",
            "started_at": started_at,
            "completed_at": datetime.now(timezone.utc).isoformat()
        }

        return result


isolated_simulation_engine = IsolatedSimulationEngine()
