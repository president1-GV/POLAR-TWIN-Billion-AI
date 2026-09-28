from backend.simulation.scenario_engine import simulation_engine

def test_all_scenarios_deterministic():
    scenario_keys = [
        "GENERATOR_FAILURE",
        "EXTREME_COLD",
        "BLIZZARD",
        "FUEL_SHORTAGE",
        "FUEL_LEAK",
        "COMMUNICATION_LOSS",
        "BATTERY_FAILURE",
        "LOGISTICS_DELAY"
    ]

    for key in scenario_keys:
        res = simulation_engine.run_simulation(key, "station_bharati", ambient_temp_c=-25.0)
        assert res["scenario_key"] == key
        assert res["consequences"] is not None
        assert len(res["recommendations"]) > 0
        assert res["operator_status"] == "PENDING_REVIEW"

def test_generator_failure_cascade():
    res = simulation_engine.run_simulation("GENERATOR_FAILURE", "station_bharati", ambient_temp_c=-35.0)
    c = res["consequences"]
    assert c["power_generation_deficit_kw"] == 185.0
    assert c["thermal_decay_hours_to_freeze"] > 0
    assert len(c["critical_subsystems_at_risk"]) >= 3
    # Check recommendation
    recs = res["recommendations"]
    assert any("AUXILIARY_GENSET" in r["action"] for r in recs)

if __name__ == "__main__":
    test_all_scenarios_deterministic()
    test_generator_failure_cascade()
    print("All emergency simulation scenario tests passed!")
