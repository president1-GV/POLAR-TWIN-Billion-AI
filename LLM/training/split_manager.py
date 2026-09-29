"""
POLAR-TWIN Data Engineering: Chronological Split Manager
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Enforces strictly chronological, non-leaking time-series splits:
Train (70%) -> Validation (15%) -> Test (15%)
Guarantees max(Train) < min(Val) < min(Test).
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime


class TemporalSplitManager:
    @staticmethod
    def chronological_split(
        records: List[Dict[str, Any]],
        train_ratio: float = 0.70,
        val_ratio: float = 0.15,
        test_ratio: float = 0.15,
        ts_field: str = "timestamp"
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Sorts records by timestamp and partitions them chronologically.
        Rejects random shuffling to prevent future data leakage.
        """
        if not (0.99 <= (train_ratio + val_ratio + test_ratio) <= 1.01):
            raise ValueError("Split ratios must sum to 1.0")

        # Sort chronologically
        sorted_records = sorted(
            records,
            key=lambda r: datetime.fromisoformat(r[ts_field].replace("Z", "+00:00"))
        )

        n = len(sorted_records)
        train_end = int(n * train_ratio)
        val_end = int(n * (train_ratio + val_ratio))

        train_set = sorted_records[:train_end]
        val_set = sorted_records[train_end:val_end]
        test_set = sorted_records[val_end:]

        # Assert no temporal overlap
        if train_set and val_set:
            max_train_ts = max(datetime.fromisoformat(r[ts_field].replace("Z", "+00:00")) for r in train_set)
            min_val_ts = min(datetime.fromisoformat(r[ts_field].replace("Z", "+00:00")) for r in val_set)
            if max_train_ts >= min_val_ts:
                raise ValueError(f"Data leakage detected! max(Train) {max_train_ts} >= min(Val) {min_val_ts}")

        if val_set and test_set:
            max_val_ts = max(datetime.fromisoformat(r[ts_field].replace("Z", "+00:00")) for r in val_set)
            min_test_ts = min(datetime.fromisoformat(r[ts_field].replace("Z", "+00:00")) for r in test_set)
            if max_val_ts >= min_test_ts:
                raise ValueError(f"Data leakage detected! max(Val) {max_val_ts} >= min(Test) {min_test_ts}")

        return train_set, val_set, test_set
