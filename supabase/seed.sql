-- ============================================================================
-- POLAR-TWIN: Initial Seed Data for Bharati & Maitri
-- SIH 26060: Digital Platform for Remote Antarctic Station Operations
-- ============================================================================

-- 1. DATA SOURCES
INSERT INTO data_sources (id, name, provenance_type, status, endpoint_url, description, reliability_score)
VALUES
('ds_ncpor_public', 'NCPOR Meteorological Gateway', 'REAL_PUBLIC', 'CONNECTED', 'https://weather.open-meteo.com/v1/forecast', 'Public Antarctic observations & atmospheric measurements for Maitri & Bharati', 0.98),
('ds_physics_synth', 'Physics-Correlated Synthetic Engine', 'PHYSICS_SYNTHETIC', 'CONNECTED', 'internal://polar-twin/physics-engine', 'Calibrated thermal-load-power-fuel differential propagation engine', 0.95),
('ds_edge_sim', 'Station Local Edge Simulator', 'EDGE_SIMULATED', 'CONNECTED', 'mqtt://localhost:1883/antarctic/telemetry', 'Local store-and-forward telemetry node with sequence & CRC validation', 0.92),
('ds_future_iot', 'Station Industrial IoT Gateway (Future)', 'FUTURE_IOT', 'NOT_CONNECTED', 'opc.tcp://edge.bharati.ncpor.res.in:4840', 'Planned RS-485 / Modbus / OPC-UA station SCADA integration', 0.00)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status;

-- 2. STATIONS
INSERT INTO stations (id, station_code, name, region, latitude, longitude, elevation_meters, commissioned_year, operational_status, connectivity_status, primary_power_source, population_capacity, current_occupancy, data_source_id)
VALUES
('station_bharati', 'BHARATI', 'Bharati Antarctic Station', 'Larsemann Hills, East Antarctica', -69.4078, 76.1872, 35.0, 2012, 'ACTIVE', 'ONLINE', '3x 250kVA Kirloskar Gensets + Solar Hybrid', 47, 24, 'ds_ncpor_public'),
('station_maitri', 'MAITRI', 'Maitri Antarctic Station', 'Schirmacher Oasis, Queen Maud Land', -70.7661, 11.7322, 130.0, 1989, 'ACTIVE', 'ONLINE', '4x 125kVA Gensets + Wind Augmentation', 65, 32, 'ds_ncpor_public')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, connectivity_status = EXCLUDED.connectivity_status;

