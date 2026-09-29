-- ============================================================================
-- POLAR-TWIN: Supabase Schema Migration
-- POLAR-TWIN: Digital Platform for Remote Antarctic Station Operations
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. DATA SOURCES & PROVENANCE REGISTRY
CREATE TABLE IF NOT EXISTS data_sources (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    provenance_type VARCHAR(32) NOT NULL CHECK (provenance_type IN ('REAL_PUBLIC', 'PHYSICS_SYNTHETIC', 'EDGE_SIMULATED', 'FUTURE_IOT', 'MOCK')),
    status VARCHAR(32) NOT NULL DEFAULT 'CONNECTED',
    endpoint_url TEXT,
    last_update TIMESTAMPTZ DEFAULT NOW(),
    reliability_score NUMERIC(3,2) DEFAULT 0.95,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STATIONS
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(32) PRIMARY KEY,
    station_code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    region VARCHAR(128) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation_meters NUMERIC(6,1) NOT NULL,
    commissioned_year INT NOT NULL,
    operational_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    connectivity_status VARCHAR(32) NOT NULL DEFAULT 'ONLINE' CHECK (connectivity_status IN ('ONLINE', 'DEGRADED', 'OFFLINE', 'SYNCING')),
    primary_power_source VARCHAR(64) DEFAULT 'Diesel-Electric Gensets + Solar/Wind',
    population_capacity INT DEFAULT 25,
    current_occupancy INT DEFAULT 18,
    data_source_id VARCHAR(64) REFERENCES data_sources(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ASSET TYPES
CREATE TABLE IF NOT EXISTS asset_types (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    icon VARCHAR(32),
    criticality VARCHAR(16) DEFAULT 'HIGH' CHECK (criticality IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW'))
);

-- 4. STATION ASSETS
CREATE TABLE IF NOT EXISTS station_assets (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    parent_asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    asset_type_id VARCHAR(32) NOT NULL REFERENCES asset_types(id),
    name VARCHAR(128) NOT NULL,
    code VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'WATCH', 'WARNING', 'CRITICAL', 'FAILED', 'OFFLINE')),
    health_score NUMERIC(5,2) NOT NULL DEFAULT 100.0,
    criticality VARCHAR(16) NOT NULL DEFAULT 'HIGH' CHECK (criticality IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    location_desc TEXT,
    coordinates_3d JSONB DEFAULT '{"x": 0, "y": 0, "z": 0}'::jsonb,
    current_state JSONB DEFAULT '{}'::jsonb,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    source_type VARCHAR(32) NOT NULL DEFAULT 'PHYSICS_SYNTHETIC',
    model_version VARCHAR(32) DEFAULT 'v1.0-calibrated',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSET RELATIONSHIPS (GRAPH)
CREATE TABLE IF NOT EXISTS asset_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    source_asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    target_asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    relationship_type VARCHAR(32) NOT NULL CHECK (relationship_type IN ('POWERS', 'SUPPLIES', 'SUPPORTS', 'INFLUENCES', 'BACKS_UP', 'CONTROLS')),
    impact_weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    propagation_delay_seconds INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TELEMETRY READINGS
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    metric VARCHAR(64) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,
    quality VARCHAR(16) DEFAULT 'GOOD' CHECK (quality IN ('GOOD', 'SUSPECT', 'BAD', 'INTERPOLATED')),
    source_type VARCHAR(32) NOT NULL DEFAULT 'PHYSICS_SYNTHETIC' CHECK (source_type IN ('REAL_PUBLIC', 'PHYSICS_SYNTHETIC', 'EDGE_SIMULATED', 'FUTURE_IOT', 'MOCK')),
    simulation_id VARCHAR(64),
    sequence_number BIGINT,
    is_demo BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_telemetry_station_asset_ts ON telemetry_readings(station_id, asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_metric_ts ON telemetry_readings(metric, timestamp DESC);

-- 7. ENVIRONMENT OBSERVATIONS
CREATE TABLE IF NOT EXISTS environment_observations (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    temperature_c DOUBLE PRECISION NOT NULL,
    apparent_temp_c DOUBLE PRECISION,
    wind_speed_ms DOUBLE PRECISION NOT NULL,
    wind_gust_ms DOUBLE PRECISION,
    wind_direction_deg INT,
    atmospheric_pressure_hpa DOUBLE PRECISION NOT NULL,
    relative_humidity_pct DOUBLE PRECISION NOT NULL,
    solar_radiation_wm2 DOUBLE PRECISION DEFAULT 0.0,
    visibility_km DOUBLE PRECISION DEFAULT 10.0,
    blizzard_condition BOOLEAN DEFAULT FALSE,
    source_type VARCHAR(32) NOT NULL DEFAULT 'REAL_PUBLIC' CHECK (source_type IN ('REAL_PUBLIC', 'PHYSICS_SYNTHETIC', 'EDGE_SIMULATED', 'FUTURE_IOT', 'MOCK')),
    source_provider VARCHAR(64) DEFAULT 'NCPOR / OpenMeteo Antarctic Gateway',
    is_demo BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_env_station_ts ON environment_observations(station_id, timestamp DESC);

-- 8. ENERGY GRIDS & READINGS
CREATE TABLE IF NOT EXISTS energy_readings (
    id BIGSERIAL PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    total_generation_kw DOUBLE PRECISION NOT NULL,
    total_consumption_kw DOUBLE PRECISION NOT NULL,
    generator_output_kw DOUBLE PRECISION NOT NULL,
    solar_output_kw DOUBLE PRECISION DEFAULT 0.0,
    wind_output_kw DOUBLE PRECISION DEFAULT 0.0,
    battery_charge_pct DOUBLE PRECISION NOT NULL,
    battery_power_kw DOUBLE PRECISION DEFAULT 0.0,
    hvac_load_kw DOUBLE PRECISION NOT NULL,
    critical_load_kw DOUBLE PRECISION NOT NULL,
    scientific_load_kw DOUBLE PRECISION NOT NULL,
    reserve_margin_pct DOUBLE PRECISION NOT NULL,
    grid_frequency_hz DOUBLE PRECISION DEFAULT 50.0,
    source_type VARCHAR(32) NOT NULL DEFAULT 'PHYSICS_SYNTHETIC',
    is_demo BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_energy_station_ts ON energy_readings(station_id, timestamp DESC);

-- 9. LOGISTICS & INVENTORY
CREATE TABLE IF NOT EXISTS logistics_items (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    category VARCHAR(32) NOT NULL CHECK (category IN ('FUEL', 'FOOD', 'MEDICAL', 'SPARE_PARTS', 'SCIENTIFIC_SUPPLIES', 'WATER')),
    name VARCHAR(128) NOT NULL,
    sku VARCHAR(32) NOT NULL,
    current_stock DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,
    daily_burn_rate DOUBLE PRECISION NOT NULL,
    minimum_reserve DOUBLE PRECISION NOT NULL,
    days_remaining DOUBLE PRECISION NOT NULL,
    shortage_risk_level VARCHAR(16) NOT NULL DEFAULT 'LOW' CHECK (shortage_risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    storage_location VARCHAR(128),
    last_restocked_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SHIPMENTS
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(64) PRIMARY KEY,
    vessel_name VARCHAR(128) NOT NULL,
    voyage_number VARCHAR(64) NOT NULL,
    departure_port VARCHAR(128) DEFAULT 'Cape Town, South Africa',
    destination_station_id VARCHAR(32) NOT NULL REFERENCES stations(id),
    scheduled_departure TIMESTAMPTZ NOT NULL,
    scheduled_arrival TIMESTAMPTZ NOT NULL,
    actual_arrival TIMESTAMPTZ,
    delay_days INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'EN_ROUTE' CHECK (status IN ('SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'DELAYED', 'CANCELLED')),
    cargo_manifest JSONB DEFAULT '[]'::jsonb,
    icebreaker_escort BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('INFO', 'WATCH', 'WARNING', 'CRITICAL')),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED')),
    source_type VARCHAR(32) NOT NULL DEFAULT 'PHYSICS_SYNTHETIC',
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    predicted_consequence TEXT,
    recommended_action TEXT,
    acknowledged_by VARCHAR(64),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_alerts_station_severity ON alerts(station_id, severity, status);

-- 12. AI ANOMALIES & PREDICTIONS
CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    anomaly_score DOUBLE PRECISION NOT NULL,
    threshold DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    model_name VARCHAR(64) DEFAULT 'MahalanobisMultivariateDetector',
    model_version VARCHAR(32) DEFAULT 'v1.4-calibrated',
    features_analyzed JSONB NOT NULL,
    deviant_features JSONB NOT NULL,
    predicted_failure_risk VARCHAR(16) DEFAULT 'ELEVATED' CHECK (predicted_failure_risk IN ('NORMAL', 'ELEVATED', 'HIGH', 'CRITICAL')),
    confidence_level VARCHAR(64) DEFAULT 'PROTOTYPE / SYNTHETICALLY CALIBRATED',
    recommended_action TEXT,
    is_demo BOOLEAN DEFAULT FALSE,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SIMULATION SCENARIOS & RUNS
CREATE TABLE IF NOT EXISTS simulation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_name VARCHAR(64) NOT NULL,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    trigger_asset_id VARCHAR(64) REFERENCES station_assets(id),
    severity VARCHAR(16) NOT NULL DEFAULT 'HIGH',
    initial_conditions JSONB NOT NULL,
    parameters JSONB NOT NULL,
    consequences JSONB NOT NULL,
    recommendations JSONB NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    operator_action VARCHAR(32) DEFAULT 'PENDING_REVIEW' CHECK (operator_action IN ('PENDING_REVIEW', 'APPROVED', 'REJECTED', 'EXECUTED_SIMULATED')),
    operator_id VARCHAR(64),
    reviewed_at TIMESTAMPTZ,
    is_demo BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. DIGITAL TWIN STATES (SNAPSHOTS)
CREATE TABLE IF NOT EXISTS digital_twin_states (
    station_id VARCHAR(32) PRIMARY KEY REFERENCES stations(id) ON DELETE CASCADE,
    overall_health_score NUMERIC(5,2) NOT NULL DEFAULT 94.5,
    thermal_balance_state VARCHAR(32) DEFAULT 'BALANCED',
    energy_grid_state VARCHAR(32) DEFAULT 'NORMAL',
    life_support_state VARCHAR(32) DEFAULT 'OPTIMAL',
    active_threats INT DEFAULT 0,
    last_state_transition TIMESTAMPTZ DEFAULT NOW(),
    current_metrics JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. EDGE DEVICES & SYNC EVENTS
CREATE TABLE IF NOT EXISTS edge_devices (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    hostname VARCHAR(128) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    hardware_spec VARCHAR(255),
    link_status VARCHAR(16) NOT NULL DEFAULT 'ONLINE' CHECK (link_status IN ('ONLINE', 'DEGRADED', 'OFFLINE', 'SYNCING')),
    buffer_queue_size INT DEFAULT 0,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    firmware_version VARCHAR(32) DEFAULT 'v2.4.0-edge'
);

CREATE TABLE IF NOT EXISTS sync_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    edge_device_id VARCHAR(64) REFERENCES edge_devices(id) ON DELETE CASCADE,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    event_type VARCHAR(32) NOT NULL CHECK (event_type IN ('DISCONNECT', 'RECONNECT', 'SYNC_START', 'SYNC_COMPLETE', 'BUFFER_OVERFLOW', 'CRC_VERIFIED')),
    records_synced INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    checksum_valid BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(64) NOT NULL DEFAULT 'system',
    role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
    station_id VARCHAR(32),
    action VARCHAR(64) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    client_ip VARCHAR(45),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_ts ON audit_logs(action, timestamp DESC);
