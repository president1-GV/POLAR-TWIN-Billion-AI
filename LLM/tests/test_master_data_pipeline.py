"""
POLAR-TWIN Master Data Engineering & Model Training Test Suite
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Contains 70 Comprehensive Automated Tests verifying:
- Ingestion Connectors (NCPOR, AADC, Copernicus, Synthetic, Base) [Tests 1-10]
- Cryptographic SHA-256 Hash Integrity & Immutability [Tests 11-18]
- Strict Provenance Classification & Segregation (No Conflation) [Tests 19-28]
- Data Quality, Bounds Checking & Schema Validation [Tests 29-40]
- Chronological Time-Series Splits & Zero Data Leakage [Tests 41-46]
- Machine Learning Models (Forecasting >=10% over Baseline, Anomaly F1/ROC-AUC, RUL) [Tests 47-56]
- Digital Twin State Derivation & Physics Coupling [Tests 57-64]
- LLM Evidence Grounding & Anti-Hallucination Guardrails [Tests 65-70]

STANDARD: 100% Pass Rate Required.
"""

import sys
import os
import json
import math
from datetime import datetime, timezone
import numpy as np

# Ensure root workspace is on python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from LLM.schemas.provenance_schema import (
    ProvenanceType, QualityStatus, DatasetMetadata, DataProvenanceRecord, DataQualityReport
)
from LLM.schemas.observation_schema import EnvironmentObservationRecord
from LLM.schemas.telemetry_schema import TelemetryReadingRecord, EnergyReadingRecord
from LLM.schemas.validation_rules import (
    ANTARCTIC_PHYSICAL_BOUNDS, validate_metric_value, validate_observation_dict
)
from LLM.connectors.base_connector import BaseDataConnector
from LLM.connectors.ncpor_aws_connector import NcporAwsConnector, STATION_COORDINATES
from LLM.connectors.aad_connector import AadBenchmarkConnector
from LLM.connectors.copernicus_sea_ice import CopernicusSeaIceConnector
from LLM.connectors.external_benchmarks import EXTERNAL_REGISTRY, assert_external_provenance_separation
from LLM.simulation.synthetic_ops_generator import SyntheticOpsGenerator
from LLM.simulation.weather_physics_coupling import WeatherPhysicsCoupler
from LLM.simulation.scenario_generator import ScenarioGenerator
from LLM.preprocessing.quality_engine import DataQualityEngine
from LLM.preprocessing.cleaner import DataCleaner
from LLM.preprocessing.feature_engineer import FeatureEngineer
from LLM.preprocessing.normalizer import FeatureNormalizer
from LLM.ingestion.hash_verifier import HashVerifier
from LLM.ingestion.cdc_handler import CdcHandler
from LLM.ingestion.pipeline import IngestionPipeline
from LLM.training.split_manager import TemporalSplitManager
from LLM.training.energy_forecaster_trainer import EnergyForecasterTrainer
from LLM.training.anomaly_trainer import AnomalyDetectorTrainer
from LLM.training.predictive_maintenance_trainer import PredictiveMaintenanceTrainer
from LLM.evaluation.metrics import ModelEvaluator
from LLM.evaluation.benchmark_comparison import BenchmarkComparisonEngine
from LLM.prompts.evidence_grounded_prompts import (
    SYSTEM_PROMPT_EVIDENCE_GROUNDED, format_evidence_context, build_grounded_prompt
)


class TestHarness:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.total = 0
        self.failures = []

    def assert_true(self, condition: bool, test_id: str, description: str):
        self.total += 1
        if condition:
            self.passed += 1
            print(f"[{test_id}] PASS: {description}")
        else:
            self.failed += 1
            self.failures.append((test_id, description))
            print(f"[{test_id}] FAIL: {description}")

    def assert_equal(self, actual, expected, test_id: str, description: str):
        self.assert_true(actual == expected, test_id, f"{description} (Expected: {expected}, Got: {actual})")

    def assert_almost_equal(self, actual, expected, delta: float, test_id: str, description: str):
        diff = abs(actual - expected)
        self.assert_true(diff <= delta, test_id, f"{description} (|{actual} - {expected}| = {diff} <= {delta})")


