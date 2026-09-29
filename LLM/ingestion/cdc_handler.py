"""
POLAR-TWIN Data Engineering: Change Data Capture (CDC) Handler
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Handles continuous streaming ingestion, deduplication, and record versioning.
"""

from typing import List, Dict, Any, Set
from .hash_verifier import HashVerifier


class CdcHandler:
    def __init__(self):
        self.seen_hashes: Set[str] = set()

    def filter_new_records(self, records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Filters incoming streaming records, rejecting exact duplicates
        based on cryptographic record content hashing.
        """
        new_records = []
        for r in records:
            r_hash = HashVerifier.compute_sha256(r)
            if r_hash not in self.seen_hashes:
                self.seen_hashes.add(r_hash)
                r_copy = dict(r)
                r_copy["cdc_record_hash"] = r_hash
                new_records.append(r_copy)
        return new_records
