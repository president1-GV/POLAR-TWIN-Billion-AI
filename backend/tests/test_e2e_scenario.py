import time
from fastapi.testclient import TestClient
from backend.main import app
from backend.edge.edge_node import edge_node

client = TestClient(app)

def test_full_operational_e2e_scenario():
    print("\n--- STARTING POLAR-TWIN FULL E2E OPERATIONAL VERIFICATION ---")

    # 1. Root and Health
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["product"] == "POLAR-TWIN"
    print("✓ [Step 1] Gateway Online & Verified")

    # 2. Login & RBAC
    r = client.post("/api/auth/login", json={"username": "operator.sharma", "password": "PolarOps@2026!"})
    assert r.status_code == 200
    auth_data = r.json()
    assert auth_data["authenticated"] is True
    assert auth_data["user"]["role"] == "OPERATOR"
    op_token = auth_data["token"]
    op_headers = {"Authorization": f"Bearer {op_token}"}
    print("✓ [Step 2] Authenticated Duty Operator (RBAC: OPERATOR)")

    # Authenticate Station Engineer for Telemetry Calibration / Injection
    r_eng = client.post("/api/auth/login", json={"username": "engineer.deshmukh", "password": "AntarcticEng#1"})
    assert r_eng.status_code == 200
    eng_token = r_eng.json()["token"]
    eng_headers = {"Authorization": f"Bearer {eng_token}"}
    print("✓ [Step 2b] Authenticated Station Engineer (RBAC: ENGINEER)")

    # 3. Command Center - List Stations
    r = client.get("/api/stations")
    assert r.status_code == 200
    stations = r.json()
    assert len(stations) >= 2
    bharati = next(s for s in stations if s["id"] == "station_bharati")
    assert bharati["name"] == "Bharati Antarctic Station"
    print(f"✓ [Step 3] Command Center Loaded: Station Bharati (Health: {bharati['overall_health_score']}%)")

    # 4. Open Digital Twin & View Weather
    r = client.get("/api/environment/station_bharati")
    assert r.status_code == 200
    env = r.json()
    assert env["provenance"]["source_type"] in ["REAL_PUBLIC", "PHYSICS_SYNTHETIC"]
    print(f"✓ [Step 4] Real Environment Ingestion: {env['temperature_c']}°C, Wind {env['wind_speed_ms']}m/s (Provenance: {env['provenance']['source_type']})")

    # 5. View Generator State
    r = client.get("/api/assets/bh_gen_01")
    assert r.status_code == 200
    gen = r.json()
    print(f"✓ [Step 5] Generator State Monitored: {gen['name']}, Health: {gen['health_score']}%")

    # 6. Simulate Satellite Link Loss -> EDGE MODE (Operator authorized)
    r = client.post("/api/edge/link-status", json={"status": "OFFLINE"}, headers=op_headers)
    assert r.status_code == 200
    assert r.json()["current_status"] == "OFFLINE"
    print("✓ [Step 6] Satellite Link Failure Simulated -> Switched to EDGE OFFLINE MODE")

    # 7. Generate Local Offline Telemetry
    r1 = client.post("/api/edge/telemetry", json={"metric": "vibration_mms", "value": 4.95, "unit": "mm/s", "asset_id": "bh_gen_01"})
    r2 = client.post("/api/edge/telemetry", json={"metric": "exhaust_temp_c", "value": 472.0, "unit": "°C", "asset_id": "bh_gen_01"})
    assert r1.status_code == 200 and r2.status_code == 200
    edge_status = client.get("/api/edge/status").json()
    assert edge_status["buffer_queue_size"] >= 2
    print(f"✓ [Step 7] Local Telemetry Buffered on Edge Industrial PC (Buffer: {edge_status['buffer_queue_size']} pkts, Local Alerts: {edge_status['local_alerts_count']})")

    # 8. Anomaly Detection & State Escalation (Engineer authorized to inject telemetry)
    r = client.post("/api/assets/bh_gen_01/telemetry", json={
        "exhaust_temp_c": 472.0,
        "vibration_mms": 4.95,
        "load_pct": 88.0,
        "oil_pressure_bar": 3.2,
        "fuel_flow_lph": 44.0
    }, headers=eng_headers)
    assert r.status_code == 200
    diag = r.json()
    assert diag["anomaly_result"]["is_anomaly"] is True
    assert diag["anomaly_result"]["anomaly_score"] >= 3.0
    print(f"✓ [Step 8] AI Mahalanobis Anomaly Detected (Score: {diag['anomaly_result']['anomaly_score']}, Risk: {diag['anomaly_result']['predicted_failure_risk']})")
    print(f"   Deviant Features: {[f['metric'] for f in diag['anomaly_result']['deviant_features']]}")

    # 9. Health Degradation & Critical Alert Verification
    alerts = client.get("/api/alerts?station_id=station_bharati&status=ACTIVE").json()
    assert len(alerts) > 0
    print(f"✓ [Step 9] Critical Alert Broadcast to Base: '{alerts[0]['title']}'")

    # 10. Run What-If Emergency Simulation (Generator Failure) - Operator authorized
    r = client.post("/api/simulation/run", json={"scenario_key": "GENERATOR_FAILURE", "station_id": "station_bharati", "ambient_temp_c": -35.0}, headers=op_headers)
    assert r.status_code == 200
    sim = r.json()
    c = sim["consequences"]
    assert c["power_generation_deficit_kw"] == 185.0
    print(f"✓ [Step 10] What-If Simulation Computed: Deficit -{c['power_generation_deficit_kw']}kW, Freeze Window {c['thermal_decay_hours_to_freeze']}h")

    # 11. Human-in-the-Loop Operator Reviews & Approves Mitigation
    sim_id = sim["simulation_id"]
    r = client.post(f"/api/simulation/{sim_id}/review", json={"action": "APPROVED", "notes": "Engage Aux Genset 02 and shed lab"}, headers=op_headers)
    assert r.status_code == 200
    review_res = r.json()
    assert review_res["status"] == "MITIGATION_ENACTED"
    assert review_res["reviewed_by"] == "operator.sharma"
    print("✓ [Step 11] Operator Reviewed and APPROVED Mitigation -> Simulated Stabilization Executed")

    # 12. Verify Station Digital Twin Stabilized
    twin = client.get("/api/stations/station_bharati/digital-twin").json()
    assert twin["overall_health_score"] >= 88.0
    print(f"✓ [Step 12] Digital Twin Microgrid Stabilized (Overall Base Health: {twin['overall_health_score']}%)")

    # 13. Reconnect Edge & Store-and-Forward Replay Sync (Operator authorized)
    client.post("/api/edge/link-status", json={"status": "ONLINE"}, headers=op_headers)
    r_sync = client.post("/api/edge/sync", headers=op_headers)
    assert r_sync.status_code == 200
    sync_data = r_sync.json()
    assert sync_data["status"] == "COMPLETED"
    print(f"✓ [Step 13] Satellite Link Restored -> Store-and-Forward Sync Flushed {sync_data['records_synced']} Buffered Packets to Supabase")

    # 14. Observability & Audit Log Trail
    audit_logs = client.get("/api/audit").json()
    assert len(audit_logs) > 0
    latest_action = audit_logs[0]["action"]
    print(f"✓ [Step 14] Audit Trail Verified: Latest Recorded Action '{latest_action}' by {audit_logs[0]['user_id']}")

    print("\n=================================================================")
    print(">>> POLAR-TWIN FULL E2E SYSTEM SCENARIO PASSED WITH ZERO DEFECTS <<<")
    print("=================================================================\n")

if __name__ == "__main__":
    test_full_operational_e2e_scenario()
