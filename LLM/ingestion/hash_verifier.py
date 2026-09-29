"""
POLAR-TWIN Data Engineering: Cryptographic Hash Verifier
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Guarantees SHA-256 dataset immutability and tamper detection.
"""

import hashlib
import json
from typing import Any, Tuple


class HashVerifier:
    @staticmethod
    def compute_sha256(data: Any) -> str:
        """Computes deterministic SHA-256 hex digest."""
        if isinstance(data, (dict, list)):
            payload_bytes = json.dumps(data, sort_keys=True, default=str).encode("utf-8")
        elif isinstance(data, str):
            payload_bytes = data.encode("utf-8")
        elif isinstance(data, bytes):
            payload_bytes = data
        else:
            payload_bytes = str(data).encode("utf-8")
        return hashlib.sha256(payload_bytes).hexdigest()

    @classmethod
    def verify(cls, data: Any, expected_sha256: str) -> Tuple[bool, str]:
        """
        Verifies if data matches expected SHA-256 digest.
        Returns (is_valid, computed_hash).
        """
        computed = cls.compute_sha256(data)
        return (computed.lower() == expected_sha256.lower(), computed)