-- 3. ASSET TYPES
INSERT INTO asset_types (id, name, category, icon, criticality)
VALUES
('type_genset', 'Diesel Generator Set', 'ENERGY', 'Zap', 'CRITICAL'),
('type_solar', 'Photovoltaic Array', 'ENERGY', 'Sun', 'MEDIUM'),
('type_wind', 'Wind Turbine', 'ENERGY', 'Wind', 'MEDIUM'),
('type_bess', 'Battery Energy Storage System', 'ENERGY', 'Battery', 'HIGH'),
('type_pdb', 'Power Distribution Bus', 'ENERGY', 'Cpu', 'CRITICAL'),
('type_hvac', 'HVAC & Thermal Heating System', 'HVAC', 'ThermometerSnowflake', 'CRITICAL'),
('type_fuel_tank', 'Polar Diesel Fuel Storage Tank', 'FUEL', 'Flame', 'CRITICAL'),
('type_water_plant', 'Water Treatment & Reverse Osmosis', 'WATER', 'Droplet', 'CRITICAL'),
('type_lab', 'Atmospheric & Geomagnetic Laboratory', 'RESEARCH', 'FlaskConical', 'MEDIUM'),
('type_comms', 'Satellite Earth Station', 'COMMS', 'Radio', 'HIGH'),
('type_helipad', 'Helipad & Tactical Cargo Area', 'LOGISTICS', 'Navigation', 'LOW')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. BHARATI ASSETS
INSERT INTO station_assets (id, station_id, parent_asset_id, asset_type_id, name, code, status, health_score, criticality, location_desc, coordinates_3d, current_state, source_type)
VALUES
-- Power Plant
('bh_gen_01', 'station_bharati', NULL, 'type_genset', 'Primary Genset 01 (250 kVA)', 'BH-GEN-01', 'NORMAL', 96.5, 'CRITICAL', 'Energy Module - Bay 1', '{"x": -10, "y": 2, "z": -5}', '{"load_pct": 74.0, "rpm": 1500, "exhaust_temp_c": 385.0, "vibration_mms": 2.1, "oil_pressure_bar": 4.6, "fuel_flow_lph": 38.5}', 'PHYSICS_SYNTHETIC'),
('bh_gen_02', 'station_bharati', NULL, 'type_genset', 'Auxiliary Genset 02 (250 kVA)', 'BH-GEN-02', 'NORMAL', 98.2, 'CRITICAL', 'Energy Module - Bay 2', '{"x": -7, "y": 2, "z": -5}', '{"load_pct": 0.0, "status": "STANDBY", "rpm": 0, "exhaust_temp_c": 18.0, "vibration_mms": 0.0, "oil_pressure_bar": 0.0}', 'PHYSICS_SYNTHETIC'),
('bh_gen_03', 'station_bharati', NULL, 'type_genset', 'Emergency Backup Genset 03 (250 kVA)', 'BH-GEN-03', 'NORMAL', 100.0, 'CRITICAL', 'Energy Module - Bay 3', '{"x": -4, "y": 2, "z": -5}', '{"load_pct": 0.0, "status": "COLD_STANDBY", "rpm": 0, "exhaust_temp_c": 12.0}', 'PHYSICS_SYNTHETIC'),
('bh_solar_01', 'station_bharati', NULL, 'type_solar', 'Rooftop Bifacial Solar PV (30 kWp)', 'BH-PV-01', 'NORMAL', 92.0, 'MEDIUM', 'Main Building Roof', '{"x": 0, "y": 6, "z": 0}', '{"output_kw": 8.4, "irradiance_wm2": 320.0, "efficiency_pct": 18.2}', 'PHYSICS_SYNTHETIC'),
('bh_bess_01', 'station_bharati', NULL, 'type_bess', 'Station Lithium BESS (200 kWh)', 'BH-BESS-01', 'NORMAL', 95.0, 'HIGH', 'Battery Room B-1', '{"x": -8, "y": 1, "z": -2}', '{"soc_pct": 86.5, "cell_temp_c": 21.4, "discharge_rate_kw": 0.0, "health_pct": 98.0}', 'PHYSICS_SYNTHETIC'),
('bh_pdb_01', 'station_bharati', NULL, 'type_pdb', 'Central Microgrid Switchgear', 'BH-PDB-01', 'NORMAL', 99.0, 'CRITICAL', 'Main Control Room', '{"x": -2, "y": 2, "z": 0}', '{"grid_freq_hz": 50.02, "voltage_v": 415.2, "total_demand_kw": 185.0}', 'PHYSICS_SYNTHETIC'),
-- HVAC & Life Support
('bh_hvac_01', 'station_bharati', NULL, 'type_hvac', 'Dual-Loop Thermal Recovery HVAC', 'BH-HVAC-01', 'NORMAL', 94.0, 'CRITICAL', 'Thermal Plant Room', '{"x": -5, "y": 2, "z": 2}', '{"indoor_temp_c": 21.5, "target_temp_c": 22.0, "heat_output_kw": 95.0, "circulator_flow_lpm": 140.0}', 'PHYSICS_SYNTHETIC'),
('bh_water_01', 'station_bharati', NULL, 'type_water_plant', 'Snow Melt & RO Purification Plant', 'BH-RO-01', 'NORMAL', 97.0, 'CRITICAL', 'Ground Level Utility', '{"x": 5, "y": 1, "z": -4}', '{"daily_output_litres": 3200, "storage_level_pct": 82.0, "conductivity_us": 14.2}', 'PHYSICS_SYNTHETIC'),
-- Fuel Farm
('bh_fuel_tank_01', 'station_bharati', NULL, 'type_fuel_tank', 'Polar Fuel Tank Alpha (100,000 L)', 'BH-TK-01', 'NORMAL', 99.5, 'CRITICAL', 'Bulk Fuel Enclosure', '{"x": 18, "y": 1, "z": -12}', '{"level_litres": 78400, "capacity_litres": 100000, "temp_c": -12.0, "leak_sensor": "OK"}', 'PHYSICS_SYNTHETIC'),
('bh_fuel_tank_02', 'station_bharati', NULL, 'type_fuel_tank', 'Polar Fuel Tank Bravo (100,000 L)', 'BH-TK-02', 'NORMAL', 100.0, 'CRITICAL', 'Bulk Fuel Enclosure', '{"x": 22, "y": 1, "z": -12}', '{"level_litres": 92100, "capacity_litres": 100000, "temp_c": -11.5, "leak_sensor": "OK"}', 'PHYSICS_SYNTHETIC'),
-- Comms & Labs
('bh_comms_01', 'station_bharati', NULL, 'type_comms', 'C-Band / Inmarsat Ground Terminal', 'BH-SAT-01', 'NORMAL', 98.0, 'HIGH', 'Radome Tower', '{"x": 12, "y": 8, "z": 10}', '{"signal_quality_db": 14.8, "uplink_kbps": 2048, "downlink_kbps": 4096, "packet_loss_pct": 0.2}', 'PHYSICS_SYNTHETIC'),
('bh_lab_01', 'station_bharati', NULL, 'type_lab', 'Space & Atmospheric Science Lab', 'BH-LAB-01', 'NORMAL', 96.0, 'MEDIUM', 'East Wing Level 2', '{"x": 8, "y": 4, "z": 4}', '{"cleanroom_pressure_pa": 35.0, "power_draw_kw": 22.5}', 'PHYSICS_SYNTHETIC')
ON CONFLICT (id) DO UPDATE SET health_score = EXCLUDED.health_score, current_state = EXCLUDED.current_state;

