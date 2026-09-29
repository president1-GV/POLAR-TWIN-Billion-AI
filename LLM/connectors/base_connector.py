"""
POLAR-TWIN Data Engineering: Base Connector Interface
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Defines standard interface for all data ingestion connectors with cryptographic integrity.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Tuple
import hashlib
import json
import os
from datetime import datetime
from LLM.schemas.provenance_schema import DatasetMetadata, ProvenanceType


class BaseDataConnector(ABC):
    def __init__(self, dataset_id: str, provenance_type: ProvenanceType, source_org: str, source_country: str = "India"):
        self.dataset_id = dataset_id
        self.provenance_type = provenance_type
        self.source_org = source_org
        self.source_country = source_country
        self.raw_data_path = os.path.join("LLM", "datasets", "raw", f"{dataset_id}_raw.json")

    @abstractmethod
    def fetch_raw(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Fetch raw payload from remote endpoint or local verified cache."""
        pass

    @abstractmethod
    def parse_records(self, raw_payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Normalize raw records into standard schema dictionaries."""
        pass

    def compute_sha256(self, data: Any) -> str:
        """Computes deterministic SHA-256 hex digest of string or JSON-serializable object."""
        if isinstance(data, (dict, list)):
            serialized = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
        elif isinstance(data, str):
            serialized = data.encode("utf-8")
        elif isinstance(data, bytes):
            serialized = data
        else:
            serialized = str(data).encode("utf-8")
        return hashlib.sha256(serialized).hexdigest()

    def save_raw(self, payload: Dict[str, Any]) -> str:
        """Saves raw payload with its cryptographic SHA-256 digest."""
        os.makedirs(os.path.dirname(self.raw_data_path), exist_ok=True)
        content_hash = self.compute_sha256(payload)
        wrapped = {
            "dataset_id": self.dataset_id,
            "provenance_type": self.provenance_type.value,
            "source_organization": self.source_org,
            "source_country": self.source_country,
            "sha256_hash": content_hash,
            "captured_at": datetime.utcnow().isoformat(),
            "payload": payload
        }
        with open(self.raw_data_path, "w", encoding="utf-8") as f:
            json.dump(wrapped, f, indent=2, default=str)
        return content_hash

    def load_raw(self) -> Tuple[Dict[str, Any], str]:
        """Loads cached raw payload and verifies cryptographic hash."""
        if not os.path.exists(self.raw_data_path):
            raise FileNotFoundError(f"Raw cache for {self.dataset_id} does not exist at {self.raw_data_path}")
        with open(self.raw_data_path, "r", encoding="utf-8") as f:
            wrapped = json.load(f)
        payload = wrapped.get("payload", {})
        expected_hash = wrapped.get("sha256_hash")
        computed_hash = self.compute_sha256(payload)
        if expected_hash and expected_hash != computed_hash:
            raise ValueError(f"Cryptographic hash mismatch for {self.dataset_id}! Expected {expected_hash}, got {computed_hash}")
        return payload, computed_hash
