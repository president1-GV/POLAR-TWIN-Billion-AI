"""
POLAR-TWIN Data Engineering: External Benchmarks Registry
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Registry and provenance enforcement for external Antarctic datasets.
"""

from typing import Dict, Any, List
from LLM.schemas.provenance_schema import ProvenanceType


EXTERNAL_REGISTRY = {
    "AADC_DAVIS_ENERGY": {
        "dataset_id": "ds_aad_benchmark_davis",
        "name": "Australian Antarctic Data Centre - Davis Station Energy Benchmark",
        "provenance": ProvenanceType.EXTERNAL_ANTARCTIC_BENCHMARK,
        "country": "Australia",
        "organization": "Australian Antarctic Data Centre (AADC)",
        "license": "CC-BY-4.0",
        "station": "Davis Station, Antarctica"
    },
    "COPERNICUS_SEA_ICE": {
        "dataset_id": "ds_copernicus_sea_ice",
        "name": "Copernicus Marine Service Antarctic Sea Ice Concentration",
        "provenance": ProvenanceType.PUBLIC_EXTERNAL,
        "country": "European Union / International",
        "organization": "Copernicus Marine Environment Monitoring Service",
        "license": "Copernicus Open Access Licence",
        "station": "Southern Ocean"
    }
}


def assert_external_provenance_separation(record: Dict[str, Any]) -> bool:
    """
    Enforces strict provenance separation:
    External benchmark data MUST NOT contain Indian station IDs (station_bharati, station_maitri).
    Indian station observations MUST NOT claim Australian or European origin.
    """
    prov = record.get("provenance_type")
    st_id = record.get("station_id")
    country = record.get("source_country")

    if prov == ProvenanceType.EXTERNAL_ANTARCTIC_BENCHMARK.value:
        if st_id in ["station_bharati", "station_maitri"]:
            raise ValueError(f"CRITICAL PROVENANCE CONFLATION: External benchmark record cannot have station_id '{st_id}'")
        if country == "India":
            raise ValueError("CRITICAL PROVENANCE ERROR: External benchmark cannot declare country as 'India'")

    if prov == ProvenanceType.REAL_NCPOR.value:
        if country and country != "India":
            raise ValueError(f"CRITICAL PROVENANCE ERROR: REAL_NCPOR cannot declare non-Indian country '{country}'")

    return True
