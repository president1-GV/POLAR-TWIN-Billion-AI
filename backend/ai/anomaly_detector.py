import math
import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

class MahalanobisMultivariateDetector:
    """
    Multivariate anomaly detector for Antarctic rotating machinery (Gensets & Turbines).
    Uses Mahalanobis distance based on calibrated covariance matrix of baseline operation.
    Status is strictly labeled as PROTOTYPE / SYNTHETICALLY CALIBRATED.
    """
    MODEL_NAME = "MahalanobisMultivariateDetector"
    MODEL_VERSION = "v1.4-calibrated"
    MODEL_STATUS = "PROTOTYPE / SYNTHETICALLY CALIBRATED"

    # Feature names: [exhaust_temp_c, vibration_mms, load_pct, oil_pressure_bar, fuel_flow_lph]
    FEATURE_NAMES = [
        "exhaust_temp_c",
        "vibration_mms",
        "load_pct",
        "oil_pressure_bar",
        "fuel_flow_lph"
    ]

    # Baseline nominal means for 250kVA Kirloskar at normal Antarctic operating load (~75%)
    BASELINE_MEANS = np.array([385.0, 2.1, 74.0, 4.6, 38.5], dtype=float)

    # Standard deviations for normalization
    BASELINE_STDS = np.array([25.0, 0.45, 12.0, 0.35, 4.2], dtype=float)

    # Calibrated correlation matrix under healthy operation
    CORR_MATRIX = np.array([
        [1.00,  0.42,  0.88, -0.45,  0.92],  # exhaust_temp
        [0.42,  1.00,  0.51, -0.28,  0.48],  # vibration
        [0.88,  0.51,  1.00, -0.52,  0.96],  # load_pct
        [-0.45, -0.28, -0.52,  1.00, -0.50], # oil_pressure
        [0.92,  0.48,  0.96, -0.50,  1.00],  # fuel_flow
    ], dtype=float)

    def __init__(self):
        # Calculate covariance matrix Sigma = D * R * D
        diag = np.diag(self.BASELINE_STDS)
        self.cov_matrix = np.dot(np.dot(diag, self.CORR_MATRIX), diag)
        # Precompute pseudo-inverse of covariance matrix for numerical stability
        self.inv_cov = np.linalg.pinv(self.cov_matrix)
        # Threshold for chi-square with 5 degrees of freedom at p=0.01 is ~15.08, sqrt is ~3.88
        self.threshold_warning = 3.0
        self.threshold_critical = 4.5

    def analyze(self, telemetry: Dict[str, Any], asset_id: str = "bh_gen_01") -> Dict[str, Any]:
        """
        Calculates multivariate Mahalanobis distance and extracts feature-level attributions.
        """
        # Extract features with sensible defaults
        exh = float(telemetry.get("exhaust_temp_c", 385.0))
        vib = float(telemetry.get("vibration_mms", 2.1))
        load = float(telemetry.get("load_pct", 74.0))
        oil = float(telemetry.get("oil_pressure_bar", 4.6))
        fuel = float(telemetry.get("fuel_flow_lph", 38.5))

        x = np.array([exh, vib, load, oil, fuel], dtype=float)
        diff = x - self.BASELINE_MEANS
        
        # Mahalanobis distance D_M = sqrt(diff.T * inv_cov * diff)
        d_sq = float(np.dot(np.dot(diff.T, self.inv_cov), diff))
        mahalanobis_dist = round(math.sqrt(max(0.0, d_sq)), 2)

        # Feature level z-scores for attribution & explainability
        z_scores = (x - self.BASELINE_MEANS) / self.BASELINE_STDS
        deviant_features = []
        features_analyzed = []

        feature_units = {
            "exhaust_temp_c": "°C",
            "vibration_mms": "mm/s",
            "load_pct": "%",
            "oil_pressure_bar": "bar",
            "fuel_flow_lph": "L/h"
        }

        normal_bounds = {
            "exhaust_temp_c": (320.0, 420.0),
            "vibration_mms": (1.2, 2.8),
            "load_pct": (45.0, 85.0),
            "oil_pressure_bar": (3.8, 5.2),
            "fuel_flow_lph": (25.0, 48.0)
        }

        for i, name in enumerate(self.FEATURE_NAMES):
            val = round(float(x[i]), 2)
            z = round(float(z_scores[i]), 2)
            lo, hi = normal_bounds[name]
            f_info = {
                "metric": name,
                "value": val,
                "unit": feature_units[name],
                "nominal_mean": float(self.BASELINE_MEANS[i]),
                "z_score": z,
                "normal_range": f"{lo} - {hi} {feature_units[name]}"
            }
            features_analyzed.append(f_info)

            if abs(z) >= 2.0 or val < lo or val > hi:
                direction = "elevated" if z > 0 else "depressed"
                deviant_features.append({
                    "metric": name,
                    "observed": f"{val} {feature_units[name]}",
                    "deviation": f"{abs(z):.1f}σ {direction}",
                    "significance": "HIGH" if abs(z) >= 3.0 else "MEDIUM"
                })

        # Failure Risk Evaluation
        if mahalanobis_dist >= self.threshold_critical or vib >= 4.5:
            risk = "CRITICAL"
            action = "Emergency inspection required: High probability of bearing seizure or mechanical unbalance. Transfer load to Auxiliary Genset BH-GEN-02 immediately."
        elif mahalanobis_dist >= self.threshold_warning or vib >= 3.2:
            risk = "ELEVATED"
            action = "Monitor thermal and vibration trends closely. Schedule lube oil inspection and check turbocharger intake filters."
        else:
            risk = "NORMAL"
            action = "Asset operating within nominal calibrated baseline parameters."

        return {
            "model_name": self.MODEL_NAME,
            "model_version": self.MODEL_VERSION,
            "evaluation_status": self.MODEL_STATUS,
            "asset_id": asset_id,
            "analyzed_at": datetime.now(timezone.utc).isoformat(),
            "anomaly_score": mahalanobis_dist,
            "threshold_warning": self.threshold_warning,
            "threshold_critical": self.threshold_critical,
            "is_anomaly": mahalanobis_dist >= self.threshold_warning,
            "predicted_failure_risk": risk,
            "confidence_label": "Calibrated statistical distance from synthetic Antarctic baseline",
            "features_analyzed": features_analyzed,
            "deviant_features": deviant_features,
            "recommended_action": action
        }

anomaly_detector = MahalanobisMultivariateDetector()
