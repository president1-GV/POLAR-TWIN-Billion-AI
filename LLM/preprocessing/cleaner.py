"""
POLAR-TWIN Data Engineering: Data Cleaner
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Cleans raw datasets: deduplication, UTC timezone normalization, interpolation.
"""

from typing import List, Dict, Any
from datetime import datetime, timezone


class DataCleaner:
    @staticmethod
    def deduplicate(records: List[Dict[str, Any]], key_fields: List[str] = None) -> List[Dict[str, Any]]:
        """Removes duplicate records based on composite key (defaults to station_id + timestamp)."""
        if key_fields is None:
            key_fields = ["station_id", "timestamp"]

        seen = set()
        deduped = []
        for r in records:
            composite_key = tuple(str(r.get(k, "")) for k in key_fields)
            if composite_key not in seen:
                seen.add(composite_key)
                deduped.append(r)
        return deduped

    @staticmethod
    def normalize_utc_timestamps(records: List[Dict[str, Any]], ts_field: str = "timestamp") -> List[Dict[str, Any]]:
        """Ensures all timestamps are standardized ISO-8601 UTC strings."""
        normalized = []
        for r in records:
            r_copy = dict(r)
            ts = r.get(ts_field)
            if ts:
                if isinstance(ts, str):
                    dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                elif isinstance(ts, datetime):
                    dt = ts
                else:
                    dt = datetime.utcnow()
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                else:
                    dt = dt.astimezone(timezone.utc)
                r_copy[ts_field] = dt.isoformat()
            normalized.append(r_copy)
        return normalized

    @staticmethod
    def forward_fill_missing(records: List[Dict[str, Any]], metric_keys: List[str]) -> List[Dict[str, Any]]:
        """Forward-fills missing values with quality flag marking."""
        last_known = {}
        cleaned = []
        for r in records:
            r_copy = dict(r)
            for k in metric_keys:
                if k in r_copy and r_copy[k] is not None:
                    last_known[k] = r_copy[k]
                elif k in last_known:
                    r_copy[k] = last_known[k]
                    r_copy["quality"] = "INTERPOLATED"
            cleaned.append(r_copy)
        return cleaned
