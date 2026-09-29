"""
POLAR-TWIN Data Engineering: Multivariate Anomaly Detector Trainer
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Trains multivariate anomaly detection model combining Isolation Forest
and calibrated Mahalanobis covariance estimation for genset telemetry.
"""

import os
import json
import hashlib
from datetime import datetime
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

from LLM.training.split_manager import TemporalSplitManager
from LLM.evaluation.metrics import ModelEvaluator


class AnomalyDetectorTrainer:
    def __init__(self, station_id: str = "station_bharati"):
        self.station_id = station_id
        self.model_id = "model_multivariate_anomaly_detector"
        self.version = "v1.4.0"
        self.model_dir = os.path.join("LLM", "models")
        os.makedirs(self.model_dir, exist_ok=True)
        self.artifact_path = os.path.join(self.model_dir, "multivariate_anomaly_detector.joblib")
        self.meta_path = os.path.join(self.model_dir, "multivariate_anomaly_detector_meta.json")

    def train_and_evaluate(self) -> Dict[str, Any]:
        """
        Loads operational telemetry, fits covariance and IsolationForest on normal operations,
        evaluates precision/recall/F1 on injected anomaly sequences, and saves artifact.
        """
        raw_ops_path = os.path.join("LLM", "datasets", "validated", f"ds_synthetic_ops_{self.station_id.split('_')[1]}_validated.json")
        if not os.path.exists(raw_ops_path):
            raise FileNotFoundError(f"Operational dataset not found at {raw_ops_path}.")

        with open(raw_ops_path, "r", encoding="utf-8") as f:
            records = json.load(f)

        feature_cols = [
            "load_kw",
            "fuel_rate_lph",
            "exhaust_temp_c",
            "vibration_rms_mms",
            "coolant_temp_c",
            "oil_pressure_bar"
        ]

        X = []
        y_true = []
        for idx, r in enumerate(records):
            lead = r.get("lead_genset_telemetry", {})
            row = [float(lead.get(c, 0.0)) for c in feature_cols]
            X.append(row)
            # Ground truth: 1 for anomaly, 0 for normal
            is_anomaly = 1 if (100 <= idx <= 125) else 0
            y_true.append(is_anomaly)

        X = np.array(X, dtype=np.float32)
        y_true = np.array(y_true, dtype=np.int32)

        # Train on first 100 normal operating hours
        X_train = X[:100]
        X_test = X[100:]
        y_test = y_true[100:]

        # 1. Fit Mahalanobis parameters
        mean_vec = np.mean(X_train, axis=0)
        cov_mat = np.cov(X_train, rowvar=False) + np.eye(len(feature_cols)) * 1e-4
        inv_cov = np.linalg.inv(cov_mat)

        # 2. Fit IsolationForest
        iso = IsolationForest(n_estimators=100, contamination=0.08, random_state=42)
        iso.fit(X_train)

        # 3. Test evaluation via Mahalanobis distance with calibrated threshold 4.5
        diff = X_test - mean_vec
        mahal_dist = np.sqrt(np.sum(diff @ inv_cov * diff, axis=1))
        
        threshold = 4.5
        y_pred = (mahal_dist > threshold).astype(int)

        metrics = ModelEvaluator.evaluate_classification(y_test, y_pred, mahal_dist)

        # Save model bundle
        model_bundle = {
            "model_type": "MahalanobisMultivariateDetector",
            "mean_vector": mean_vec,
            "inv_cov_matrix": inv_cov,
            "threshold": threshold,
            "iso_forest": iso,
            "feature_names": feature_cols
        }
        joblib.dump(model_bundle, self.artifact_path)
        with open(self.artifact_path, "rb") as f:
            artifact_sha256 = hashlib.sha256(f.read()).hexdigest()

        metadata = {
            "model_id": self.model_id,
            "model_name": "Multivariate Mahalanobis & Isolation Forest Anomaly Detector",
            "version": self.version,
            "framework": "scikit-learn + numpy",
            "task_type": "MULTIVARIATE_ANOMALY",
            "station_id": self.station_id,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_cols,
            "hyperparameters": {
                "threshold": threshold,
                "n_estimators": 100,
                "covariance_regularization": 1e-4
            },
            "metrics": metrics,
            "artifact_path": self.artifact_path,
            "artifact_sha256": artifact_sha256,
            "disclosure_risk_level": "CALIBRATED_RESEARCH_PROTOTYPE",
            "timestamp": datetime.utcnow().isoformat()
        }

        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return metadata
