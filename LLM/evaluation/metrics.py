"""
POLAR-TWIN Data Engineering: Evaluation Metrics
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Computes standard ML regression and classification metrics with baseline comparisons:
- MAE, RMSE, MAPE, R²
- Precision, Recall, F1-Score, ROC-AUC, PR-AUC
- Baseline Superiority Delta (%)
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.metrics import (
    mean_absolute_error,
    root_mean_squared_error,
    r2_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score
)


class ModelEvaluator:
    @staticmethod
    def evaluate_regression(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_baseline: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluates regression predictions against ground truth and baseline.
        Calculates percentage improvement of model over naive baseline.
        """
        mae = float(mean_absolute_error(y_true, y_pred))
        rmse = float(root_mean_squared_error(y_true, y_pred))
        r2 = float(r2_score(y_true, y_pred))
        
        # Mean Absolute Percentage Error (avoid division by 0)
        nonzero_mask = np.abs(y_true) > 1e-4
        if np.any(nonzero_mask):
            mape = float(np.mean(np.abs((y_true[nonzero_mask] - y_pred[nonzero_mask]) / y_true[nonzero_mask])) * 100.0)
        else:
            mape = 0.0

        # Baseline evaluation
        baseline_mae = float(mean_absolute_error(y_true, y_baseline))
        baseline_rmse = float(root_mean_squared_error(y_true, y_baseline))
        
        # Improvement delta: (baseline_mae - model_mae) / baseline_mae * 100%
        improvement_pct = 0.0
        if baseline_mae > 1e-6:
            improvement_pct = float(((baseline_mae - mae) / baseline_mae) * 100.0)

        return {
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "r2": round(r2, 4),
            "mape_pct": round(mape, 2),
            "baseline_mae": round(baseline_mae, 4),
            "baseline_rmse": round(baseline_rmse, 4),
            "improvement_over_baseline_pct": round(improvement_pct, 2)
        }

    @staticmethod
    def evaluate_classification(
        y_true: np.ndarray,
        y_pred: np.ndarray,
        y_scores: np.ndarray
    ) -> Dict[str, float]:
        """
        Evaluates anomaly detection or binary classification.
        """
        prec = float(precision_score(y_true, y_pred, zero_division=0))
        rec = float(recall_score(y_true, y_pred, zero_division=0))
        f1 = float(f1_score(y_true, y_pred, zero_division=0))

        try:
            roc_auc = float(roc_auc_score(y_true, y_scores))
        except Exception:
            roc_auc = 0.5

        try:
            pr_auc = float(average_precision_score(y_true, y_scores))
        except Exception:
            pr_auc = 0.0

        return {
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4)
        }