def run_all_tests():
    t = TestHarness()
    print("=" * 75)
    print("POLAR-TWIN MASTER DATA ENGINEERING & ML ACCEPTANCE TEST SUITE")
    print("SIH 26060 — 70 AUTOMATED TESTS")
    print("=" * 75)

    # --------------------------------------------------------------------------
    # GROUP 1: Ingestion Connectors (Tests 1 - 10)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 1: Ingestion Connectors & Endpoints")
    
    # Test 1: NCPOR Bharati coordinates
    c_bharati = NcporAwsConnector("station_bharati")
    t.assert_almost_equal(c_bharati.station_meta["latitude"], -69.4077, 0.01, "TEST-01", "NCPOR Bharati latitude conforms to Larsemann Hills")

    # Test 2: NCPOR Maitri coordinates
    c_maitri = NcporAwsConnector("station_maitri")
    t.assert_almost_equal(c_maitri.station_meta["latitude"], -70.7658, 0.01, "TEST-02", "NCPOR Maitri latitude conforms to Schirmacher Oasis")

    # Test 3: NCPOR Connector strict provenance
    t.assert_equal(c_bharati.provenance_type, ProvenanceType.REAL_NCPOR, "TEST-03", "NCPOR connector provenance is strictly REAL_NCPOR")

    # Test 4: NCPOR fetch records
    raw_bharati = c_bharati.fetch_raw(count=24)
    t.assert_true(len(raw_bharati.get("observations", [])) >= 24, "TEST-04", "NCPOR fetch generates at least 24 hourly observation records")

    # Test 5: NCPOR parse records retains station ID
    parsed_b = c_bharati.parse_records(raw_bharati)
    t.assert_equal(parsed_b[0]["station_id"], "station_bharati", "TEST-05", "NCPOR parsed records retain correct station_bharati identity")

    # Test 6: AADC Benchmark Connector provenance
    c_aad = AadBenchmarkConnector()
    t.assert_equal(c_aad.provenance_type, ProvenanceType.EXTERNAL_ANTARCTIC_BENCHMARK, "TEST-06", "AADC connector provenance is EXTERNAL_ANTARCTIC_BENCHMARK")

    # Test 7: AADC Benchmark source country
    t.assert_equal(c_aad.source_country, "Australia", "TEST-07", "AADC benchmark connector strictly declares country as Australia")

    # Test 8: AADC fetch records
    raw_aad = c_aad.fetch_raw(count=24)
    t.assert_true("Davis Station" in raw_aad.get("benchmark_station", ""), "TEST-08", "AADC raw payload targets Davis Station")

    # Test 9: Copernicus Sea Ice provenance
    c_cop = CopernicusSeaIceConnector()
    t.assert_equal(c_cop.provenance_type, ProvenanceType.PUBLIC_EXTERNAL, "TEST-09", "Copernicus sea ice provenance is PUBLIC_EXTERNAL")

    # Test 10: Copernicus sea ice observation fields
    raw_cop = c_cop.fetch_raw(days=10)
    obs_cop = raw_cop.get("sea_ice_observations", [])
    t.assert_true("sea_ice_concentration_pct" in obs_cop[0], "TEST-10", "Copernicus raw records contain sea_ice_concentration_pct")

    # --------------------------------------------------------------------------
    # GROUP 2: Cryptographic Hash Integrity & Immutability (Tests 11 - 18)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 2: Cryptographic Hash Integrity & Immutability")

    # Test 11: SHA-256 length is 64 hex characters
    test_hash = HashVerifier.compute_sha256({"test": "data", "station": "bharati"})
    t.assert_equal(len(test_hash), 64, "TEST-11", "HashVerifier computes exact 64-character SHA-256 digest")

    # Test 12: Determinism of hash across dictionary key ordering
    hash_a = HashVerifier.compute_sha256({"a": 1, "b": 2, "c": [1, 2, 3]})
    hash_b = HashVerifier.compute_sha256({"c": [1, 2, 3], "b": 2, "a": 1})
    t.assert_equal(hash_a, hash_b, "TEST-12", "Hash computation is deterministic and key-order independent")

    # Test 13: Hash sensitivity to single-bit changes
    hash_c = HashVerifier.compute_sha256({"a": 1, "b": 2, "c": [1, 2, 4]})
    t.assert_true(hash_a != hash_c, "TEST-13", "HashVerifier detects single-bit data mutations")

    # Test 14: Verification matches valid hash
    is_valid, _ = HashVerifier.verify({"temp": -22.5}, HashVerifier.compute_sha256({"temp": -22.5}))
    t.assert_true(is_valid, "TEST-14", "HashVerifier.verify returns True for authentic data")

    # Test 15: Verification detects tampered hash
    is_tampered, _ = HashVerifier.verify({"temp": -22.5}, "0000000000000000000000000000000000000000000000000000000000000000")
    t.assert_true(not is_tampered, "TEST-15", "HashVerifier.verify returns False for tampered hash")

    # Test 16: Connector save and reload verifies hash
    class MockConnector(BaseDataConnector):
        def fetch_raw(self, **kwargs): return {}
        def parse_records(self, raw_data): return []
    c_test_persist = MockConnector("ds_test_temp_roundtrip", ProvenanceType.SIMULATED, "Test Org")
    saved_hash = c_test_persist.save_raw({"test": "persistence"})
    loaded_payload, verified_hash = c_test_persist.load_raw()
    t.assert_equal(saved_hash, verified_hash, "TEST-16", "Connector roundtrip save/load preserves exact cryptographic hash")

    # Test 17: Dataset registry SHA-256 hashes are non-empty
    with open("LLM/metadata/dataset_registry.json") as f:
        reg = json.load(f)
    all_hashes_valid = all(len(d.get("sha256_hash", "")) == 64 for d in reg["datasets"])
    t.assert_true(all_hashes_valid, "TEST-17", "All registered datasets in registry possess valid 64-character SHA-256 hashes")

    # Test 18: CDC Handler detects duplicate record hashes
    cdc = CdcHandler()
    batch1 = [{"id": 1, "metric": 5.0}, {"id": 2, "metric": 6.0}]
    filtered1 = cdc.filter_new_records(batch1)
    filtered2 = cdc.filter_new_records(batch1)
    t.assert_true(len(filtered1) == 2 and len(filtered2) == 0, "TEST-18", "CdcHandler admits new records and filters exact duplicates")

    # --------------------------------------------------------------------------
    # GROUP 3: Strict Provenance Classification & Segregation (Tests 19 - 28)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 3: Strict Provenance Classification & Segregation")

    # Test 19: All 6 provenance enum tiers exist
    expected_tiers = {"REAL_NCPOR", "EXTERNAL_ANTARCTIC_BENCHMARK", "PUBLIC_EXTERNAL", "SIMULATED", "DERIVED", "FUTURE_IOT"}
    actual_tiers = {p.value for p in ProvenanceType}
    t.assert_equal(actual_tiers, expected_tiers, "TEST-19", "All 6 strict provenance tiers are defined in ProvenanceType enum")

    # Test 20: External benchmark segregation rule accepts valid benchmark
    valid_aad_rec = {"provenance_type": "EXTERNAL_ANTARCTIC_BENCHMARK", "station_id": None, "source_country": "Australia"}
    t.assert_true(assert_external_provenance_separation(valid_aad_rec), "TEST-20", "Valid Australian benchmark passes segregation check")

    # Test 21: External benchmark segregation rejects Indian station ID
    try:
        assert_external_provenance_separation({"provenance_type": "EXTERNAL_ANTARCTIC_BENCHMARK", "station_id": "station_bharati", "source_country": "Australia"})
        conflation_prevented = False
    except ValueError:
        conflation_prevented = True
    t.assert_true(conflation_prevented, "TEST-21", "Segregation rule strictly rejects labeling AADC benchmark as station_bharati")

    # Test 22: External benchmark segregation rejects Indian country
    try:
        assert_external_provenance_separation({"provenance_type": "EXTERNAL_ANTARCTIC_BENCHMARK", "source_country": "India"})
        country_conflation_prevented = False
    except ValueError:
        country_conflation_prevented = True
    t.assert_true(country_conflation_prevented, "TEST-22", "Segregation rule strictly rejects assigning India to external benchmark")

    # Test 23: REAL_NCPOR rejects non-Indian country
    try:
        assert_external_provenance_separation({"provenance_type": "REAL_NCPOR", "station_id": "station_bharati", "source_country": "Australia"})
        ncpor_country_prevented = False
    except ValueError:
        ncpor_country_prevented = True
    t.assert_true(ncpor_country_prevented, "TEST-23", "Segregation rule strictly rejects foreign country on REAL_NCPOR data")

    # Test 24: WeatherPhysicsCoupler reclassifies output as DERIVED
    coupler = WeatherPhysicsCoupler("station_bharati")
    sample_obs = [{"station_id": "station_bharati", "timestamp": "2025-07-01T12:00:00+00:00", "temperature_c": -25.0, "wind_speed_ms": 10.0, "provenance_type": "REAL_NCPOR"}]
    coupled_out = coupler.couple_observations(sample_obs)
    t.assert_equal(coupled_out[0]["provenance_type"], ProvenanceType.DERIVED.value, "TEST-24", "Physics coupler assigns DERIVED provenance to calculated telemetry")

    # Test 25: WeatherPhysicsCoupler retains parent observation timestamp
    t.assert_equal(coupled_out[0]["parent_observation_timestamp"], "2025-07-01T12:00:00+00:00", "TEST-25", "DERIVED telemetry preserves parent observation timestamp link")

    # Test 26: WeatherPhysicsCoupler retains parent provenance
    t.assert_equal(coupled_out[0]["parent_provenance"], "REAL_NCPOR", "TEST-26", "DERIVED telemetry preserves parent provenance REAL_NCPOR")

    # Test 27: Synthetic ops generator tags SIMULATED
    synth_gen = SyntheticOpsGenerator("station_bharati", seed=42)
    s_hour = synth_gen.generate_coupled_hour(datetime.utcnow(), -20.0, 10.0)
    t.assert_equal(s_hour["provenance_type"], ProvenanceType.SIMULATED.value, "TEST-27", "Synthetic ops generator tags output with SIMULATED provenance")

    # Test 28: Scenario generator tags SIMULATED
    scen_gen = ScenarioGenerator("station_bharati")
    scen = scen_gen.generate_blizzard_storm_scenario(12)
    t.assert_equal(scen["provenance_type"], ProvenanceType.SIMULATED.value, "TEST-28", "Scenario generator tags contingency run with SIMULATED provenance")

    # --------------------------------------------------------------------------
    # GROUP 4: Data Quality, Bounds Checking & Schema Validation (Tests 29 - 40)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 4: Data Quality, Bounds Checking & Schema Validation")

    # Test 29: Valid temperature in Antarctic bounds
    q_status, msg = validate_metric_value("temperature_c", -25.0)
    t.assert_true(q_status == QualityStatus.VALID and msg is None, "TEST-29", "-25°C is accepted as VALID Antarctic temperature")

    # Test 30: Below-absolute-minimum temperature rejected
    q_status_inv, msg_inv = validate_metric_value("temperature_c", -105.0)
    t.assert_true(q_status_inv == QualityStatus.INVALID, "TEST-30", "-105°C (below -90°C min) is flagged as INVALID")

    # Test 31: Excessive temperature above melting summer rejected
    q_status_hot, _ = validate_metric_value("temperature_c", 45.0)
    t.assert_true(q_status_hot == QualityStatus.INVALID, "TEST-31", "+45°C (above Antarctic +35°C max) is flagged as INVALID")

    # Test 32: Extreme blizzard wind flagged SUSPECT
    q_status_w, _ = validate_metric_value("wind_speed_ms", 65.0)
    t.assert_true(q_status_w == QualityStatus.SUSPECT, "TEST-32", "Hurricane-force wind 65 m/s is flagged as SUSPECT")

    # Test 33: Out-of-bounds wind rejected
    q_status_w_bad, _ = validate_metric_value("wind_speed_ms", 150.0)
    t.assert_true(q_status_w_bad == QualityStatus.INVALID, "TEST-33", "150 m/s wind is flagged as INVALID")

    # Test 34: Vibration surge flagged OUTLIER
    q_status_vib, _ = validate_metric_value("vibration_rms_mms", 15.0)
    t.assert_true(q_status_vib == QualityStatus.OUTLIER, "TEST-34", "15 mm/s mechanical vibration is flagged as OUTLIER")

    # Test 35: Relative humidity bounds (0 - 100%)
    q_rh_bad, _ = validate_metric_value("relative_humidity_pct", 108.0)
    t.assert_true(q_rh_bad == QualityStatus.INVALID, "TEST-35", "108% relative humidity is flagged as INVALID")

    # Test 36: Battery SOC bounds (0 - 100%)
    q_soc_bad, _ = validate_metric_value("battery_charge_pct", -5.0)
    t.assert_true(q_soc_bad == QualityStatus.INVALID, "TEST-36", "Negative battery SOC (-5%) is flagged as INVALID")

    # Test 37: Wind gust cannot be lower than sustained wind
    is_valid_obs, violations = validate_observation_dict({
        "timestamp": "2025-06-01T00:00:00Z",
        "wind_speed_ms": 25.0,
        "wind_gust_ms": 10.0
    })
    t.assert_true(not is_valid_obs and any("cannot be lower" in v for v in violations), "TEST-37", "Validation rejects gust lower than sustained wind")

    # Test 38: DataCleaner removes duplicates
    dirty_recs = [
        {"station_id": "station_bharati", "timestamp": "2025-06-01T00:00:00Z", "val": 1},
        {"station_id": "station_bharati", "timestamp": "2025-06-01T00:00:00Z", "val": 1},
        {"station_id": "station_bharati", "timestamp": "2025-06-01T01:00:00Z", "val": 2}
    ]
    cleaned_recs = DataCleaner.deduplicate(dirty_recs)
    t.assert_equal(len(cleaned_recs), 2, "TEST-38", "DataCleaner deduplicates identical composite keys")

    # Test 39: DataCleaner standardizes UTC ISO timestamps
    time_dirty = [{"timestamp": "2025-06-01T12:00:00Z"}, {"timestamp": "2025-06-01 12:00:00"}]
    time_clean = DataCleaner.normalize_utc_timestamps(time_dirty)
    t.assert_true(all("+" in r["timestamp"] or "Z" in r["timestamp"] for r in time_clean), "TEST-39", "DataCleaner normalizes all timestamps to standard UTC ISO-8601")

    # Test 40: DataQualityEngine executes comprehensive audit
    dq_engine = DataQualityEngine("ds_test_bharati")
    report = dq_engine.audit_observations([
        {"timestamp": "2025-06-01T00:00:00Z", "temperature_c": -20.0, "wind_speed_ms": 10.0, "atmospheric_pressure_hpa": 985.0, "relative_humidity_pct": 70.0},
        {"timestamp": "2025-06-01T01:00:00Z", "temperature_c": -21.0, "wind_speed_ms": 11.0, "atmospheric_pressure_hpa": 984.0, "relative_humidity_pct": 69.0}
    ])
    t.assert_true(report.passed and report.invalid_records == 0, "TEST-40", "DataQualityEngine passes valid observation series with 0 invalid records")

    # --------------------------------------------------------------------------
    # GROUP 5: Chronological Time-Series Splits & Zero Data Leakage (Tests 41 - 46)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 5: Chronological Time-Series Splits & Zero Data Leakage")

    # Generate synthetic sequence for split testing
    time_series_data = [
        {"timestamp": f"2025-07-{d:02d}T{h:02d}:00:00+00:00", "val": d * 24 + h}
        for d in range(1, 11) for h in range(24)
    ]

    # Test 41: Temporal split produces 3 partitions
    train, val, test = TemporalSplitManager.chronological_split(time_series_data, 0.70, 0.15, 0.15)
    t.assert_true(len(train) > 0 and len(val) > 0 and len(test) > 0, "TEST-41", "Temporal split partitions dataset into train, val, and test")

    # Test 42: Partition count conserves total records
    t.assert_equal(len(train) + len(val) + len(test), len(time_series_data), "TEST-42", "Sum of train + val + test records equals total input records")

    # Test 43: Ratio distribution matches 70/15/15 (+/- 1 record rounding)
    t.assert_almost_equal(len(train) / len(time_series_data), 0.70, 0.02, "TEST-43", "Train partition matches 70% allocation ratio")

    # Test 44: Max(train) < Min(val)
    max_train = max(r["timestamp"] for r in train)
    min_val = min(r["timestamp"] for r in val)
    t.assert_true(max_train < min_val, "TEST-44", "Strict chronological separation: max(train) < min(val)")

    # Test 45: Max(val) < Min(test)
    max_val = max(r["timestamp"] for r in val)
    min_test = min(r["timestamp"] for r in test)
    t.assert_true(max_val < min_test, "TEST-45", "Strict chronological separation: max(val) < min(test)")

    # Test 46: Invalid ratios sum rejected
    try:
        TemporalSplitManager.chronological_split(time_series_data, 0.80, 0.30, 0.10)
        invalid_ratios_allowed = True
    except ValueError:
        invalid_ratios_allowed = False
    t.assert_true(not invalid_ratios_allowed, "TEST-46", "Split manager rejects ratios that do not sum to 1.0")

    # --------------------------------------------------------------------------
    # GROUP 6: Machine Learning Models & Evaluation (Tests 47 - 56)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 6: Machine Learning Models & Evaluation")

    # Load trained model metadata
    with open("LLM/metadata/model_registry.json") as f:
        mod_reg = json.load(f)
    models_dict = {m["id"]: m for m in mod_reg["models"]}

    # Test 47: Energy demand forecaster exists in registry
    t.assert_true("model_energy_demand_forecaster" in models_dict, "TEST-47", "Energy demand forecaster is registered in model registry")

    # Test 48: Forecaster MAE improvement over baseline >= 10%
    ef_meta = models_dict["model_energy_demand_forecaster"]
    imp_pct = ef_meta["evaluation_metrics"]["improvement_over_baseline_pct"]
    t.assert_true(imp_pct >= 10.0, "TEST-48", f"Forecaster outperforms naive baseline by >= 10% (Achieved: {imp_pct}%)")

    # Test 49: Forecaster R2 score is positive and high (> 0.85)
    r2 = ef_meta["evaluation_metrics"]["r2"]
    t.assert_true(r2 >= 0.85, "TEST-49", f"Forecaster R2 score is >= 0.85 (Achieved: {r2})")

    # Test 50: Forecaster artifact exists on disk
    ef_art = ef_meta["artifact_path"]
    t.assert_true(os.path.exists(ef_art), "TEST-50", f"Forecaster joblib artifact exists on disk at {ef_art}")

    # Test 51: Multivariate anomaly detector exists in registry
    t.assert_true("model_multivariate_anomaly_detector" in models_dict, "TEST-51", "Multivariate anomaly detector is registered")

    # Test 52: Anomaly detector F1 score >= 0.90
    anom_meta = models_dict["model_multivariate_anomaly_detector"]
    f1 = anom_meta["evaluation_metrics"]["f1_score"]
    t.assert_true(f1 >= 0.90, "TEST-52", f"Multivariate anomaly detector achieves F1 >= 0.90 (Achieved: {f1})")

    # Test 53: Anomaly detector ROC-AUC >= 0.90
    roc_auc = anom_meta["evaluation_metrics"]["roc_auc"]
    t.assert_true(roc_auc >= 0.90, "TEST-53", f"Multivariate anomaly detector achieves ROC-AUC >= 0.90 (Achieved: {roc_auc})")

    # Test 54: Predictive maintenance model exists in registry
    t.assert_true("model_predictive_maintenance_rul" in models_dict, "TEST-54", "Predictive maintenance RUL classifier is registered")

    # Test 55: Predictive maintenance explicit research disclosure
    pm_meta = models_dict["model_predictive_maintenance_rul"]
    t.assert_equal(pm_meta["disclosure_risk_level"], "CALIBRATED_RESEARCH_PROTOTYPE", "TEST-55", "Predictive maintenance explicitly marked CALIBRATED_RESEARCH_PROTOTYPE")

    # Test 56: Benchmark comparison engine calculates relative SFC
    with open("LLM/datasets/validated/ds_synthetic_ops_bharati_validated.json") as f:
        ind_ops = json.load(f)
    with open("LLM/datasets/validated/ds_aad_benchmark_davis_validated.json") as f:
        aad_ops = json.load(f)
    comp = BenchmarkComparisonEngine.compare_station_against_aad_benchmark(ind_ops, aad_ops)
    t.assert_true(comp["relative_fuel_efficiency_index"] > 0.0, "TEST-56", "Benchmark comparison computes relative fuel efficiency ratio")

    # --------------------------------------------------------------------------
    # GROUP 7: Digital Twin State Derivation & Physics Coupling (Tests 57 - 64)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 7: Digital Twin State Derivation & Physics Coupling")

    # Test 57: Heating demand increases as ambient temperature drops
    gen = SyntheticOpsGenerator("station_bharati", seed=42)
    dt_ref = datetime(2025, 7, 1, 12, 0, 0, tzinfo=timezone.utc)
    h_mild = gen.generate_coupled_hour(dt_ref, temp_ambient_c=-10.0, wind_speed_ms=5.0)
    h_cold = gen.generate_coupled_hour(dt_ref, temp_ambient_c=-35.0, wind_speed_ms=5.0)
    load_mild = h_mild["energy_grid"]["hvac_load_kw"]
    load_cold = h_cold["energy_grid"]["hvac_load_kw"]
    t.assert_true(load_cold > load_mild, "TEST-57", f"Thermodynamic coupling: HVAC load at -35°C ({load_cold}kW) > load at -10°C ({load_mild}kW)")

    # Test 58: Convective wind increases heating demand
    h_calm = gen.generate_coupled_hour(dt_ref, temp_ambient_c=-20.0, wind_speed_ms=2.0)
    h_windy = gen.generate_coupled_hour(dt_ref, temp_ambient_c=-20.0, wind_speed_ms=25.0)
    t.assert_true(h_windy["energy_grid"]["hvac_load_kw"] > h_calm["energy_grid"]["hvac_load_kw"], "TEST-58", "Convective wind surge increases HVAC building heat loss")

    # Test 59: Genset fuel rate scales monotonically with generator load
    f_rate_mild = h_mild["lead_genset_telemetry"]["fuel_rate_lph"]
    f_rate_cold = h_cold["lead_genset_telemetry"]["fuel_rate_lph"]
    t.assert_true(f_rate_cold > f_rate_mild, "TEST-59", "Genset fuel rate increases monotonically with electrical load demand")

    # Test 60: Mechanical wear increases vibration RMS
    h_normal = gen.generate_coupled_hour(dt_ref, -20.0, 10.0, wear_factor=0.0)
    h_worn = gen.generate_coupled_hour(dt_ref, -20.0, 10.0, wear_factor=0.8)
    vib_norm = h_normal["lead_genset_telemetry"]["vibration_rms_mms"]
    vib_worn = h_worn["lead_genset_telemetry"]["vibration_rms_mms"]
    t.assert_true(vib_worn > vib_norm, "TEST-60", f"Mechanical wear increases vibration RMS ({vib_worn}mm/s > {vib_norm}mm/s)")

    # Test 61: Injector clog triggers exhaust temperature elevation
    h_clean = gen.generate_coupled_hour(dt_ref, -20.0, 10.0, injector_clog=False)
    h_clogged = gen.generate_coupled_hour(dt_ref, -20.0, 10.0, injector_clog=True)
    exh_clean = h_clean["lead_genset_telemetry"]["exhaust_temp_c"]
    exh_clogged = h_clogged["lead_genset_telemetry"]["exhaust_temp_c"]
    t.assert_true(exh_clogged > exh_clean, "TEST-61", f"Injector clog elevates exhaust gas temperature ({exh_clogged}°C > {exh_clean}°C)")

    # Test 62: High wind turbine cutout protection
    h_safe_wind = gen.generate_coupled_hour(dt_ref, -20.0, wind_speed_ms=15.0)
    h_cutout_wind = gen.generate_coupled_hour(dt_ref, -20.0, wind_speed_ms=28.0)
    t.assert_true(h_safe_wind["energy_grid"]["wind_output_kw"] > 0.0 and h_cutout_wind["energy_grid"]["wind_output_kw"] == 0.0, "TEST-62", "Wind turbine enters automatic cutout shutdown at > 22 m/s storm wind")

    # Test 63: Grid reserve margin is bounded between 0% and 100%
    res_pct = h_cold["energy_grid"]["reserve_margin_pct"]
    t.assert_true(0.0 <= res_pct <= 100.0, "TEST-63", f"Station spinning reserve margin is properly bounded ({res_pct}%)")

    # Test 64: Digital Twin state graph nodes and edges are populated
    with open("LLM/metadata/lineage_graph.json") as f:
        graph = json.load(f)
    t.assert_true(len(graph["nodes"]) >= 8 and len(graph["edges"]) >= 7, "TEST-64", "Lineage graph contains complete set of nodes and directed edges")

    # --------------------------------------------------------------------------
    # GROUP 8: LLM Evidence Grounding & Anti-Hallucination Guardrails (Tests 65 - 70)
    # --------------------------------------------------------------------------
    print("\n>>> GROUP 8: LLM Evidence Grounding & Anti-Hallucination Guardrails")

    # Test 65: Grounding prompt includes critical system instructions
    t.assert_true("NEVER invent, fabricate, or assume station telemetry" in SYSTEM_PROMPT_EVIDENCE_GROUNDED, "TEST-65", "System prompt enforces zero-hallucination protocol")

    # Test 66: Format evidence context prepends provenance tier
    ev_context = format_evidence_context([
        {"station_id": "station_bharati", "timestamp": "2025-07-01T12:00:00Z", "provenance_type": "REAL_NCPOR", "temperature_c": -23.4, "wind_speed_ms": 12.1}
    ])
    t.assert_true("[REAL_NCPOR]" in ev_context, "TEST-66", "Evidence formatter explicitly stamps [REAL_NCPOR] provenance tier")

    # Test 67: Format evidence context preserves Australian benchmark separation
    aad_context = format_evidence_context([
        {"benchmark_station": "Davis Station", "timestamp": "2024-07-01T12:00:00Z", "provenance_type": "EXTERNAL_ANTARCTIC_BENCHMARK", "electrical_load_kw": 220.5}
    ])
    t.assert_true("[EXTERNAL_ANTARCTIC_BENCHMARK]" in aad_context and "Davis Station" in aad_context, "TEST-67", "Evidence context maintains Davis Station and EXTERNAL_ANTARCTIC_BENCHMARK label")

    # Test 68: Empty evidence returns refusal indicator
    empty_context = format_evidence_context([])
    t.assert_equal(empty_context, "NO EVIDENCE RECORDS FOUND IN DATABASE.", "TEST-68", "Empty evidence context returns explicit NO EVIDENCE indicator")

    # Test 69: build_grounded_prompt injects both query and evidence
    full_prompt = build_grounded_prompt("What is current Bharati wind speed?", [
        {"station_id": "station_bharati", "timestamp": "2025-07-01T12:00:00Z", "provenance_type": "REAL_NCPOR", "wind_speed_ms": 14.2}
    ])
    t.assert_true("What is current Bharati wind speed?" in full_prompt and "Wind=14.2m/s" in full_prompt, "TEST-69", "Prompt builder fuses user query with database evidence")

    # Test 70: Refusal policy clause present in system prompt
    t.assert_true("DATA UNAVAILABLE" in SYSTEM_PROMPT_EVIDENCE_GROUNDED, "TEST-70", "Refusal clause for ungrounded queries is strictly codified in system prompt")

    print("\n" + "=" * 75)
    print(f"FINAL RESULT: {t.passed} / {t.total} TESTS PASSED ({(t.passed / t.total) * 100:.1f}%)")
    if t.failed > 0:
        print(f"FAILED TESTS ({t.failed}):")
        for fid, desc in t.failures:
            print(f"  - [{fid}] {desc}")
        sys.exit(1)
    else:
        print("ALL 70 ACCEPTANCE CRITERIA TESTS PASSED WITH 100% SUCCESS RATE!")
        print("=" * 75)
        sys.exit(0)


if __name__ == "__main__":
    run_all_tests()
