"""
POLAR-TWIN Data Engineering: Master Ingestion Pipeline
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Executes end-to-end ingestion:
1. Connects to official sources (NCPOR, AAD, Copernicus, Physics Synthetic)
2. Computes and enforces SHA-256 integrity
3. Audits data quality via Antarctic Physical Quality Engine
4. Normalizes UTC timestamps and extracts physics features
5. Persists lineage and quality metrics into Supabase and local artifacts
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List
import urllib.request
import urllib.error

from LLM.schemas.provenance_schema import ProvenanceType, QualityStatus, DataQualityReport
from LLM.connectors.ncpor_aws_connector import NcporAwsConnector
from LLM.connectors.aad_connector import AadBenchmarkConnector
from LLM.connectors.copernicus_sea_ice import CopernicusSeaIceConnector
from LLM.simulation.synthetic_ops_generator import SyntheticOpsGenerator
from LLM.preprocessing.quality_engine import DataQualityEngine
from LLM.preprocessing.cleaner import DataCleaner
from LLM.preprocessing.feature_engineer import FeatureEngineer
from LLM.ingestion.hash_verifier import HashVerifier


class IngestionPipeline:
    def __init__(self):
        self.raw_dir = os.path.join("LLM", "datasets", "raw")
        self.val_dir = os.path.join("LLM", "datasets", "validated")
        self.norm_dir = os.path.join("LLM", "datasets", "normalized")
        self.feat_dir = os.path.join("LLM", "datasets", "features")
        
        for d in [self.raw_dir, self.val_dir, self.norm_dir, self.feat_dir]:
            os.makedirs(d, exist_ok=True)

        self._load_supabase_env()

    def _load_supabase_env(self):
        self.supabase_url = os.getenv("SUPABASE_URL", "")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "") or os.getenv("SUPABASE_ANON_KEY", "")
        if not self.supabase_url and os.path.exists(".env"):
            with open(".env", "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        if k.strip() == "SUPABASE_URL":
                            self.supabase_url = v.strip()
                        elif k.strip() in ("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_ANON_KEY") and not self.supabase_key:
                            self.supabase_key = v.strip()

    def _post_supabase(self, table: str, payload: Any):
        """Optional synchronous update to Supabase via PostgREST."""
        if not self.supabase_url or not self.supabase_key:
            return None
        url = f"{self.supabase_url}/rest/v1/{table}"
        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal"
        }
        data = json.dumps(payload, default=str).encode("utf-8")
        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=5) as resp:
                return resp.status
        except Exception:
            return None

    def ingest_ncpor_aws(self, station_id: str = "station_bharati", count: int = 168) -> Dict[str, Any]:
        """Ingests official NCPOR AWS observations with strict REAL_NCPOR provenance."""
        connector = NcporAwsConnector(station_id=station_id)
        raw_payload = connector.fetch_raw(count=count)
        raw_hash = connector.compute_sha256(raw_payload)

        # Parse & Clean
        records = connector.parse_records(raw_payload)
        cleaned = DataCleaner.normalize_utc_timestamps(records)
        cleaned = DataCleaner.deduplicate(cleaned, key_fields=["station_id", "timestamp"])

        # Quality Audit
        quality_engine = DataQualityEngine(dataset_id=connector.dataset_id)
        quality_report = quality_engine.audit_observations(cleaned)

        # Feature Engineering
        feat_engineer = FeatureEngineer()
        enriched = feat_engineer.extract_physics_features(cleaned)

        # Persist locally
        val_path = os.path.join(self.val_dir, f"{connector.dataset_id}_validated.json")
        with open(val_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, indent=2, default=str)

        feat_path = os.path.join(self.feat_dir, f"{connector.dataset_id}_features.json")
        with open(feat_path, "w", encoding="utf-8") as f:
            json.dump(enriched, f, indent=2, default=str)

        # Push Quality Report to Supabase
        self._post_supabase("data_quality_reports", {
            "dataset_id": connector.dataset_id,
            "check_type": quality_report.check_type,
            "passed": quality_report.passed,
            "total_records": quality_report.total_records,
            "invalid_records": quality_report.invalid_records,
            "null_counts": quality_report.null_counts,
            "outlier_counts": quality_report.outlier_counts,
            "violations": quality_report.violations
        })

        # Update dataset stats
        self._post_supabase("ingestion_runs", {
            "source_id": connector.dataset_id,
            "dataset_id": connector.dataset_id,
            "status": "COMPLETED",
            "records_ingested": len(cleaned),
            "records_rejected": quality_report.invalid_records,
            "checksum": raw_hash
        })

        return {
            "dataset_id": connector.dataset_id,
            "provenance_type": connector.provenance_type.value,
            "sha256_hash": raw_hash,
            "record_count": len(cleaned),
            "quality_report": quality_report.dict(),
            "validated_path": val_path,
            "features_path": feat_path
        }

    def ingest_aad_benchmark(self, count: int = 168) -> Dict[str, Any]:
        """Ingests Australian Antarctic Division benchmark with EXTERNAL_ANTARCTIC_BENCHMARK."""
        connector = AadBenchmarkConnector()
        raw_payload = connector.fetch_raw(count=count)
        raw_hash = connector.compute_sha256(raw_payload)

        records = connector.parse_records(raw_payload)
        cleaned = DataCleaner.normalize_utc_timestamps(records)

        val_path = os.path.join(self.val_dir, f"{connector.dataset_id}_validated.json")
        with open(val_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, indent=2, default=str)

        return {
            "dataset_id": connector.dataset_id,
            "provenance_type": connector.provenance_type.value,
            "source_country": "Australia",
            "sha256_hash": raw_hash,
            "record_count": len(cleaned),
            "validated_path": val_path
        }

    def ingest_copernicus_sea_ice(self, days: int = 90) -> Dict[str, Any]:
        """Ingests Copernicus sea ice observations with PUBLIC_EXTERNAL."""
        connector = CopernicusSeaIceConnector()
        raw_payload = connector.fetch_raw(days=days)
        raw_hash = connector.compute_sha256(raw_payload)

        records = connector.parse_records(raw_payload)
        cleaned = DataCleaner.normalize_utc_timestamps(records)

        val_path = os.path.join(self.val_dir, f"{connector.dataset_id}_validated.json")
        with open(val_path, "w", encoding="utf-8") as f:
            json.dump(cleaned, f, indent=2, default=str)

        return {
            "dataset_id": connector.dataset_id,
            "provenance_type": connector.provenance_type.value,
            "sha256_hash": raw_hash,
            "record_count": len(cleaned),
            "validated_path": val_path
        }

    def ingest_synthetic_ops(self, station_id: str = "station_bharati", hours: int = 336) -> Dict[str, Any]:
        """Ingests physics-coupled operational telemetry with SIMULATED provenance."""
        generator = SyntheticOpsGenerator(station_id=station_id, seed=42)
        records = generator.generate_sequence(hours=hours)
        raw_hash = HashVerifier.compute_sha256(records)

        dataset_id = f"ds_synthetic_ops_{station_id.split('_')[1]}"
        raw_path = os.path.join(self.raw_dir, f"{dataset_id}_raw.json")
        with open(raw_path, "w", encoding="utf-8") as f:
            json.dump({
                "dataset_id": dataset_id,
                "provenance_type": ProvenanceType.SIMULATED.value,
                "sha256_hash": raw_hash,
                "records": records
            }, f, indent=2, default=str)

        val_path = os.path.join(self.val_dir, f"{dataset_id}_validated.json")
        with open(val_path, "w", encoding="utf-8") as f:
            json.dump(records, f, indent=2, default=str)

        return {
            "dataset_id": dataset_id,
            "provenance_type": ProvenanceType.SIMULATED.value,
            "sha256_hash": raw_hash,
            "record_count": len(records),
            "validated_path": val_path
        }

    def run_all(self) -> Dict[str, Any]:
        """Runs the entire master ingestion suite across all sources."""
        results = {
            "bharati_ncpor": self.ingest_ncpor_aws("station_bharati", count=168),
            "maitri_ncpor": self.ingest_ncpor_aws("station_maitri", count=168),
            "aad_benchmark": self.ingest_aad_benchmark(count=168),
            "copernicus_sea_ice": self.ingest_copernicus_sea_ice(days=90),
            "synthetic_bharati_ops": self.ingest_synthetic_ops("station_bharati", hours=336)
        }
        return results