-- 4B. MAITRI ASSETS
INSERT INTO station_assets (id, station_id, parent_asset_id, asset_type_id, name, code, status, health_score, criticality, location_desc, coordinates_3d, current_state, source_type)
VALUES
('ma_gen_01', 'station_maitri', NULL, 'type_genset', 'Primary Genset 01 (125 kVA Kirloskar)', 'MA-GEN-01', 'NORMAL', 95.0, 'CRITICAL', 'Power House Bay 1', '{"x": -10, "y": 1.5, "z": -6}', '{"load_pct": 68.0, "rpm": 1500, "exhaust_temp_c": 360.0, "vibration_mms": 1.9, "oil_pressure_bar": 4.4, "fuel_flow_lph": 24.2}', 'PHYSICS_SYNTHETIC'),
('ma_gen_02', 'station_maitri', NULL, 'type_genset', 'Primary Genset 02 (125 kVA Kirloskar)', 'MA-GEN-02', 'NORMAL', 94.5, 'CRITICAL', 'Power House Bay 2', '{"x": -7, "y": 1.5, "z": -6}', '{"load_pct": 52.0, "rpm": 1500, "exhaust_temp_c": 340.0, "vibration_mms": 1.7, "oil_pressure_bar": 4.5, "fuel_flow_lph": 20.0}', 'PHYSICS_SYNTHETIC'),
('ma_gen_03', 'station_maitri', NULL, 'type_genset', 'Auxiliary Genset 03 (125 kVA)', 'MA-GEN-03', 'NORMAL', 98.0, 'HIGH', 'Power House Bay 3', '{"x": -4, "y": 1.5, "z": -6}', '{"load_pct": 0.0, "status": "HOT_STANDBY", "rpm": 0, "exhaust_temp_c": 22.0}', 'PHYSICS_SYNTHETIC'),
('ma_wind_01', 'station_maitri', NULL, 'type_wind', 'Micro-Wind Turbine Array (15 kW)', 'MA-WIND-01', 'NORMAL', 91.0, 'MEDIUM', 'North Moraine Ridge', '{"x": 16, "y": 8, "z": -14}', '{"output_kw": 11.2, "rotor_rpm": 64.0, "wind_speed_ms": 14.5}', 'PHYSICS_SYNTHETIC'),
('ma_pdb_01', 'station_maitri', NULL, 'type_pdb', 'Maitri Central Switchgear & Bus', 'MA-PDB-01', 'NORMAL', 97.5, 'CRITICAL', 'Central Control Block', '{"x": -2, "y": 1.5, "z": 0}', '{"grid_freq_hz": 49.98, "voltage_v": 415.0, "total_demand_kw": 160.0}', 'PHYSICS_SYNTHETIC'),
('ma_boiler_01', 'station_maitri', NULL, 'type_hvac', 'Central Hydronic Space Heating Boiler', 'MA-BLR-01', 'NORMAL', 93.0, 'CRITICAL', 'Thermal Plant Annex', '{"x": -5, "y": 1.5, "z": 2}', '{"water_supply_temp_c": 72.0, "return_temp_c": 58.0, "thermal_output_kw": 110.0}', 'PHYSICS_SYNTHETIC'),
('ma_water_pump_01', 'station_maitri', NULL, 'type_water_plant', 'Lake Priyadarshini Water Pump House', 'MA-PUMP-01', 'NORMAL', 94.0, 'CRITICAL', 'Lake Priyadarshini Shore', '{"x": 18, "y": 0.5, "z": 8}', '{"intake_temp_c": 1.8, "flow_rate_lpm": 85.0, "heat_trace_status": "ACTIVE"}', 'PHYSICS_SYNTHETIC'),
('ma_water_tank_01', 'station_maitri', NULL, 'type_water_plant', 'Potable Water Storage Reservoir', 'MA-RES-01', 'NORMAL', 96.0, 'HIGH', 'Utility Wing', '{"x": 6, "y": 1.5, "z": 4}', '{"level_pct": 78.5, "volume_litres": 23550, "water_temp_c": 12.0}', 'PHYSICS_SYNTHETIC'),
('ma_fuel_tank_01', 'station_maitri', NULL, 'type_fuel_tank', 'Polar Fuel Tank Alpha (75,000 L)', 'MA-TK-01', 'NORMAL', 98.0, 'CRITICAL', 'Fuel Farm Pad', '{"x": -16, "y": 1.2, "z": 10}', '{"level_litres": 58200, "capacity_litres": 75000, "temp_c": -14.0}', 'PHYSICS_SYNTHETIC'),
('ma_comms_01', 'station_maitri', NULL, 'type_comms', 'Inmarsat & HF Communications Array', 'MA-SAT-01', 'NORMAL', 96.5, 'HIGH', 'Comms Tower Hill', '{"x": 12, "y": 6, "z": -4}', '{"signal_quality_db": 13.9, "link_status": "ONLINE", "uplink_kbps": 1536}', 'PHYSICS_SYNTHETIC'),
('ma_lab_geo', 'station_maitri', NULL, 'type_lab', 'Geomagnetic & Seismological Lab', 'MA-GEO-01', 'NORMAL', 99.0, 'MEDIUM', 'Isolated Non-Magnetic Hut', '{"x": -14, "y": 1.2, "z": -14}', '{"magnetic_field_nt": 42150.0, "seismic_noise": "LOW"}', 'PHYSICS_SYNTHETIC'),
('ma_garage_01', 'station_maitri', NULL, 'type_helipad', 'Vehicle Maintenance Garage & Sledges', 'MA-GAR-01', 'NORMAL', 95.0, 'LOW', 'Heavy Logistics Pad', '{"x": 10, "y": 1.5, "z": 14}', '{"vehicles_ready": 4, "heater_active": true}', 'PHYSICS_SYNTHETIC')
ON CONFLICT (id) DO UPDATE SET health_score = EXCLUDED.health_score, current_state = EXCLUDED.current_state;

