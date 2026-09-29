"""
POLAR-TWIN Data Engineering: Feature Normalizer
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Scales and normalizes feature matrices with persistent parameters.
"""

from typing import Dict, Any, List
import numpy as np


class FeatureNormalizer:
    def __init__(self):
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.fitted = False

    def fit(self, X: np.ndarray, feature_names: List[str]):
        """Fits mean and std for each feature."""
        self.means = {}
        self.stds = {}
        for col_idx, name in enumerate(feature_names):
            vals = X[:, col_idx]
            m = float(np.mean(vals))
            s = float(np.std(vals))
            self.means[name] = m
            self.stds[name] = s if s > 1e-6 else 1.0
        self.fitted = True

    def transform(self, X: np.ndarray, feature_names: List[str]) -> np.ndarray:
        """Standardizes features: z = (x - mean) / std."""
        if not self.fitted:
            raise RuntimeError("FeatureNormalizer must be fitted before transform")
        X_scaled = np.zeros_like(X, dtype=np.float32)
        for col_idx, name in enumerate(feature_names):
            m = self.means.get(name, 0.0)
            s = self.stds.get(name, 1.0)
            X_scaled[:, col_idx] = (X[:, col_idx] - m) / s
        return X_scaled

    def fit_transform(self, X: np.ndarray, feature_names: List[str]) -> np.ndarray:
        self.fit(X, feature_names)
        return self.transform(X, feature_names)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "means": self.means,
            "stds": self.stds,
            "fitted": self.fitted
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FeatureNormalizer":
        norm = cls()
        norm.means = data.get("means", {})
        norm.stds = data.get("stds", {})
        norm.fitted = data.get("fitted", False)
        return norm
