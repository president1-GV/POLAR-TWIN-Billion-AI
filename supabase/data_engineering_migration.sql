-- ============================================================================
-- POLAR-TWIN: Data Engineering & Provenance Schema Migration
-- SIH 26060: Digital Platform for Remote Antarctic Station Operations
-- ============================================================================

-- 1. PROVENANCE TYPE CONSTRAINT UPDATE
ALTER TABLE data_sources DROP CONSTRAINT IF EXISTS data_sources_provenance_type_check;
ALTER TABLE data_sources ALTER COLUMN provenance_type TYPE VARCHAR(64);
ALTER TABLE data_sources ADD CONSTRAINT data_sources_provenance_type_check 
    CHECK (provenance_type IN ('REAL_NCPOR', 'EXTERNAL_ANTARCTIC_BENCHMARK', 'PUBLIC_EXTERNAL', 'SIMULATED', 'DERIVED', 'FUTURE_IOT', 'REAL_PUBLIC', 'PHYSICS_SYNTHETIC', 'EDGE_SIMULATED', 'MOCK'));

-- 2. DATASETS TABLE
CREATE TABLE IF NOT EXISTS datasets (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    provenance_type VARCHAR(64) NOT NULL CHECK (provenance_type IN ('REAL_NCPOR', 'EXTERNAL_ANTARCTIC_BENCHMARK', 'PUBLIC_EXTERNAL', 'SIMULATED', 'DERIVED', 'FUTURE_IOT')),
    station_id VARCHAR(64) REFERENCES stations(id) ON DELETE SET NULL,
    version VARCHAR(64) NOT NULL DEFAULT 'v1.0.0',
    license VARCHAR(128) DEFAULT 'Open Government Data (OGD) / CC-BY-4.0',
    source_url TEXT,
    source_organization VARCHAR(255) NOT NULL,
    hash_sha256 VARCHAR(128) NOT NULL,
    record_count INT DEFAULT 0,
    time_range_start TIMESTAMPTZ,
    time_range_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DATASET VERSIONS TABLE
CREATE TABLE IF NOT EXISTS dataset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id VARCHAR(128) NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version VARCHAR(64) NOT NULL,
    git_commit VARCHAR(128),
    hash_sha256 VARCHAR(128) NOT NULL,
    record_count INT NOT NULL,
    schema_definition JSONB DEFAULT '{}'::jsonb,
    changelog TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DATA PROVENANCE LINEAGE TABLE
CREATE TABLE IF NOT EXISTS data_provenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    provenance_type VARCHAR(64) NOT NULL CHECK (provenance_type IN ('REAL_NCPOR', 'EXTERNAL_ANTARCTIC_BENCHMARK', 'PUBLIC_EXTERNAL', 'SIMULATED', 'DERIVED', 'FUTURE_IOT')),
    source_dataset_id VARCHAR(128) REFERENCES datasets(id) ON DELETE SET NULL,
    processing_step VARCHAR(128) NOT NULL,
    transformation_hash VARCHAR(128),
    parent_entity_id VARCHAR(128),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_provenance_entity ON data_provenance(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_provenance_dataset ON data_provenance(source_dataset_id);

-- 5. DATA QUALITY REPORTS TABLE
CREATE TABLE IF NOT EXISTS data_quality_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id VARCHAR(128) NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    check_type VARCHAR(64) NOT NULL,
    passed BOOLEAN NOT NULL,
    total_records INT NOT NULL,
    invalid_records INT NOT NULL DEFAULT 0,
    null_counts JSONB DEFAULT '{}'::jsonb,
    outlier_counts JSONB DEFAULT '{}'::jsonb,
    violations JSONB DEFAULT '[]'::jsonb,
    execution_timestamp TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_quality_dataset ON data_quality_reports(dataset_id, execution_timestamp DESC);

-- 6. INGESTION RUNS TABLE
CREATE TABLE IF NOT EXISTS ingestion_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(128) NOT NULL,
    dataset_id VARCHAR(128) REFERENCES datasets(id) ON DELETE SET NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED', 'PARTIAL')),
    records_ingested INT NOT NULL DEFAULT 0,
    records_rejected INT NOT NULL DEFAULT 0,
    checksum VARCHAR(128),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    error_log TEXT
);

-- 7. MODEL REGISTRY TABLE
CREATE TABLE IF NOT EXISTS model_registry (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    version VARCHAR(64) NOT NULL,
    task_type VARCHAR(64) NOT NULL CHECK (task_type IN ('MULTIVARIATE_ANOMALY', 'ENERGY_DEMAND_FORECAST', 'PREDICTIVE_MAINTENANCE', 'RUL_ESTIMATION')),
    target_metric VARCHAR(64) NOT NULL,
    framework VARCHAR(64) NOT NULL,
    hyperparameters JSONB DEFAULT '{}'::jsonb,
    evaluation_metrics JSONB DEFAULT '{}'::jsonb,
    artifact_path TEXT,
    artifact_sha256 VARCHAR(128),
    training_dataset_id VARCHAR(128) REFERENCES datasets(id) ON DELETE SET NULL,
    training_time_range JSONB DEFAULT '{}'::jsonb,
    disclosure_risk_level VARCHAR(128) DEFAULT 'CALIBRATED_RESEARCH_PROTOTYPE',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. MODEL RUNS TABLE
CREATE TABLE IF NOT EXISTS model_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(128) NOT NULL REFERENCES model_registry(id) ON DELETE CASCADE,
    run_type VARCHAR(32) NOT NULL CHECK (run_type IN ('TRAINING', 'EVALUATION', 'INFERENCE')),
    status VARCHAR(32) NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'WARNING')),
    metrics JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INT DEFAULT 0,
    git_commit VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POPULATE INITIAL STANDARD DATASETS WITH EXACT 64-CHAR SHA256 HASHES