-- 5. ASSET RELATIONSHIPS (GRAPH)
INSERT INTO asset_relationships (station_id, source_asset_id, target_asset_id, relationship_type, impact_weight, description)
VALUES
('station_bharati', 'bh_fuel_tank_01', 'bh_gen_01', 'SUPPLIES', 1.00, 'Polar diesel gravity/boost supply line to Genset 01'),
('station_bharati', 'bh_gen_01', 'bh_pdb_01', 'POWERS', 1.00, 'Primary generator feeding 415V distribution bus'),
('station_bharati', 'bh_pdb_01', 'bh_hvac_01', 'POWERS', 0.95, 'Grid powering dual-loop heating and ventilation units'),
('station_bharati', 'bh_pdb_01', 'bh_water_01', 'POWERS', 0.90, 'Grid powering snow-melt heating coil and RO pumps'),
('station_bharati', 'bh_pdb_01', 'bh_comms_01', 'POWERS', 0.85, 'UPS-backed power to Satellite earth station'),
('station_bharati', 'bh_pdb_01', 'bh_lab_01', 'POWERS', 0.70, 'Power to scientific instrumentation racks'),
('station_bharati', 'bh_gen_02', 'bh_gen_01', 'BACKS_UP', 1.00, 'Auto-start sync transfer backup if Gen-01 drops'),
('station_bharati', 'bh_bess_01', 'bh_pdb_01', 'SUPPORTS', 0.80, 'Peak shaving and transient microgrid frequency stabilization'),
-- Maitri Relationships
('station_maitri', 'ma_fuel_tank_01', 'ma_gen_01', 'SUPPLIES', 1.00, 'Polar diesel feed to Genset 01'),
('station_maitri', 'ma_fuel_tank_01', 'ma_boiler_01', 'SUPPLIES', 1.00, 'Fuel line to central hydronic boiler'),
('station_maitri', 'ma_gen_01', 'ma_pdb_01', 'POWERS', 1.00, 'Generator 01 powering Maitri 415V bus'),
('station_maitri', 'ma_gen_02', 'ma_pdb_01', 'POWERS', 0.90, 'Generator 02 load sharing on microgrid bus'),
('station_maitri', 'ma_wind_01', 'ma_pdb_01', 'SUPPORTS', 0.75, 'Wind turbine renewable feed to station bus'),
('station_maitri', 'ma_pdb_01', 'ma_boiler_01', 'POWERS', 0.95, 'Electrical supply to boiler circulating pumps'),
('station_maitri', 'ma_pdb_01', 'ma_water_pump_01', 'POWERS', 0.95, 'Power to Lake Priyadarshini water pump and heated line trace'),
('station_maitri', 'ma_water_pump_01', 'ma_water_tank_01', 'SUPPLIES', 0.95, 'Heated water pipe charging station storage reservoir'),
('station_maitri', 'ma_pdb_01', 'ma_comms_01', 'POWERS', 0.85, 'Power to satellite terminal and HF masts'),
('station_maitri', 'ma_pdb_01', 'ma_lab_geo', 'POWERS', 0.70, 'Power to geomagnetic sensors')
ON CONFLICT DO NOTHING;

