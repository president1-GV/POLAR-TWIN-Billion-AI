-- ============================================================================
-- POLAR-TWIN POSTGRESQL MIGRATION: 001_INITIAL_SCHEMA
-- Production Sovereign Antarctic Platform (Supabase PostgreSQL 17.6)
-- Conforms to Section 9 & 10 of Master Technical Architecture
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    permissions JSONB DEFAULT '[]'::jsonb,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS & RBAC
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) UNIQUE NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    station_id VARCHAR(32),
    role_id VARCHAR(32) NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DATA SOURCES & PROVENANCE
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

-- 4. STATIONS
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

-- 5. ASSETS (ONE REAL ASSET -> ONE ASSET ID -> ONE AUTHORITATIVE DIGITAL RECORD)
CREATE TABLE IF NOT EXISTS station_assets (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    parent_asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    asset_type_id VARCHAR(32) NOT NULL,
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
    model_version VARCHAR(32) DEFAULT 'v2.1-calibrated',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASSET RELATIONSHIPS (GRAPH TOPOLOGY)
CREATE TABLE IF NOT EXISTS asset_relationships (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    source_asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    target_asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    relationship_type VARCHAR(32) NOT NULL CHECK (relationship_type IN ('POWERS', 'SUPPLIES', 'SUPPORTS', 'INFLUENCES', 'BACKS_UP', 'CONTROLS')),
    impact_weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
    propagation_delay_seconds INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COORDINATES (GEOSPATIAL REFERENCE & TRANSFORMATION)
CREATE TABLE IF NOT EXISTS coordinates (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    elevation DOUBLE PRECISION NOT NULL,
    crs VARCHAR(32) DEFAULT 'EPSG:4326',
    easting_epsg3031 DOUBLE PRECISION,
    northing_epsg3031 DOUBLE PRECISION,
    enu_x DOUBLE PRECISION,
    enu_y DOUBLE PRECISION,
    enu_z DOUBLE PRECISION,
    three_x DOUBLE PRECISION,
    three_y DOUBLE PRECISION,
    three_z DOUBLE PRECISION,
    orientation JSONB DEFAULT '{}'::jsonb,
    scale DOUBLE PRECISION DEFAULT 1.0,
    source VARCHAR(128) DEFAULT 'NCPOR As-Built Survey',
    accuracy_meters DOUBLE PRECISION DEFAULT 0.05,
    confidence VARCHAR(32) DEFAULT 'VERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TIME-SERIES TELEMETRY READINGS
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    metric VARCHAR(64) NOT NULL,
    value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(32) NOT NULL,
    quality VARCHAR(16) DEFAULT 'GOOD' CHECK (quality IN ('GOOD', 'SUSPECT', 'BAD', 'INTERPOLATED')),
    source_type VARCHAR(32) NOT NULL DEFAULT 'PHYSICS_SYNTHETIC',
    simulation_id VARCHAR(64),
    sequence_number BIGINT,
    crc32 BIGINT,
    is_demo BOOLEAN DEFAULT FALSE,
    received_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_telemetry_station_asset_ts ON telemetry_readings(station_id, asset_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_metric_ts ON telemetry_readings(metric, timestamp DESC);

-- 9. WEATHER OBSERVATIONS
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
    source_type VARCHAR(32) NOT NULL DEFAULT 'REAL_PUBLIC',
    source_provider VARCHAR(64) DEFAULT 'NCPOR / OpenMeteo Antarctic Gateway',
    is_demo BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_env_obs_station_ts ON environment_observations(station_id, timestamp DESC);

-- 10. ENERGY READINGS
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
CREATE INDEX IF NOT EXISTS idx_energy_obs_station_ts ON energy_readings(station_id, timestamp DESC);

-- 11. LOGISTICS & INVENTORY
CREATE TABLE IF NOT EXISTS logistics_items (
    id VARCHAR(64) PRIMARY KEY,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
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

-- 12. PREDICTIONS & AI ANOMALIES
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) NOT NULL REFERENCES station_assets(id) ON DELETE CASCADE,
    model_name VARCHAR(64) NOT NULL,
    model_version VARCHAR(32) NOT NULL,
    training_dataset VARCHAR(128),
    prediction_type VARCHAR(64) NOT NULL,
    forecast_horizon_hours INT DEFAULT 24,
    features_used JSONB DEFAULT '[]'::jsonb,
    predicted_value DOUBLE PRECISION,
    prediction_data JSONB DEFAULT '{}'::jsonb,
    confidence_score DOUBLE PRECISION DEFAULT 0.92,
    anomaly_score DOUBLE PRECISION,
    threshold DOUBLE PRECISION,
    provenance VARCHAR(64) DEFAULT 'ML_INFERRED_NON_OBSERVATIONAL',
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SIMULATION SCENARIOS & RESULTS
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    scenario_key VARCHAR(64) UNIQUE NOT NULL,
    title VARCHAR(128) NOT NULL,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    category VARCHAR(64) DEFAULT 'CONTINGENCY',
    severity VARCHAR(16) DEFAULT 'HIGH',
    trigger_asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    initial_conditions JSONB DEFAULT '{}'::jsonb,
    parameters JSONB DEFAULT '{}'::jsonb,
    mitigation_protocols JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_results (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    scenario_id VARCHAR(64) NOT NULL REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    run_timestamp TIMESTAMPTZ DEFAULT NOW(),
    initial_state_hash VARCHAR(64) NOT NULL,
    parameter_modifications JSONB DEFAULT '{}'::jsonb,
    trajectory_results JSONB DEFAULT '{}'::jsonb,
    impact_analysis JSONB DEFAULT '{}'::jsonb,
    operator_action VARCHAR(32) DEFAULT 'PENDING_REVIEW',
    operator_id VARCHAR(64),
    reviewed_at TIMESTAMPTZ,
    isolated_from_telemetry BOOLEAN DEFAULT TRUE
);

-- 14. ALERTS
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    station_id VARCHAR(32) NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    asset_id VARCHAR(64) REFERENCES station_assets(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('INFO', 'WATCH', 'WARNING', 'CRITICAL')),
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED')),
    source_type VARCHAR(32) DEFAULT 'PHYSICS_SYNTHETIC',
    evidence JSONB DEFAULT '[]'::jsonb,
    predicted_consequence TEXT,
    recommended_action TEXT,
    acknowledged_by VARCHAR(64),
    acknowledged_at TIMESTAMPTZ,
    resolved_at TIMESTAMPTZ,
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. IMMUTABLE AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    request_id VARCHAR(64),
    user_id VARCHAR(64) NOT NULL DEFAULT 'system',
    role VARCHAR(32) NOT NULL DEFAULT 'OPERATOR',
    station_id VARCHAR(32),
    action VARCHAR(64) NOT NULL,
    resource VARCHAR(128) NOT NULL,
    before_state JSONB,
    after_state JSONB,
    details JSONB DEFAULT '{}'::jsonb,
    client_ip VARCHAR(45),
    source VARCHAR(64) DEFAULT 'API_GATEWAY',
    hash_signature VARCHAR(64),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_ts ON audit_logs(action, timestamp DESC);
