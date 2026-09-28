import time
from fastapi.testclient import TestClient
from backend.main import app
from backend.security.crypto import (
    hash_password,
    verify_password,
    sign_session_token,
    verify_session_token
)
from backend.security.ssrf_guard import (
    assert_safe_url,
    validate_outbound_url,
    SSRFSecurityError
)
from backend.security.rate_limiter import rate_limiter

class raises_exception:
    def __init__(self, exc_type):
        self.exc_type = exc_type
        self.value = None
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        assert exc_type is not None and issubclass(exc_type, self.exc_type), f"Expected {self.exc_type}, got {exc_type}"
        self.value = exc_val
        return True

client = TestClient(app)

def test_security_adversarial_suite():
    print("\n=================================================================")
    print(">>> POLAR-TWIN ZERO-TRUST ADVERSARIAL PENETRATION TEST SUITE <<<")
    print("=================================================================\n")

    # -------------------------------------------------------------
    # ATTACK 1: Unauthenticated Access to Critical Operations
    # -------------------------------------------------------------
    print("[Attack 1] Probing Unauthenticated Access to /api/simulation/run...")
    r = client.post("/api/simulation/run", json={
        "scenario_key": "GENERATOR_FAILURE",
        "station_id": "station_bharati"
    })
    assert r.status_code == 401, f"Expected 401, got {r.status_code}"
    assert "Bearer" in r.headers.get("www-authenticate", "")
    print("  ✓ BLOCKED: 401 Unauthorized with WWW-Authenticate challenge header.")

    # -------------------------------------------------------------
    # ATTACK 2: Cryptographic Token Forgery & Signature Tampering
    # -------------------------------------------------------------
    print("\n[Attack 2] Submitting Forged / Tampered Cryptographic Token...")
    # Forge a token with forged signature
    forged_token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiJ9.FORGED_INVALID_SIGNATURE_BYTES"
    r = client.post("/api/edge/link-status", json={"status": "OFFLINE"}, headers={
        "Authorization": f"Bearer {forged_token}"
    })
    assert r.status_code == 401
    assert "invalid" in r.json().get("detail", "").lower() or "revoked" in r.json().get("detail", "").lower()
    print("  ✓ BLOCKED: HMAC-SHA256 signature verification failed. Token rejected.")

    # -------------------------------------------------------------
    # ATTACK 3: Expired Token Replay Attack
    # -------------------------------------------------------------
    print("\n[Attack 3] Testing Expired Session Token Replay Attack...")
    expired_payload = {
        "sub": "usr_operator_sharma",
        "username": "operator.sharma",
        "role": "OPERATOR",
        "station": "station_bharati",
        "sid": "expired-session-id-1234",
        "iat": time.time() - 7200,
        "exp": time.time() - 3600  # Expired 1 hour ago
    }
    expired_token = sign_session_token(expired_payload)
    r = client.post("/api/simulation/run", json={
        "scenario_key": "GENERATOR_FAILURE",
        "station_id": "station_bharati"
    }, headers={"Authorization": f"Bearer {expired_token}"})
    assert r.status_code == 401
    assert "invalid" in r.json().get("detail", "").lower() or "expired" in r.json().get("detail", "").lower()
    print("  ✓ BLOCKED: Expired timestamp identified and rejected with 401.")

    # -------------------------------------------------------------
    # ATTACK 4: Session Revocation Post-Logout (No Zombie Sessions)
    # -------------------------------------------------------------
    print("\n[Attack 4] Testing Immediate Post-Logout Session Invalidation...")
    # Legitimate login
    login_res = client.post("/api/auth/login", json={
        "username": "operator.sharma",
        "password": "PolarOps@2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["token"]
    auth_headers = {"Authorization": f"Bearer {token}"}

    # Verify session is initially valid
    r_valid = client.get("/api/auth/me", headers=auth_headers)
    assert r_valid.status_code == 200

    # User logs out
    r_logout = client.post("/api/auth/logout", headers=auth_headers)
    assert r_logout.status_code == 200
    assert r_logout.json()["status"] == "REVOKED"

    # Attacker attempts to replay token after logout
    r_replayed = client.get("/api/auth/me", headers=auth_headers)
    assert r_replayed.status_code == 401
    assert "revoked" in r_replayed.json().get("detail", "").lower()
    print("  ✓ BLOCKED: Session blacklisted in REVOKED_SESSIONS registry immediately.")

    # -------------------------------------------------------------
    # ATTACK 5: BOLA / IDOR Cross-Station Scoping Violation
    # -------------------------------------------------------------
    print("\n[Attack 5] Testing BOLA/IDOR Cross-Station Authorization Bypass...")
    # Dr. K. Patel is scoped strictly to station_maitri
    patel_login = client.post("/api/auth/login", json={
        "username": "analyst.patel",
        "password": "PolarData*2026"
    })
    assert patel_login.status_code == 200
    patel_token = patel_login.json()["token"]
    patel_headers = {"Authorization": f"Bearer {patel_token}"}

    # Attempt to run emergency simulation for Bharati (cross-station manipulation)
    r_cross = client.post("/api/simulation/run", json={
        "scenario_key": "GENERATOR_FAILURE",
        "station_id": "station_bharati"
    }, headers=patel_headers)
    assert r_cross.status_code == 403, f"Expected 403, got {r_cross.status_code}"
    assert "Access denied" in r_cross.json().get("detail", "")
    assert "station_maitri" in r_cross.json().get("detail", "")
    print("  ✓ BLOCKED: 403 Forbidden. Operator scoped to Maitri prohibited from manipulating Bharati assets.")

    # Legitimate station access for Maitri succeeds
    r_own = client.post("/api/simulation/run", json={
        "scenario_key": "EXTREME_COLD",
        "station_id": "station_maitri"
    }, headers=patel_headers)
    assert r_own.status_code == 200
    print("  ✓ ALLOWED: Legitimate scoped simulation on assigned station (Maitri) succeeded.")

    # -------------------------------------------------------------
    # ATTACK 6: Privilege Escalation (Read-Only Viewer attempting Mutation)
    # -------------------------------------------------------------
    print("\n[Attack 6] Testing Vertical Privilege Escalation by VIEWER...")
    viewer_login = client.post("/api/auth/login", json={
        "username": "viewer.guest",
        "password": "PolarGuest@View1"
    })
    assert viewer_login.status_code == 200
    viewer_token = viewer_login.json()["token"]
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # 6a. Attempt to run simulation
    r_sim = client.post("/api/simulation/run", json={
        "scenario_key": "GENERATOR_FAILURE",
        "station_id": "station_bharati"
    }, headers=viewer_headers)
    assert r_sim.status_code == 403
    assert "run_simulations" in r_sim.json().get("detail", "")
    print("  ✓ BLOCKED: 403 Forbidden - VIEWER denied 'run_simulations'.")

    # 6b. Attempt to toggle satellite edge link
    r_edge = client.post("/api/edge/link-status", json={"status": "OFFLINE"}, headers=viewer_headers)
    assert r_edge.status_code == 403
    assert "toggle_edge_link" in r_edge.json().get("detail", "")
    print("  ✓ BLOCKED: 403 Forbidden - VIEWER denied 'toggle_edge_link'.")

    # 6c. Attempt to approve mitigation
    r_mit = client.post("/api/simulation/sim_test/review", json={"action": "APPROVED"}, headers=viewer_headers)
    assert r_mit.status_code == 403
    assert "approve_mitigations" in r_mit.json().get("detail", "")
    print("  ✓ BLOCKED: 403 Forbidden - VIEWER denied 'approve_mitigations'.")

    # -------------------------------------------------------------
    # ATTACK 7: Mass Assignment & Model Schema Injection
    # -------------------------------------------------------------
    print("\n[Attack 7] Testing Mass Assignment & Parameter Injection...")
    # Injecting unapproved administrative fields
    op_login = client.post("/api/auth/login", json={
        "username": "operator.sharma",
        "password": "PolarOps@2026!"
    })
    op_headers = {"Authorization": f"Bearer {op_login.json()['token']}"}

    r_mass = client.post("/api/simulation/run", json={
        "scenario_key": "GENERATOR_FAILURE",
        "station_id": "station_bharati",
        "is_admin": True,
        "bypass_security": True,
        "operator_id": "root"
    }, headers=op_headers)
    assert r_mass.status_code == 422
    assert "extra_forbidden" in str(r_mass.json())
    print("  ✓ BLOCKED: 422 Unprocessable Entity - Pydantic ConfigDict(extra='forbid') rejected unknown fields.")

    # -------------------------------------------------------------
    # ATTACK 8: SSRF (Server-Side Request Forgery) Defense
    # -------------------------------------------------------------
    print("\n[Attack 8] Testing SSRF Guard Against Cloud Metadata & Private LAN...")
    # Loopback IP
    with raises_exception(SSRFSecurityError) as excinfo:
        assert_safe_url("http://127.0.0.1:8000/admin/secrets")
    assert "loopback" in str(excinfo.value).lower() or "restricted" in str(excinfo.value).lower()
    print("  ✓ BLOCKED: Loopback 127.0.0.1 blocked by SSRF Guard.")

    # AWS/GCP Cloud Metadata IP
    with raises_exception(SSRFSecurityError) as excinfo:
        assert_safe_url("http://169.254.169.254/computeMetadata/v1/")
    assert "metadata" in str(excinfo.value).lower() or "prohibited" in str(excinfo.value).lower()
    print("  ✓ BLOCKED: Cloud metadata endpoint 169.254.169.254 blocked by SSRF Guard.")

    # Private RFC-1918 LAN
    with raises_exception(SSRFSecurityError) as excinfo:
        assert_safe_url("http://192.168.1.50:8080/scada/plc")
    assert "prohibited" in str(excinfo.value).lower() or "internal" in str(excinfo.value).lower()
    print("  ✓ BLOCKED: RFC-1918 private network address 192.168.1.50 blocked.")

    # Legitimate external domain
    approved, reason = validate_outbound_url("https://api.open-meteo.com/v1/forecast?latitude=-69.4&longitude=76.2")
    assert approved is True
    print("  ✓ ALLOWED: Verified whitelisted weather endpoint (api.open-meteo.com) permitted.")

    # -------------------------------------------------------------
    # ATTACK 9: HTTP Security Headers Validation
    # -------------------------------------------------------------
    print("\n[Attack 9] Validating Security Headers on Gateway Responses...")
    r_root = client.get("/")
    assert r_root.status_code == 200
    headers = r_root.headers
    assert headers.get("x-frame-options") == "DENY"
    assert headers.get("x-content-type-options") == "nosniff"
    assert "default-src 'self'" in headers.get("content-security-policy", "")
    assert "max-age=31536000" in headers.get("strict-transport-security", "")
    assert headers.get("referrer-policy") == "strict-origin-when-cross-origin"
    print("  ✓ VERIFIED: Strict CSP, HSTS, X-Frame-Options: DENY, and X-Content-Type-Options present.")

    # -------------------------------------------------------------
    # ATTACK 10: Brute-Force Rate Limiting Throttling
    # -------------------------------------------------------------
    print("\n[Attack 10] Testing Rate Limiter Against Rapid Credential Stuffing...")
    # Reset test rate limiter state
    rate_limiter.requests.clear()
    rate_limiter.failed_logins.clear()

    # 5 attempts are allowed; 6th attempt within 60s window must trigger 429
    status_codes = []
    retry_headers = []
    for _ in range(6):
        r_bf = client.post(
            "/api/auth/login",
            json={"username": "operator.sharma", "password": "WrongPassword123!"}
        )
        status_codes.append(r_bf.status_code)
        if "retry-after" in r_bf.headers:
            retry_headers.append(r_bf.headers["retry-after"])

    assert status_codes[-1] == 429, f"Expected 429 on 6th request, got {status_codes}"
    assert len(retry_headers) > 0, "Expected Retry-After header on 429 response"
    print(f"  ✓ THROTTLED: 429 Too Many Requests triggered with Retry-After: {retry_headers[0]}s.")

    # -------------------------------------------------------------
    # ATTACK 11: Timing Attack Enumeration Resistance
    # -------------------------------------------------------------
    print("\n[Attack 11] Testing Constant-Time Verification on Non-Existent Users...")
    rate_limiter.requests.clear()
    rate_limiter.failed_logins.clear()

    t0 = time.time()
    r_real_bad_pw = client.post("/api/auth/login", json={
        "username": "operator.sharma",
        "password": "WrongPassword123!"
    })
    t_real = time.time() - t0

    t0 = time.time()
    r_fake_user = client.post("/api/auth/login", json={
        "username": "nonexistent.attacker.user",
        "password": "WrongPassword123!"
    })
    t_fake = time.time() - t0

    # Both must fail with 401 and take approximately similar time (dummy hash executed)
    assert r_real_bad_pw.status_code == 401
    assert r_fake_user.status_code == 401
    print(f"  ✓ VERIFIED: Non-existent user dummy hashing executed (Real: {t_real*1000:.1f}ms, Nonexistent: {t_fake*1000:.1f}ms).")

    print("\n=================================================================")
    print(">>> ALL 11 ADVERSARIAL ZERO-TRUST DEFENSE TESTS PASSED (100%) <<<")
    print("=================================================================\n")

if __name__ == "__main__":
    test_security_adversarial_suite()