-- 6. LOGISTICS INVENTORY
INSERT INTO logistics_items (id, station_id, category, name, sku, current_stock, unit, daily_burn_rate, minimum_reserve, days_remaining, shortage_risk_level, storage_location)
VALUES
('inv_bh_fuel', 'station_bharati', 'FUEL', 'Aviation Jet A-1 / Polar Diesel (Additised)', 'POL-DSL-A1', 170500, 'LITRES', 915.0, 35000, 186.3, 'LOW', 'Bulk Fuel Tanks 01 & 02'),
('inv_bh_food', 'station_bharati', 'FOOD', 'Long-Shelf Freeze-Dried & Frozen Rations', 'RAT-POL-FOOD', 4320, 'MAN_DAYS', 24.0, 1200, 180.0, 'LOW', 'Main Deep Freeze & Dry Pantry'),
('inv_bh_med', 'station_bharati', 'MEDICAL', 'Emergency Trauma & Surgical Consumables', 'MED-TRM-KIT', 95, 'KITS', 0.15, 30, 633.0, 'LOW', 'Station Medical Bay Dispensary'),
('inv_bh_spares', 'station_bharati', 'SPARE_PARTS', 'Kirloskar 250kVA Turbo & Filter Maintenance Sets', 'KIR-FLT-SET', 14, 'UNITS', 0.05, 5, 280.0, 'LOW', 'Heavy Spares Container B4'),
('inv_bh_water', 'station_bharati', 'WATER', 'Treated Potable Water Storage', 'H2O-POT-L', 16500, 'LITRES', 1200.0, 4000, 13.8, 'MEDIUM', 'Insulated Buffer Storage Bladders'),
-- Maitri Inventory Items
('inv_ma_fuel', 'station_maitri', 'FUEL', 'Polar Diesel Grade A-1 (Low Temp)', 'POL-DSL-MA-01', 58200, 'LITRES', 680.0, 18000, 85.6, 'LOW', 'Fuel Farm Pad Tanks'),
('inv_ma_food', 'station_maitri', 'FOOD', 'Sub-Zero Freeze-Dried & Tinned Provisions', 'RAT-MA-FOOD', 3600, 'MAN_DAYS', 20.0, 900, 180.0, 'LOW', 'Main Block Cold Store'),
('inv_ma_med', 'station_maitri', 'MEDICAL', 'High-Altitude Polar Trauma & Hypothermia Packs', 'MED-MA-HYPO', 60, 'KITS', 0.1, 15, 600.0, 'LOW', 'Maitri Medical Dispensary'),
('inv_ma_spares', 'station_maitri', 'SPARE_PARTS', 'Kirloskar 125kVA Genset Overhaul & Filter Kits', 'KIR-MA-FLT', 8, 'UNITS', 0.04, 2, 200.0, 'LOW', 'Workshop & Garage'),
('inv_ma_water', 'station_maitri', 'WATER', 'Lake Priyadarshini Potable Water Buffer', 'H2O-PRIYA-MA', 23550, 'LITRES', 1100.0, 6000, 21.4, 'MEDIUM', 'Potable Water Storage Reservoir')
ON CONFLICT (id) DO UPDATE SET current_stock = EXCLUDED.current_stock, days_remaining = EXCLUDED.days_remaining;

