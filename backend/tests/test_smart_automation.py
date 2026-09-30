"""
POLAR-TWIN SMART AUTOMATION COMPREHENSIVE TEST SUITE
Verifies the complete closed-loop Smart Automation architecture:
Observe -> Validate -> Predict -> Decide -> Recommend -> Approve -> Simulate -> Verify -> Audit
"""

import unittest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.automation.validators import DataQualityGate
from backend.app.automation.rules import RuleEngine, STANDARD_AUTOMATION_RULES
from backend.app.automation.ml_forecast import EnergyDemandForecaster
from backend.app.automation.decisions import DecisionEngine
from backend.app.automation.audit import AutomationAuditLedger, audit_ledger
from backend.app.automation.policies import can_user_execute
from backend.app.automation.engine import AutomationStateMachine, automation_engine


class TestSmartAutomation(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)
        self.engine = AutomationStateMachine()

    def test_01_data_quality_gate_valid(self):
        """Test clean nominal telemetry passes data quality gate with VERIFIED tier."""
        clean_state = {
            "station_id": "station_bharati",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "current_load_kw": 185.0,
            "critical_load_kw": 120.0,
            "battery_soc_pct": 78.5,
            "fuel_reserve_litres": 35000.0,
            "ambient_temp_c": -18.0,
            "wind_speed_ms": 12.0
        }
        is_valid, quality_tier, issues, _ = DataQualityGate.validate_state(clean_state)
        self.assertTrue(is_valid, f"Validation failed unexpectedly: {issues}")
        self.assertEqual(quality_tier, "VERIFIED")
        self.assertEqual(len(issues), 0)

    def test_02_data_quality_gate_stale_data_blocks(self):
        """Test stale telemetry (> 15 min old) is flagged and blocks automation."""
        old_ts = (datetime.now(timezone.utc) - timedelta(minutes=25)).isoformat()
        stale_state = {
            "station_id": "station_bharati",
            "timestamp": old_ts,
            "current_load_kw": 185.0,
            "critical_load_kw": 120.0,
            "battery_soc_pct": 78.5,
            "fuel_reserve_litres": 35000.0
        }
        is_valid, quality_tier, issues, _ = DataQualityGate.validate_state(stale_state)
        self.assertFalse(is_valid)
        self.assertEqual(quality_tier, "DEGRADED")
        self.assertTrue(any("STALE" in i for i in issues))

    def test_03_data_quality_gate_out_of_range(self):
        """Test physically impossible sensor values are blocked."""
        bad_state = {
            "station_id": "station_bharati",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "current_load_kw": 99999.0,  # Physically impossible for station
            "battery_soc_pct": 140.0,    # > 100%
            "fuel_reserve_litres": -50.0 # Negative fuel
        }
        is_valid, quality_tier, issues, _ = DataQualityGate.validate_state(bad_state)
        self.assertFalse(is_valid)
        self.assertEqual(quality_tier, "INVALID")
        self.assertGreaterEqual(len(issues), 3)

    def test_04_ml_demand_forecasting(self):
        """Test ML demand forecasting, feature engineering, and data provenance transparency."""
        state = {
            "current_load_kw": 200.0,
            "ambient_temp_c": -28.0,
            "wind_speed_ms": 25.0,
            "critical_load_kw": 120.0,
            "occupancy": 18
        }
        forecast = EnergyDemandForecaster.forecast_demand(state, horizon_hours=2)
        self.assertIn("predicted_load_kw", forecast)
        self.assertGreater(forecast["predicted_load_kw"], 200.0)  # Wind-chill increases heating demand
        self.assertIn(forecast["confidence_label"], ["HIGH", "MODERATE"])
        self.assertEqual(forecast["model_metadata"]["data_provenance"], "LABELLED_DEVELOPMENT_SYNTHETIC")
        self.assertIn("mae_kw", forecast["model_metadata"]["evaluation_metrics"])

    def test_05_deterministic_rule_engine(self):
        """Test deterministic operational rules evaluate in correct priority order."""
        rule_engine = RuleEngine()
        # High load surge state
        surge_state = {
            "station_id": "station_bharati",
            "current_load_kw": 850.0,
            "predicted_load_kw": 1050.0,
            "available_generation_kw": 750.0,
            "battery_soc_pct": 72.0,
            "battery_max_discharge_kw": 250.0
        }
        triggered = rule_engine.evaluate_all(surge_state)
        self.assertTrue(len(triggered) > 0)
        # Verify Priority 2 RULE-ENG-001 or RULE-ENG-002 fired
        rule_ids = [r["rule_id"] for r in triggered]
        self.assertTrue("RULE-ENG-001" in rule_ids or "RULE-ENG-002" in rule_ids)

    def test_06_decision_engine_high_demand(self):
        """Test decision engine generates peak-shaving battery recommendation for high demand surge."""
        surge_state = {
            "station_id": "station_bharati",
            "current_load_kw": 850.0,
            "available_generation_kw": 750.0,
            "battery_soc_pct": 72.0,
            "battery_max_discharge_kw": 250.0,
            "critical_load_kw": 600.0,
            "fuel_reserve_litres": 32000.0
        }
        forecast = {"predicted_load_kw": 1050.0, "confidence": 0.94}
        rules = [{"rule_id": "RULE-ENG-001", "priority": 2, "action_type": "DISCHARGE_BATTERY", "parameters": {"discharge_kw": 200.0}, "reason": "Surge demand", "expected_effect": "Peak shave"}]
        action, alts, trace = DecisionEngine.evaluate_decision("AUTO-TEST-01", surge_state, forecast, rules)
        
        self.assertIsNotNone(action)
        self.assertEqual(action.action_type, "DISCHARGE_BATTERY")
        self.assertEqual(action.status, "RECOMMENDED")
        self.assertTrue(action.approval_required)
        self.assertIn("OBSERVE", trace["step_nodes"])
        self.assertIn("DECIDE", trace["step_nodes"])

    def test_07_what_if_generator_failure_cascade(self):
        """Test What-If scenario: sudden generator trip triggers life-support priority and emergency backup."""
        res = self.engine.run_deterministic_scenario("generator_failure", station_id="station_bharati")
        self.assertEqual(res["state_machine_status"], "ACTION_PENDING")
        rec = res["recommended_action"]
        self.assertIsNotNone(rec)
        self.assertEqual(rec["action_type"], "PRIORITIZE_CRITICAL_LOAD")
        self.assertEqual(rec["asset_id"], "bh_gen_03")

    def test_08_cross_domain_blizzard_fuel_cascade(self):
        """Test cross-domain chain: katabatic blizzard -> wind chill -> fuel burn spike -> logistics alert."""
        res = self.engine.run_deterministic_scenario("blizzard_fuel_cascade", station_id="station_bharati")
        self.assertEqual(res["state_machine_status"], "ACTION_PENDING")
        rec = res["recommended_action"]
        self.assertIsNotNone(rec)
        self.assertEqual(rec["action_type"], "CREATE_LOGISTICS_ALERT")
        self.assertIn("runway", rec["reason"].lower())

    def test_09_human_in_the_loop_approval_and_verification(self):
        """Test full human approval workflow: PENDING -> APPROVED -> SIMULATE -> VERIFY -> AUDITED."""
        # 1. Trigger evaluation
        eval_res = self.engine.run_deterministic_scenario("high_demand_surge", station_id="station_bharati")
        action_id = eval_res["recommended_action"]["id"]
        
        # 2. Operator approves
        approval_res = self.engine.approve_action(
            action_id=action_id,
            operator_username="commander.duty",
            operator_role="STATION_COMMANDER"
        )
        
        self.assertEqual(approval_res["status"], "COMPLETED")
        self.assertTrue(approval_res["verification_passed"])
        self.assertIn("AUD-2026-", approval_res["audit_id"])
        self.assertIn("resulting_spinning_reserve_margin_pct", approval_res["simulation_result"])

    def test_10_role_based_security_authorization(self):
        """Test unprivileged role cannot approve consequential actions."""
        self.assertFalse(can_user_execute("VIEWER", "approve_consequential_actions"))
        self.assertFalse(can_user_execute("SCIENTIST", "approve_consequential_actions"))
        self.assertTrue(can_user_execute("STATION_OPERATOR", "approve_consequential_actions"))
        self.assertTrue(can_user_execute("STATION_COMMANDER", "approve_consequential_actions"))
        self.assertTrue(can_user_execute("ADMIN", "approve_consequential_actions"))

    def test_11_cryptographic_audit_ledger(self):
        """Test cryptographic state hashing and tamper-evident chaining."""
        ledger = AutomationAuditLedger()
        rec1 = ledger.record_execution(
            automation_id="AUTO-001",
            station_id="station_bharati",
            trigger_type="THRESHOLD",
            trigger_desc="Test trigger 1",
            input_state={"load": 180.0},
            rule_id="RULE-01",
            model_version="v1.0",
            decision_summary="Test decision",
            action_type="DISCHARGE_BATTERY",
            action_status="COMPLETED",
            operator="op1",
            operator_role="STATION_OPERATOR",
            verification_result="PASSED",
            quality_tier="VERIFIED",
            latency_breakdown_ms={"total_ms": 10.5}
        )
        self.assertTrue(rec1.record_hash is not None)
        self.assertTrue(rec1.input_state_hash is not None)
        self.assertEqual(rec1.chain_prev_hash, "GENESIS_POLAR_TWIN_2026_AUDIT_BLOCK")

        rec2 = ledger.record_execution(
            automation_id="AUTO-002",
            station_id="station_bharati",
            trigger_type="ANOMALY",
            trigger_desc="Test trigger 2",
            input_state={"load": 220.0},
            rule_id="RULE-02",
            model_version="v1.0",
            decision_summary="Test decision 2",
            action_type="ADJUST_GENERATION",
            action_status="COMPLETED",
            operator="op2",
            operator_role="STATION_COMMANDER",
            verification_result="PASSED",
            quality_tier="VERIFIED",
            latency_breakdown_ms={"total_ms": 12.1}
        )
        self.assertEqual(rec2.chain_prev_hash, rec1.record_hash)

    def test_12_api_integration_status_and_scenario(self):
        """Test FastAPI REST endpoints for Smart Automation."""
        # 1. GET status
        r_status = self.client.get("/api/automation/status?station_id=station_bharati")
        self.assertEqual(r_status.status_code, 200)
        self.assertIn("supported_scenarios", r_status.json())

        # 2. POST scenario
        r_scen = self.client.post("/api/automation/scenario", json={
            "scenario_key": "high_demand_surge",
            "station_id": "station_bharati",
            "operator_role": "STATION_OPERATOR"
        })
        self.assertEqual(r_scen.status_code, 200)
        data = r_scen.json()
        self.assertIn("execution_id", data)
        self.assertIn("decision_trace", data)

        # 3. GET history
        r_hist = self.client.get("/api/automation/history")
        self.assertEqual(r_hist.status_code, 200)
        self.assertIn("audits", r_hist.json())


if __name__ == "__main__":
    unittest.main()
