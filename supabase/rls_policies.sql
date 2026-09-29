ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select datasets" ON datasets;
CREATE POLICY "Public select datasets" ON datasets FOR SELECT USING (true);

ALTER TABLE dataset_versions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select dataset_versions" ON dataset_versions;
CREATE POLICY "Public select dataset_versions" ON dataset_versions FOR SELECT USING (true);

ALTER TABLE data_provenance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select data_provenance" ON data_provenance;
CREATE POLICY "Public select data_provenance" ON data_provenance FOR SELECT USING (true);

ALTER TABLE data_quality_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select data_quality_reports" ON data_quality_reports;
CREATE POLICY "Public select data_quality_reports" ON data_quality_reports FOR SELECT USING (true);

ALTER TABLE model_registry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select model_registry" ON model_registry;
CREATE POLICY "Public select model_registry" ON model_registry FOR SELECT USING (true);

ALTER TABLE model_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public select model_runs" ON model_runs;
CREATE POLICY "Public select model_runs" ON model_runs FOR SELECT USING (true);

NOTIFY pgrst, 'reload schema';