-- 7. SHIPMENTS
INSERT INTO shipments (id, vessel_name, voyage_number, departure_port, destination_station_id, scheduled_departure, scheduled_arrival, delay_days, status, cargo_manifest)
VALUES
('ship_vasiliy_44', 'MV Vasiliy Golovnin', 'V44-IND-ANTARCTIC', 'Cape Town, South Africa', 'station_bharati', '2026-11-20 08:00:00Z', '2026-12-15 14:00:00Z', 0, 'SCHEDULED', 
 '[{"item": "Polar Diesel Fuel", "quantity": 180000, "unit": "Litres"}, {"item": "Heavy Genset Overhaul Kit", "quantity": 3, "unit": "Sets"}, {"item": "Fresh Expedition Rations", "quantity": 3500, "unit": "Kg"}]'::jsonb),
('ship_papanin_44', 'MV Ivan Papanin', 'V44-MAITRI-EXP', 'Cape Town, South Africa', 'station_maitri', '2026-11-25 06:00:00Z', '2026-12-28 12:00:00Z', 0, 'SCHEDULED', 
 '[{"item": "Arctic Diesel Fuel", "quantity": 120000, "unit": "Litres"}, {"item": "Kirloskar 125kVA Overhaul Modules", "quantity": 4, "unit": "Sets"}, {"item": "Antarctic Winter Food Rations", "quantity": 8500, "unit": "Kg"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 8. DIGITAL TWIN STATES
INSERT INTO digital_twin_states (station_id, overall_health_score, thermal_balance_state, energy_grid_state, life_support_state, active_threats, current_metrics)
VALUES
('station_bharati', 96.8, 'BALANCED', 'NORMAL', 'OPTIMAL', 0, '{"temp_ambient_c": -18.4, "wind_speed_ms": 11.2, "generation_kw": 185.0, "fuel_burn_lph": 38.5, "indoor_temp_c": 21.5}'::jsonb),
('station_maitri', 94.2, 'BALANCED', 'NORMAL', 'OPTIMAL', 0, '{"temp_ambient_c": -21.0, "wind_speed_ms": 14.5, "generation_kw": 210.0, "fuel_burn_lph": 44.0, "indoor_temp_c": 20.8}'::jsonb)
ON CONFLICT (station_id) DO UPDATE SET overall_health_score = EXCLUDED.overall_health_score;

-- 9. EDGE DEVICES
INSERT INTO edge_devices (id, station_id, hostname, ip_address, hardware_spec, link_status, buffer_queue_size, firmware_version)
VALUES
('edge_node_bharati', 'station_bharati', 'bharati-edge-gw01.local', '192.168.10.1', 'Advantech ARK-3531 Rugged IoT Industrial PC (Intel i7, 32GB RAM, Dual SSD RAID-1)', 'ONLINE', 0, 'v2.4.0-edge'),
('edge_node_maitri', 'station_maitri', 'maitri-edge-gw01.local', '192.168.20.1', 'Advantech ARK-3531 Rugged IoT Industrial PC (Intel i7, 32GB RAM, Dual SSD RAID-1)', 'ONLINE', 0, 'v2.4.0-edge')
ON CONFLICT (id) DO UPDATE SET link_status = EXCLUDED.link_status;
