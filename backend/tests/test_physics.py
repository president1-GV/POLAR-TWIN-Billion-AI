from backend.digital_twin.physics_engine import physics_engine
from backend.digital_twin.asset_graph import asset_graph

def test_physics_thermal_loss():
    # Warm vs cold ambient test
    warm = physics_engine.calculate_state(ambient_temp_c=-10.0, wind_speed_ms=5.0)
    cold = physics_engine.calculate_state(ambient_temp_c=-35.0, wind_speed_ms=5.0)
    
    assert cold["thermal_state"]["heat_loss_kw"] > warm["thermal_state"]["heat_loss_kw"]
    assert cold["microgrid_state"]["total_demand_kw"] > warm["microgrid_state"]["total_demand_kw"]
    assert cold["generator_state"]["fuel_flow_lph"] > warm["generator_state"]["fuel_flow_lph"]

def test_physics_wind_chill_convection():
    calm = physics_engine.calculate_state(ambient_temp_c=-20.0, wind_speed_ms=2.0)
    storm = physics_engine.calculate_state(ambient_temp_c=-20.0, wind_speed_ms=30.0)
    
    assert storm["environment_inputs"]["wind_enhancement_factor"] > calm["environment_inputs"]["wind_enhancement_factor"]
    assert storm["thermal_state"]["hvac_heating_demand_kw"] > calm["thermal_state"]["hvac_heating_demand_kw"]

def test_asset_graph_downstream_cascade():
    impact = asset_graph.calculate_downstream_impact("bh_gen_01", ambient_temp_c=-25.0)
    assert impact["power_deficit_kw"] == 200.0
    assert impact["thermal_decay_to_5c_hours"] > 0
    assert impact["affected_assets_count"] >= 4
    # Ensure load shedding candidates are prioritized
    shed = impact["recommended_load_shedding_order"]
    assert len(shed) > 0
    assert shed[0]["shed_priority"] == 1  # Lab shed first

if __name__ == "__main__":
    test_physics_thermal_loss()
    test_physics_wind_chill_convection()
    test_asset_graph_downstream_cascade()
    print("All physics and asset graph unit tests passed!")
