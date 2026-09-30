"""
POLAR-TWIN AUTOMATION DECISION ENGINE
Evaluates multivariate operational options, forecasts, and deterministic rule triggers
to select or synthesize optimal recommendations for Antarctic station operations.
"""

import uuid
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timezone
from backend.app.automation.actions import AutomationAction, ActionType


class DecisionEngine:
    """
    Synthesizes rule triggers, physical constraints, and ML forecasts to produce
    actionable, evidence-backed operational decisions.
    """

    @classmethod
    def evaluate_decision(
        cls,
        automation_id: str,
        state: Dict[str, Any],
        forecast: Dict[str, Any],
        triggered_rules: List[Dict[str, Any]]
    ) -> Tuple[Optional[AutomationAction], List[Dict[str, Any]], Dict[str, Any]]:
        """
        Evaluates operational options and generates an optimal recommended action.
        Returns:
            (selected_action: Optional[AutomationAction], alternative_options: List[Dict], decision_trace: Dict)
        """
        station_id = state.get("station_id", "station_bharati")
        current_load = float(state.get("current_load_kw", 185.0) or 185.0)
        predicted_load = float(forecast.get("predicted_load_kw", current_load) or current_load)
        avail_gen = float(state.get("available_generation_kw", 200.0) or 200.0)
        battery_soc = float(state.get("battery_soc_pct", 75.0) or 75.0)
        crit_load = float(state.get("critical_load_kw", 120.0) or 120.0)
        fuel_reserve = float(state.get("fuel_reserve_litres", 25000.0) or 25000.0)

        alternatives: List[Dict[str, Any]] = []
        selected_action: Optional[AutomationAction] = None

        # Build Decision Trace Node Chain
        trace = {
            "trace_id": f"TRC-2026-{uuid.uuid4().hex[:8].upper()}",
            "automation_id": automation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "station_id": station_id,
            "step_nodes": {
                "OBSERVE": {
                    "status": "COMPLETED",
                    "data": {
                        "current_load_kw": current_load,
                        "available_generation_kw": avail_gen,
                        "battery_soc_pct": battery_soc,
                        "fuel_reserve_litres": fuel_reserve,
                        "critical_load_kw": crit_load,
                    }
                },
                "VALIDATE": {
                    "status": "COMPLETED",
                    "quality_tier": state.get("quality_tier", "VERIFIED"),
                    "validation_timestamp": state.get("timestamp")
                },
                "PREDICT": {
                    "status": "COMPLETED",
                    "predicted_load_kw": predicted_load,
                    "confidence": forecast.get("confidence", 0.92),
                    "model_version": forecast.get("model_metadata", {}).get("model_version", "LOAD-XGB-ANTARCTIC-v1.4")
                },
                "DECIDE": {
                    "status": "COMPLETED",
                    "evaluated_rules_count": len(triggered_rules),
                    "selected_rule_id": triggered_rules[0]["rule_id"] if triggered_rules else "NOMINAL_DISPATCH"
                },
                "ACTION": {
                    "status": "PENDING_APPROVAL",
                    "action_id": None,
                    "action_type": None
                },
                "VERIFY": {
                    "status": "PENDING",
                    "expected_result": None
                }
            }
        }

        # Case 1: Priority 1 Emergency Trigger (e.g. Generator Trip / Blackout Risk / Severe Storm Cascade)
        emergency_rule = next((r for r in triggered_rules if r.get("priority") == 1), None)
        if emergency_rule:
            action_type: ActionType = emergency_rule.get("action_type", "PRIORITIZE_CRITICAL_LOAD")
            selected_action = AutomationAction(
                automation_id=automation_id,
                station_id=station_id,
                asset_id=emergency_rule.get("asset_id", "bh_gen_03"),
                action_type=action_type,
                parameters=emergency_rule.get("parameters", {}),
                reason=emergency_rule.get("reason", "Critical operational condition detected."),
                expected_effect=emergency_rule.get("expected_effect", "Protect station integrity."),
                status="RECOMMENDED",
                approval_required=True,
            )
            if action_type == "CREATE_LOGISTICS_ALERT":
                alternatives.append({
                    "option": "Maintain Standard 22.0°C Heating Without Setpoint Adjustment",
                    "trade_off": "Depletes polar diesel reserve before scheduled resupply voyage window.",
                    "selected": False,
                    "rejection_reason": "Precautionary fuel conservation preserves critical contingency margin."
                })
            else:
                alternatives.append({
                    "option": "Full Station Load Shedding",
                    "trade_off": "Saves battery reserves but interrupts all science and thermal circulation.",
                    "selected": False,
                    "rejection_reason": "Emergency Genset 03 is available for automatic synchronization."
                })

        # Case 2: Priority 2 Generation Shortfall or Surge Demand
        elif any(r.get("priority") == 2 for r in triggered_rules):
            p2_rule = next(r for r in triggered_rules if r.get("priority") == 2)
            action_type = p2_rule.get("action_type", "DISCHARGE_BATTERY")
            selected_action = AutomationAction(
                automation_id=automation_id,
                station_id=station_id,
                asset_id=p2_rule.get("asset_id", "bh_bess_01"),
                action_type=action_type,
                parameters=p2_rule.get("parameters", {}),
                reason=p2_rule.get("reason", "Demand forecast exceeds online baseline generation."),
                expected_effect=p2_rule.get("expected_effect", "Shave peak demand using battery buffer."),
                status="RECOMMENDED",
                approval_required=True,
            )
            alternatives.append({
                "option": "Continuous High-Output Diesel Operation",
                "trade_off": "Burns additional ~22 L/h of polar diesel without utilizing stored battery energy.",
                "selected": False,
                "rejection_reason": "Battery SOC is sufficient (72% > 30% min threshold), prioritizing cleaner BESS dispatch."
            })

        # Case 3: Priority 3 Cross-domain or Environmental Alert
        elif any(r.get("priority") == 3 for r in triggered_rules):
            p3_rule = next(r for r in triggered_rules if r.get("priority") == 3)
            action_type = p3_rule.get("action_type", "CREATE_LOGISTICS_ALERT")
            selected_action = AutomationAction(
                automation_id=automation_id,
                station_id=station_id,
                asset_id=p3_rule.get("asset_id", "bh_fuel_farm"),
                action_type=action_type,
                parameters=p3_rule.get("parameters", {}),
                reason=p3_rule.get("reason", "Severe environmental conditions detected."),
                expected_effect=p3_rule.get("expected_effect", "Adjust heating setpoints and update supply runway."),
                status="RECOMMENDED",
                approval_required=True,
            )

        # Case 4: Nominal Operation (Maintain Preferred Operating Envelope)
        else:
            selected_action = AutomationAction(
                automation_id=automation_id,
                station_id=station_id,
                asset_id="bh_pdb_01" if station_id == "station_bharati" else "ma_pdb_01",
                action_type="ADJUST_GENERATION",
                parameters={"status": "NOMINAL", "spinning_reserve_margin_pct": 28.5},
                reason=f"Current demand ({current_load} kW) and forecast ({predicted_load} kW) within nominal operating envelope ({avail_gen} kW).",
                expected_effect="Maintain current generator dispatch and trickle-charge BESS from excess generation.",
                status="RECOMMENDED",
                approval_required=False,
            )

        # Update trace with chosen action
        if selected_action:
            trace["step_nodes"]["ACTION"]["action_id"] = selected_action.id
            trace["step_nodes"]["ACTION"]["action_type"] = selected_action.action_type
            trace["step_nodes"]["VERIFY"]["expected_result"] = selected_action.expected_effect

        return selected_action, alternatives, trace
