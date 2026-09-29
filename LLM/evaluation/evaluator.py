"""
POLAR-TWIN Data Engineering: Evaluation Runner
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Evaluates trained models and records test scores into model_runs and model_registry.
"""

from typing import Dict, Any, List
import numpy as np
from .metrics import ModelEvaluator


class PipelineEvaluator:
    def __init__(self):
        pass

    def evaluate_forecaster(self, y_true: np.ndarray, y_pred: np.ndarray, y_baseline: np.ndarray) -> Dict[str, Any]:
        metrics = ModelEvaluator.evaluate_regression(y_true, y_pred, y_baseline)
        passed_10pct_test = metrics["improvement_over_baseline_pct"] >= 10.0
        return {
            "task": "ENERGY_DEMAND_FORECAST",
            "passed_acceptance_criteria": passed_10pct_test,
            "metrics": metrics
        }

    def evaluate_anomaly_detector(self, y_true: np.ndarray, y_pred: np.ndarray, y_scores: np.ndarray) -> Dict[str, Any]:
        metrics = ModelEvaluator.evaluate_classification(y_true, y_pred, y_scores)
        passed_f1_test = metrics["f1_score"] >= 0.70
        return {
            "task": "MULTIVARIATE_ANOMALY",
            "passed_acceptance_criteria": passed_f1_test,
            "metrics": metrics
        }
