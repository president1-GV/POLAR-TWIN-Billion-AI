from backend.ai.anomaly_detector import anomaly_detector
from backend.ai.predictive_maintenance import predictive_maintenance

def test_anomaly_detector_nominal():
    # Nominal healthy telemetry
    telemetry = {
        "exhaust_temp_c": 385.0,
        "vibration_mms": 2.1,
        "load_pct": 74.0,
        "oil_pressure_bar": 4.6,
        "fuel_flow_lph": 38.5
    }
    res = anomaly_detector.analyze(telemetry, "bh_gen_01")
    assert not res["is_anomaly"]
    assert res["anomaly_score"] < 3.0
    assert res["predicted_failure_risk"] == "NORMAL"

def test_anomaly_detector_multivariate_outlier():
    # Severe turbo vibration & elevated exhaust
    anomaly_telemetry = {
        "exhaust_temp_c": 472.0,
        "vibration_mms": 4.95,
        "load_pct": 88.0,
        "oil_pressure_bar": 3.2,
        "fuel_flow_lph": 44.0
    }
    res = anomaly_detector.analyze(anomaly_telemetry, "bh_gen_01")
    assert res["is_anomaly"]
    assert res["anomaly_score"] >= 3.0
    assert res["predicted_failure_risk"] in ["ELEVATED", "CRITICAL"]
    assert len(res["deviant_features"]) >= 2
    # Ensure vibration feature flagged
    flagged_metrics = [f["metric"] for f in res["deviant_features"]]
    assert "vibration_mms" in flagged_metrics
    assert "exhaust_temp_c" in flagged_metrics

def test_predictive_maintenance_health_decay():
    bad_telemetry = {"vibration_mms": 4.9, "exhaust_temp_c": 465.0, "oil_pressure_bar": 3.1}
    res = predictive_maintenance.evaluate_asset("bh_gen_01", bad_telemetry, {})
    assert res["health_score"] < 50.0
    assert res["predicted_failure_risk"] == "CRITICAL"
    assert res["estimated_rul_hours"] < 20.0

if __name__ == "__main__":
    test_anomaly_detector_nominal()
    test_anomaly_detector_multivariate_outlier()
    test_predictive_maintenance_health_decay()
    print("All AI anomaly detection & predictive maintenance tests passed!")