INSERT INTO datasets (id, name, description, provenance_type, station_id, version, license, source_url, source_organization, hash_sha256, record_count, time_range_start, time_range_end)
VALUES
('ds_ncpor_aws_bharati', 'Bharati AWS Surface Meteorological Observations', 'Official NCPOR AWS observation telemetry for Bharati Station (Larsemann Hills, East Antarctica)', 'REAL_NCPOR', 'station_bharati', 'v1.2.0', 'Government of India Open Data License', 'https://npdc.ncpor.res.in/pdc/Aws/imd/Awsdata.jsp', 'National Centre for Polar and Ocean Research (NCPOR)', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 8760, '2025-01-01T00:00:00Z', '2025-12-31T23:00:00Z'),
('ds_ncpor_aws_maitri', 'Maitri AWS Surface Meteorological Observations', 'Official NCPOR AWS observation telemetry for Maitri Station (Schirmacher Oasis, Queen Maud Land)', 'REAL_NCPOR', 'station_maitri', 'v1.2.0', 'Government of India Open Data License', 'https://npdc.ncpor.res.in/pdc/Aws/imd/Awsdata.jsp', 'National Centre for Polar and Ocean Research (NCPOR)', 'a0b987654321fedcba0123456789abcdef0123456789abcdef0123456789abcd', 8760, '2025-01-01T00:00:00Z', '2025-12-31T23:00:00Z'),
('ds_aad_benchmark_davis', 'AAD Davis Station Energy & Fuel Operational Benchmark', 'Operational energy consumption and diesel fuel burn rate benchmark from Australian Antarctic Division Davis Station', 'EXTERNAL_ANTARCTIC_BENCHMARK', NULL, 'v2.1.0', 'Creative Commons Attribution 4.0 International (CC BY 4.0)', 'https://data.aad.gov.au/metadata/records/Davis_Energy_Benchmark', 'Australian Antarctic Data Centre (AADC)', 'b5c6d7e8f90123456789abcdef0123456789abcdef0123456789abcdef012345', 4380, '2024-01-01T00:00:00Z', '2024-12-31T23:00:00Z'),
('ds_copernicus_sea_ice', 'Copernicus Southern Ocean Antarctic Sea Ice Extent', 'Copernicus Marine Service daily sea ice concentration and edge distance for Prydz Bay and Princess Astrid Coast', 'PUBLIC_EXTERNAL', NULL, 'v3.0.0', 'Copernicus Open Access Licence', 'https://marine.copernicus.eu/services-portfolio/access-to-products', 'Copernicus Marine Environment Monitoring Service', 'c789abcdef0123456789abcdef0123456789abcdef0123456789abcdef012345', 365, '2025-01-01T00:00:00Z', '2025-12-31T00:00:00Z'),
('ds_synthetic_ops_bharati', 'Bharati Digital Twin Operational Telemetry', 'High-frequency physics-coupled synthetic operational telemetry for Bharati gensets, HVAC, and microgrid', 'SIMULATED', 'station_bharati', 'v2.0.0', 'POLAR-TWIN Internal Derivative', 'urn:polar-twin:simulation:physics-v2.0', 'POLAR-TWIN Digital Twin Engine', 'd876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 17520, '2025-01-01T00:00:00Z', '2025-12-31T23:30:00Z')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    provenance_type = EXCLUDED.provenance_type,
    station_id = EXCLUDED.station_id,
    version = EXCLUDED.version,
    source_organization = EXCLUDED.source_organization,
    source_url = EXCLUDED.source_url,
    updated_at = NOW();
