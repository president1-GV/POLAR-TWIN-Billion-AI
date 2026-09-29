"""
POLAR-TWIN Data Engineering: Physics-Informed Feature Engineering
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Generates domain-specific physics features:
- Heating Degree Hours (HDH)
- Wind-Chill Convective Acceleration
- Rolling statistical aggregates (mean, variance, load rate of change)
- Fuel efficiency index
"""

import math
from typing import List, Dict, Any
import numpy as np


class FeatureEngineer:
    def __init__(self, target_indoor_temp_c: float = 20.0):
        self.target_temp = target_indoor_temp_c

    def extract_physics_features(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Appends physics-informed features to meteorological and energy observations:
        - heating_degree_hours: max(0, 20.0 - temp_c)
        - wind_chill_factor: wind_speed_ms ** 0.5
        - convective_heat_demand_index: (20 - temp) * (1 + 0.02 * wind)
        - rolling_temp_mean_6h
        - rolling_load_mean_6h
        - load_delta_1h
        """
        enriched = []
        temp_window = []
        load_window = []
        last_load = None

        for idx, r in enumerate(records):
            item = dict(r)
            
            # Weather features
            temp = float(item.get("temperature_c", -20.0))
            wind = float(item.get("wind_speed_ms", 8.0))
            
            hdh = max(0.0, self.target_temp - temp)
            wind_chill_factor = round(math.sqrt(max(0.0, wind)), 3)
            convective_index = round(hdh * (1.0 + 0.018 * wind), 2)
            
            item["feat_hdh"] = hdh
            item["feat_wind_chill_factor"] = wind_chill_factor
            item["feat_convective_demand_index"] = convective_index
            
            # Rolling temp
            temp_window.append(temp)
            if len(temp_window) > 6:
                temp_window.pop(0)
            item["feat_temp_roll_mean_6h"] = round(float(np.mean(temp_window)), 2)

            # Energy load features if present
            load_kw = None
            if "energy_grid" in item and "total_consumption_kw" in item["energy_grid"]:
                load_kw = float(item["energy_grid"]["total_consumption_kw"])
            elif "total_consumption_kw" in item:
                load_kw = float(item["total_consumption_kw"])
            elif "electrical_load_kw" in item:
                load_kw = float(item["electrical_load_kw"])

            if load_kw is not None:
                load_window.append(load_kw)
                if len(load_window) > 6:
                    load_window.pop(0)
                item["feat_load_roll_mean_6h"] = round(float(np.mean(load_window)), 2)
                item["feat_load_delta_1h"] = round(load_kw - (last_load if last_load is not None else load_kw), 2)
                last_load = load_kw
            else:
                item["feat_load_roll_mean_6h"] = 0.0
                item["feat_load_delta_1h"] = 0.0

            enriched.append(item)

        return enriched

    def build_feature_matrix(self, records: List[Dict[str, Any]], feature_keys: List[str]) -> np.ndarray:
        """Constructs 2D numpy matrix of features for scikit-learn models."""
        matrix = []
        for r in records:
            row = []
            for k in feature_keys:
                val = r.get(k, 0.0)
                if val is None or not isinstance(val, (int, float)):
                    val = 0.0
                row.append(float(val))
            matrix.append(row)
        return np.array(matrix, dtype=np.float32)
