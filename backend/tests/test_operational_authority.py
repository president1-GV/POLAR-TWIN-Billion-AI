# ==============================================================================
# POLAR-TWIN OPERATIONAL AUTHORITY & ZERO-TRUST SECURITY MATRIX TEST SUITE
# System: Antarctic Operational Digital Twin & Remote Command Platform
# Specifications: Sections 37 & 38 — Defense-in-Depth, Operational RBAC/ABAC
# National Centre for Polar and Ocean Research (NCPOR), MoES, India
# ==============================================================================

import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.security.rbac import (
    CANONICAL_ROLES,
    normalize_role,
    has_permission,
    has_domain_access,
    check_station_scope,
    require_station_access,
    verify_two_person_control,
    OPERATIONAL_AUTHORITIES,
    DOMAIN_SCOPES,
    ACTION_RISK_LEVELS
)
from backend.security.auth_service import auth_service, USER_DATABASE
from fastapi import HTTPException

client = TestClient(app)

class TestOperationalAuthorityMatrix(unittest.TestCase):
    """
    Forensic Verification Suite for Zero-Trust Operational Authority & Security Matrix.
    Verifies that Operational Command != Platform Administration, BOLA scoping is enforced,
    Two-Person control is mandatory for critical safety actions, and Admin Impersonation is audited.
    """

    @classmethod
    def setUpClass(cls):
        # Authenticate all 5 seeded identities
        cls.op_token = cls._login("operator.sharma", "PolarOps@2026!")
        cls.eng_token = cls._login("engineer.deshmukh", "AntarcticEng#1")
        cls.cmdr_token = cls._login("commander.nair", "BaseCommander$9", "123456")
        cls.ctrl_token = cls._login("controller.raman", "MissionCtrl#2026", "123456")
        cls.admin_token = cls._login("admin.ncpor", "NcporMissionControl!2026", "123456")

    @classmethod
    def _login(cls, username, password, mfa=None):
        payload = {"username": username, "password": password}
        if mfa:
            payload["mfa_code"] = mfa
        r = client.post("/api/auth/login", json=payload)
        if r.status_code != 200:
            raise RuntimeError(f"Login failed for {username}: {r.status_code} {r.text}")
        return r.json()["token"]

    def test_01_canonical_operational_roles(self):
        """Verify exactly 5 canonical operational roles exist and are correctly classified."""
        expected_roles = [
            "DUTY_OPERATOR",
            "BASE_ENGINEER",
            "EXPEDITION_CMDR",
            "MISSION_CONTROL",
            "ADMIN"
        ]
        self.assertEqual(sorted(CANONICAL_ROLES), sorted(expected_roles))

        # Check normalization mapping of aliases
        self.assertEqual(normalize_role("OPERATOR"), "DUTY_OPERATOR")
        self.assertEqual(normalize_role("DUTY_OPERATOR"), "DUTY_OPERATOR")
        self.assertEqual(normalize_role("ENGINEER"), "BASE_ENGINEER")
        self.assertEqual(normalize_role("BASE_ENGINEER"), "BASE_ENGINEER")
        self.assertEqual(normalize_role("COMMANDER"), "EXPEDITION_CMDR")
        self.assertEqual(normalize_role("SUPERVISOR"), "EXPEDITION_CMDR")
        self.assertEqual(normalize_role("EXPEDITION_CMDR"), "EXPEDITION_CMDR")
        self.assertEqual(normalize_role("MISSION_CONTROL"), "MISSION_CONTROL")
        self.assertEqual(normalize_role("ADMIN"), "ADMIN")

    def test_02_operational_authorities_classification(self):
        """Verify distinct operational authority models for each role."""
        self.assertEqual(OPERATIONAL_AUTHORITIES["DUTY_OPERATOR"], "STATION_OPS")
        self.assertEqual(OPERATIONAL_AUTHORITIES["BASE_ENGINEER"], "TECHNICAL_OPS")
        self.assertEqual(OPERATIONAL_AUTHORITIES["EXPEDITION_CMDR"], "MISSION_OPS")
        self.assertEqual(OPERATIONAL_AUTHORITIES["MISSION_CONTROL"], "CROSS_STATION_OPS")
        self.assertEqual(OPERATIONAL_AUTHORITIES["ADMIN"], "PLATFORM_GOVERNANCE")

    def test_03_thirteen_domain_scopes(self):
        """Verify operational domain separation across the 13 canonical domains."""
        # Duty Operator & Base Engineer do not have access to SECURITY or PLATFORM SYSTEM
        self.assertTrue(has_domain_access("DUTY_OPERATOR", "INFRASTRUCTURE"))
        self.assertTrue(has_domain_access("DUTY_OPERATOR", "ENERGY"))
        self.assertTrue(has_domain_access("DUTY_OPERATOR", "ENVIRONMENT"))
        self.assertFalse(has_domain_access("DUTY_OPERATOR", "SECURITY"))
        self.assertFalse(has_domain_access("DUTY_OPERATOR", "SYSTEM"))

        # Expedition Commander has PERSONNEL and MISSION access but NOT platform SECURITY
        self.assertTrue(has_domain_access("EXPEDITION_CMDR", "PERSONNEL"))
        self.assertTrue(has_domain_access("EXPEDITION_CMDR", "MISSION"))
        self.assertFalse(has_domain_access("EXPEDITION_CMDR", "SECURITY"))
        self.assertFalse(has_domain_access("EXPEDITION_CMDR", "SYSTEM"))

        # Mission Control has CROSS-STATION AUTOMATION and AUDIT
        self.assertTrue(has_domain_access("MISSION_CONTROL", "AUTOMATION"))
        self.assertTrue(has_domain_access("MISSION_CONTROL", "AUDIT"))
        self.assertFalse(has_domain_access("MISSION_CONTROL", "SECURITY"))

        # Admin has full platform governance
        self.assertTrue(has_domain_access("ADMIN", "SECURITY"))
        self.assertTrue(has_domain_access("ADMIN", "SYSTEM"))

    def test_04_station_scoping_bola_idor_defense(self):
        """Verify strict station scoping: station officers cannot manipulate other stations."""
        sharma = {"username": "operator.sharma", "role": "DUTY_OPERATOR", "station": "station_bharati"}
        deshmukh = {"username": "engineer.deshmukh", "role": "BASE_ENGINEER", "station": "station_bharati"}
        nair = {"username": "commander.nair", "role": "EXPEDITION_CMDR", "station": "station_bharati"}
        raman = {"username": "controller.raman", "role": "MISSION_CONTROL", "station": "GLOBAL"}
        admin = {"username": "admin.ncpor", "role": "ADMIN", "station": "GLOBAL"}

        # Bharati officers can access Bharati
        self.assertTrue(check_station_scope(sharma, "station_bharati"))
        self.assertTrue(check_station_scope(deshmukh, "station_bharati"))
        self.assertTrue(check_station_scope(nair, "station_bharati"))

        # Bharati officers CANNOT access Maitri (BOLA / IDOR Violation)
        self.assertFalse(check_station_scope(sharma, "station_maitri"))
        self.assertFalse(check_station_scope(deshmukh, "station_maitri"))
        self.assertFalse(check_station_scope(nair, "station_maitri"))

        # require_station_access must raise HTTP 403 Forbidden on violation
        with self.assertRaises(HTTPException) as cm:
            require_station_access("station_maitri", sharma)
        self.assertEqual(cm.exception.status_code, 403)
        self.assertIn("not authorized", str(cm.exception.detail))

        # Mission Control and Admin have cross-station access (Bharati + Maitri)
        self.assertTrue(check_station_scope(raman, "station_bharati"))
        self.assertTrue(check_station_scope(raman, "station_maitri"))
        self.assertTrue(check_station_scope(admin, "station_bharati"))
        self.assertTrue(check_station_scope(admin, "station_maitri"))

    def test_05_operational_command_vs_platform_admin_separation(self):
        """CRITICAL: Operational Commanders never get silent platform administrative access."""
        cmdr_headers = {"Authorization": f"Bearer {self.cmdr_token}"}
        ctrl_headers = {"Authorization": f"Bearer {self.ctrl_token}"}
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

        # 1. Active sessions inspection (/api/auth/active-sessions) is ADMIN ONLY
        r_cmdr_sessions = client.get("/api/auth/active-sessions", headers=cmdr_headers)
        self.assertEqual(r_cmdr_sessions.status_code, 403, "Expedition Commander must NOT access active sessions registry")

        r_ctrl_sessions = client.get("/api/auth/active-sessions", headers=ctrl_headers)
        self.assertEqual(r_ctrl_sessions.status_code, 403, "Mission Control must NOT access active sessions registry")

        r_admin_sessions = client.get("/api/auth/active-sessions", headers=admin_headers)
        self.assertEqual(r_admin_sessions.status_code, 200, "Platform Admin must have access to active sessions")

        # 2. Impersonation endpoint (/api/auth/impersonate) is ADMIN ONLY
        r_cmdr_imp = client.post("/api/auth/impersonate", headers=cmdr_headers, json={"target_username": "operator.sharma"})
        self.assertEqual(r_cmdr_imp.status_code, 403, "Expedition Commander cannot impersonate other identities")

        r_ctrl_imp = client.post("/api/auth/impersonate", headers=ctrl_headers, json={"target_username": "operator.sharma"})
        self.assertEqual(r_ctrl_imp.status_code, 403, "Mission Control cannot impersonate other identities")

    def test_06_admin_impersonation_lifecycle_and_audit(self):
        """Verify full lifecycle of administrative impersonation with audit trails."""
        admin_headers = {"Authorization": f"Bearer {self.admin_token}"}

        # Admin impersonates operator.sharma
        r_imp = client.post("/api/auth/impersonate", headers=admin_headers, json={"target_username": "operator.sharma"})
        self.assertEqual(r_imp.status_code, 200)
        imp_data = r_imp.json()

        self.assertTrue(imp_data["is_impersonating"])
        self.assertEqual(imp_data["impersonated_by"], "admin.ncpor")
        self.assertIn("token", imp_data)

        # Inspect session via /me using the impersonated token
        imp_headers = {"Authorization": f"Bearer {imp_data['token']}"}
        r_me = client.get("/api/auth/me", headers=imp_headers)
        self.assertEqual(r_me.status_code, 200)
        me_data = r_me.json()

        self.assertEqual(me_data["username"], "operator.sharma")
        self.assertTrue(me_data["is_impersonating"])
        self.assertEqual(me_data["impersonated_by"], "admin.ncpor")
        self.assertEqual(me_data["station"], "station_bharati")

        # Stop impersonation
        r_stop = client.post("/api/auth/stop-impersonate", headers=imp_headers)
        self.assertEqual(r_stop.status_code, 200)
        reverted_data = r_stop.json()

        # Reverted back to admin
        self.assertEqual(reverted_data["user"]["username"], "admin.ncpor")
        self.assertFalse(reverted_data["user"]["is_impersonating"])

    def test_07_two_person_control_enforcement(self):
        """Verify Two-Person Control (4-Eyes Principle) for safety-critical operations."""
        # 1. Self-approval must be BLOCKED
        with self.assertRaises(HTTPException) as cm1:
            verify_two_person_control(
                initiator_username="operator.sharma",
                approver_username="operator.sharma",
                action_name="EMERGENCY_BUS_TRANSFER",
                station_id="station_bharati"
            )
        self.assertEqual(cm1.exception.status_code, 403)
        self.assertIn("cannot self-approve", cm1.exception.detail)

        # 2. Non-authorized approver (e.g. operator approving another operator) must be BLOCKED
        with self.assertRaises(HTTPException) as cm2:
            verify_two_person_control(
                initiator_username="engineer.deshmukh",
                approver_username="operator.sharma",
                action_name="CRITICAL_LOAD_SHED",
                station_id="station_bharati"
            )
        self.assertEqual(cm2.exception.status_code, 403)
        self.assertIn("lacks required authority level", cm2.exception.detail)

        # 3. Valid Expedition Commander approval must PASS
        valid_cmdr = verify_two_person_control(
            initiator_username="operator.sharma",
            approver_username="commander.nair",
            action_name="EMERGENCY_BUS_TRANSFER",
            station_id="station_bharati"
        )
        self.assertTrue(valid_cmdr)

        # 4. Valid Mission Control approval must PASS
        valid_ctrl = verify_two_person_control(
            initiator_username="engineer.deshmukh",
            approver_username="controller.raman",
            action_name="MICROGRID_ISLAND_DISPATCH",
            station_id="station_bharati"
        )
        self.assertTrue(valid_ctrl)

        # 5. Valid Admin approval must PASS
        valid_admin = verify_two_person_control(
            initiator_username="commander.nair",
            approver_username="admin.ncpor",
            action_name="EMERGENCY_EVACUATION_PROTOCOL",
            station_id="station_bharati"
        )
        self.assertTrue(valid_admin)

def run_tests():
    suite = unittest.TestLoader().loadTestsFromTestCase(TestOperationalAuthorityMatrix)
    runner = unittest.TextTestRunner(verbosity=2)
    res = runner.run(suite)
    if not res.wasSuccessful():
        raise SystemExit(1)

if __name__ == "__main__":
    run_tests()
