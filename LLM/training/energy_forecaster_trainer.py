"""
POLAR-TWIN Data Engineering: Energy & Fuel Demand Forecaster Trainer
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Trains physics-informed gradient boosting model on Antarctic energy demand.
Enforces chronological split and verifies MAE improvement >= 10% over naive baseline.
"""

import os
import json
import hashlib
from datetime import datetime
import numpy as np
import joblib
from sklearn.ensemble import GradientBoostingRegressor

from LLM.training.split_manager import TemporalSplitManager
from LLM.evaluation.metrics import ModelEvaluator
from LLM.preprocessing.feature_engineer import FeatureEngineer


class EnergyForecasterTrainer:
    def __init__(self, station_id: str = "station_bharati"):
        self.station_id = station_id
        self.model_id = "model_energy_demand_forecaster"
        self.version = "v1.3.0"
        self.model_dir = os.path.join("LLM", "models")
        os.makedirs(self.model_dir, exist_ok=True)
        self.artifact_path = os.path.join(self.model_dir, "energy_demand_forecaster.joblib")
        self.meta_path = os.path.join(self.model_dir, "energy_demand_forecaster_meta.json")

    def train_and_evaluate(self) -> Dict[str, Any]:
        """
        Loads operational telemetry, performs chronological split, trains GBDT,
        evaluates against naive baseline, and saves artifact.
        """
        # Load synthetic/derived dataset
        raw_ops_path = os.path.join("LLM", "datasets", "validated", f"ds_synthetic_ops_{self.station_id.split('_')[1]}_validated.json")
        if not os.path.exists(raw_ops_path):
            raise FileNotFoundError(f"Operational dataset not found at {raw_ops_path}. Run ingestion first.")

        with open(raw_ops_path, "r", encoding="utf-8") as f:
            records = json.load(f)

        # 1. Feature Engineering
        feat_eng = FeatureEngineer()
        enriched = feat_eng.extract_physics_features(records)

        # 2. Chronological Split (70/15/15)
        train_recs, val_recs, test_recs = TemporalSplitManager.chronological_split(
            enriched, train_ratio=0.70, val_ratio=0.15, test_ratio=0.15
        )

        feature_cols = [
            "feat_hdh",
            "feat_wind_chill_factor",
            "feat_convective_demand_index",
            "feat_temp_roll_mean_6h",
            "feat_load_roll_mean_6h",
            "feat_load_delta_1h"
        ]

        def extract_xy(recs):
            X = []
            y = []
            for r in recs:
                grid = r.get("energy_grid", {})
                target = grid.get("total_consumption_kw", 0.0)
                row = [r.get(c, 0.0) for c in feature_cols]
                X.append(row)
                y.append(target)
            return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)

        X_train, y_train = extract_xy(train_recs)
        X_val, y_val = extract_xy(val_recs)
        X_test, y_test = extract_xy(test_recs)

        # 3. Train Model
        hyperparams = {
            "n_estimators": 120,
            "max_depth": 4,
            "learning_rate": 0.07,
            "subsample": 0.85,
            "random_state": 42
        }
        model = GradientBoostingRegressor(**hyperparams)
        model.fit(X_train, y_train)

        # 4. Predict on Test
        y_pred = model.predict(X_test)

        # Naive baseline: persistence y_baseline[t] = y_test[t-1] (or previous value)
        y_baseline = np.empty_like(y_test)
        y_baseline[0] = y_train[-1] if len(y_train) > 0 else y_test[0]
        y_baseline[1:] = y_test[:-1]

        # 5. Evaluate
        metrics = ModelEvaluator.evaluate_regression(y_test, y_pred, y_baseline)

        # 6. Save Artifact
        joblib.dump(model, self.artifact_path)
        with open(self.artifact_path, "rb") as f:
            artifact_sha256 = hashlib.sha256(f.read()).hexdigest()

        metadata = {
            "model_id": self.model_id,
            "model_name": "GradientBoosting Energy & Fuel Forecaster",
            "version": self.version,
            "framework": "scikit-learn",
            "task_type": "ENERGY_DEMAND_FORECAST",
            "station_id": self.station_id,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "features": feature_cols,
            "hyperparameters": hyperparams,
            "metrics": metrics,
            "artifact_path": self.artifact_path,
            "artifact_sha256": artifact_sha256,
            "passed_10pct_superiority": bool(metrics["improvement_over_baseline_pct"] >= 10.0),
            "disclosure_risk_level": "CALIBRATED_RESEARCH_PROTOTYPE",
            "timestamp": datetime.utcnow().isoformat()
        }

        with open(self.meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        return metadata
