import time
import json
from datetime import datetime, timezone
from typing import Dict, Any, List
from backend.database.supabase_client import supabase_client
from backend.digital_twin.physics_engine import physics_engine
from backend.digital_twin.asset_graph import asset_graph
from backend.ai.anomaly_detector import anomaly_detector
from backend.simulation.scenario_engine import simulation_engine

class KillerDemoOrchestrator:
    """
    Deterministic End-to-End Killer Demonstration Runner for POLAR-TWIN.
    Executes the full closed loop:
    BASELINE -> SHOCK -> ANOMALY -> AI DETECTION -> TRANSITION ->
    FAILURE -> WHAT-IF -> RECOMMENDATION -> OPERATOR APPROVAL -> STABILIZATION -> AUDIT.
    """
    def __init__(self):
        self.current_step = 0
        self.last_run_state: Dict[str, Any] = {}

    def get_demo_steps(self) -> List[Dict[str, Any]]:
        return [
            {
                "step": 1,
                "title": "Station Baseline Nominal Operation",
                "phase": "OBSERVE",
                "description": "Bharati Antarctic Station operating under nominal summer-transition climate (-18.4°C, 11 m/s wind). Primary Genset 01 supplying 185 kW at 74% load. Health 96.5%."
            },
            {
                "step": 2,
                "title": "Katabatic Wind & Polar Vortex Incursion",
                "phase": "UNDERSTAND",
                "description": "Sudden polar vortex drops ambient temperature to -38.0°C; katabatic gusts reach 34 m/s. Building convective thermal loss surges 88%, driving heating demand from 42 kW to 88 kW."
            },
            {
                "step": 3,
                "title": "Rotating Machinery Anomaly Injection",
                "phase": "UNDERSTAND",
                "description": "Genset 01 turbocharger and main bearing experience thermal friction. Vibration jumps to 4.82 mm/s (ISO warning > 4.5 mm/s), exhaust gas spikes to 468°C."
            },
            {
                "step": 4,
                "title": "AI Multivariate Anomaly Detection",
                "phase": "PREDICT",
                "description": "Mahalanobis detector identifies multidimensional drift with distance D_M = 4.86 (> 3.0 threshold). Explicit feature attribution flags vibration (+3.4σ) and exhaust temp (+3.1σ)."
            },
            {
                "step": 5,
                "title": "Asset Health Degradation & Critical Alert",
                "phase": "PREDICT",
                "description": "Digital Twin state engine escalates Genset 01 to CRITICAL. Health drops to 41.0%. Critical operational alert dispatched to Command Center."
            },
            {
                "step": 6,
                "title": "Genset Trip & What-If Cascade Engine",
                "phase": "SIMULATE",
                "description": "Genset 01 protective breaker trips. What-if engine computes cascading downstream consequences: 185 kW generation deficit, thermal decay to +5°C in 3.8 hours, water treatment line freeze risk."
            },
            {
                "step": 7,
                "title": "Explainable Mitigation Recommendation",
                "phase": "DECIDE",
                "description": "System generates actionable mitigation: 1. Auto-start Aux Genset 02, 2. Shed East Wing Lab load (saves 28 kW), 3. Route BESS 200kWh for grid frequency stabilization."
            },
            {
                "step": 8,
                "title": "Operator Approval & Simulated Stabilization",
                "phase": "DECIDE",
                "description": "Operator authorizes mitigation. Aux Genset 02 synchronizes to bus, non-critical lab is shed, life support & RO heating recover, digital twin stabilizes to 94.0% health, audit log written."
            }
        ]

    def execute_step(self, step_number: int) -> Dict[str, Any]:
        """Executes a specific discrete step of the killer demo."""
        self.current_step = step_number
        now_iso = datetime.now(timezone.utc).isoformat()

        if step_number == 1:
            # Baseline nominal
            updates = {
                "status": "NORMAL",
                "health_score": 96.5,
                "current_state": {
                    "load_pct": 74.0,
                    "rpm": 1500,
                    "exhaust_temp_c": 385.0,
                    "vibration_mms": 2.1,
                    "oil_pressure_bar": 4.6,
                    "fuel_flow_lph": 38.5
                }
            }
            supabase_client.update_row("station_assets", "id", "bh_gen_01", updates)
            # Clear active demo alerts
            supabase_client.query_sql("UPDATE alerts SET status = 'RESOLVED' WHERE station_id = 'station_bharati' AND is_demo = TRUE;")

            return {
                "step": 1,
                "status": "NOMINAL",
                "ambient_temp_c": -18.4,
                "wind_speed_ms": 11.2,
                "station_demand_kw": 185.0,
                "genset_health": 96.5,
                "asset_status": "NORMAL",
                "message": "Station operating in balanced nominal state."
            }

        elif step_number == 2:
            # Cold and wind shock
            phys = physics_engine.calculate_state(ambient_temp_c=-38.0, wind_speed_ms=34.0)
            return {
                "step": 2,
                "status": "ENVIRONMENTAL_SURGE",
                "ambient_temp_c": -38.0,
                "wind_speed_ms": 34.0,
                "heating_demand_kw": phys["thermal_state"]["hvac_heating_demand_kw"],
                "total_demand_kw": phys["microgrid_state"]["total_demand_kw"],
                "generator_load_pct": phys["generator_state"]["load_pct"],
                "message": "Severe environmental incursion detected. Heating demand surged 109%."
            }

        elif step_number == 3:
            # Machinery anomaly injection
            telemetry = {
                "exhaust_temp_c": 468.0,
                "vibration_mms": 4.82,
                "load_pct": 86.0,
                "oil_pressure_bar": 3.4,
                "fuel_flow_lph": 43.8
            }
            supabase_client.update_row("station_assets", "id", "bh_gen_01", {
                "status": "WARNING",
                "health_score": 68.0,
                "current_state": telemetry
            })
            return {
                "step": 3,
                "status": "ANOMALY_INJECTED",
                "telemetry": telemetry,
                "message": "Physical sensor anomalies observed: High vibration and exhaust gas elevation."
            }

        elif step_number == 4:
            # AI Anomaly Detection
            telemetry = {
                "exhaust_temp_c": 468.0,
                "vibration_mms": 4.82,
                "load_pct": 86.0,
                "oil_pressure_bar": 3.4,
                "fuel_flow_lph": 43.8
            }
            ai_res = anomaly_detector.analyze(telemetry, "bh_gen_01")
            
            # Save anomaly to DB
            supabase_client.insert_row("anomalies", {
                "station_id": "station_bharati",
                "asset_id": "bh_gen_01",
                "anomaly_score": ai_res["anomaly_score"],
                "threshold": ai_res["threshold_warning"],
                "model_name": ai_res["model_name"],
                "model_version": ai_res["model_version"],
                "features_analyzed": json.dumps(ai_res["features_analyzed"]),
                "deviant_features": json.dumps(ai_res["deviant_features"]),
                "predicted_failure_risk": ai_res["predicted_failure_risk"],
                "confidence_level": ai_res["confidence_label"],
                "recommended_action": ai_res["recommended_action"],
                "is_demo": True
            })

            return {
                "step": 4,
                "status": "AI_ANOMALY_CONFIRMED",
                "ai_result": ai_res,
                "message": f"Mahalanobis multivariate model flagged abnormal behavior (Score: {ai_res['anomaly_score']})."
            }

        elif step_number == 5:
            # Health drop & Critical Alert
            supabase_client.update_row("station_assets", "id", "bh_gen_01", {
                "status": "CRITICAL",
                "health_score": 41.0
            })
            alert_row = supabase_client.insert_row("alerts", {
                "station_id": "station_bharati",
                "asset_id": "bh_gen_01",
                "title": "CRITICAL: Bharati Primary Genset 01 Bearing & Thermal Anomaly",
                "severity": "CRITICAL",
                "status": "ACTIVE",
                "source_type": "PHYSICS_SYNTHETIC",
                "evidence": json.dumps(["Vibration 4.82 mm/s > 4.5 threshold", "Exhaust temperature 468°C > 420°C"]),
                "predicted_consequence": "Imminent loss of 200 kW primary generation bus. Habitat freeze hazard within 4 hours.",
                "recommended_action": "Execute Emergency Power Transfer to Auxiliary Genset 02 and shed laboratory load.",
                "is_demo": True
            })
            return {
                "step": 5,
                "status": "CRITICAL_ALERT_EMITTED",
                "asset_health": 41.0,
                "alert": alert_row,
                "message": "Critical operational alert triggered and broadcast across all station nodes."
            }

        elif step_number == 6:
            # Genset Failure & What-If Run
            supabase_client.update_row("station_assets", "id", "bh_gen_01", {
                "status": "FAILED",
                "health_score": 15.0,
                "current_state": {"load_pct": 0.0, "rpm": 0, "status": "TRIPPED_OVERHEAT"}
            })
            sim_res = simulation_engine.run_simulation("GENERATOR_FAILURE", "station_bharati", ambient_temp_c=-38.0)
            
            # Save simulation run
            supabase_client.insert_row("simulation_runs", {
                "scenario_name": "GENERATOR_FAILURE",
                "station_id": "station_bharati",
                "trigger_asset_id": "bh_gen_01",
                "severity": "CRITICAL",
                "initial_conditions": json.dumps(sim_res["initial_conditions"]),
                "parameters": json.dumps(sim_res["parameters"]),
                "consequences": json.dumps(sim_res["consequences"]),
                "recommendations": json.dumps(sim_res["recommendations"]),
                "operator_action": "PENDING_REVIEW",
                "is_demo": True
            })
            return {
                "step": 6,
                "status": "GENERATOR_TRIPPED_SIMULATION_ACTIVE",
                "consequences": sim_res["consequences"],
                "message": f"Primary generator tripped. Thermal reserve decaying. Indoor temp drops to +5°C in {sim_res['consequences']['thermal_decay_hours_to_freeze']} hours."
            }

        elif step_number == 7:
            # Mitigation recommendations formulated
            return {
                "step": 7,
                "status": "MITIGATION_FORMULATED",
                "recommendations": [
                    {"step": 1, "title": "Engage Aux Genset 02 (250 kVA)", "benefit": "Restores 200 kW bus power"},
                    {"step": 2, "title": "Shed East Wing Science Lab Racks", "benefit": "Saves 28 kW non-essential load"},
                    {"step": 3, "title": "Deploy BESS 200kWh Frequency Bridge", "benefit": "Stabilizes grid during transfer"}
                ],
                "operator_prompt": "Human Operator Review Required: Approve Simulated Mitigation?",
                "message": "Automated mitigation ready. Awaiting supervisor/operator authorization."
            }

        elif step_number == 8:
            # Operator Approved & Simulated Execution
            # 1. Genset 02 comes online
            supabase_client.update_row("station_assets", "id", "bh_gen_02", {
                "status": "NORMAL",
                "health_score": 98.0,
                "current_state": {"load_pct": 68.0, "rpm": 1500, "exhaust_temp_c": 372.0, "vibration_mms": 1.9, "oil_pressure_bar": 4.7}
            })
            # 2. Lab is shed
            supabase_client.update_row("station_assets", "id", "bh_lab_01", {
                "status": "OFFLINE",
                "current_state": {"power_draw_kw": 0.0, "state": "CONTROLLED_LOAD_SHED"}
            })
            # 3. HVAC and Water recover
            supabase_client.update_row("station_assets", "id", "bh_hvac_01", {
                "status": "NORMAL",
                "health_score": 95.0,
                "current_state": {"indoor_temp_c": 21.5, "heat_output_kw": 92.0}
            })
            # 4. Resolve alerts
            supabase_client.query_sql("UPDATE alerts SET status = 'RESOLVED', resolved_at = NOW() WHERE station_id = 'station_bharati' AND is_demo = TRUE;")
            # 5. Write audit log
            supabase_client.insert_row("audit_logs", {
                "user_id": "operator.sharma",
                "role": "OPERATOR",
                "station_id": "station_bharati",
                "action": "RECOMMENDATION_APPROVED",
                "details": json.dumps({"action": "ENGAGE_AUX_GEN_02_AND_SHED_LAB", "reason": "Killer Demo Automated Resolution", "stabilization_time_sec": 42})
            })

            return {
                "step": 8,
                "status": "STABILIZED",
                "overall_station_health": 94.8,
                "active_genset": "BH-GEN-02 (Auxiliary)",
                "load_shed_status": "East Wing Lab Isolated",
                "life_support": "OPTIMAL",
                "indoor_temp_c": 21.5,
                "message": "Mitigation approved and executed. Station microgrid and thermal loop fully stabilized."
            }

        return {"error": "Invalid step"}

killer_demo = KillerDemoOrchestrator()
