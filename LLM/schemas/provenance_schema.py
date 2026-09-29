"""
POLAR-TWIN Data Engineering: Provenance & Dataset Schemas
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Defines strict provenance tiers and dataset metadata schema.
"""

from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime


class ProvenanceType(str, Enum):
    REAL_NCPOR = "REAL_NCPOR"
    EXTERNAL_ANTARCTIC_BENCHMARK = "EXTERNAL_ANTARCTIC_BENCHMARK"
    PUBLIC_EXTERNAL = "PUBLIC_EXTERNAL"
    SIMULATED = "SIMULATED"
    DERIVED = "DERIVED"
    FUTURE_IOT = "FUTURE_IOT"


class QualityStatus(str, Enum):
    VALID = "VALID"
    SUSPECT = "SUSPECT"
    OUTLIER = "OUTLIER"
    INVALID = "INVALID"


class DatasetMetadata(BaseModel):
    id: str = Field(..., description="Unique dataset identifier, e.g., ds_ncpor_aws_bharati")
    name: str = Field(..., description="Human-readable dataset name")
    description: str = Field(..., description="Detailed description of dataset content and purpose")
    provenance_type: ProvenanceType = Field(..., description="Strict provenance classification tier")
    station_id: Optional[str] = Field(None, description="Station ID if specific to Maitri or Bharati")
    version: str = Field(default="v1.0.0", description="SemVer version tag")
    license: str = Field(default="Open Government Data (OGD) / CC-BY-4.0", description="Data license")
    source_url: Optional[str] = Field(None, description="Official origin URL or URI")
    source_organization: str = Field(..., description="Publishing organization, e.g. NCPOR, AADC, Copernicus")
    source_country: Optional[str] = Field(default="India", description="Country of origin")
    hash_sha256: str = Field(..., description="Cryptographic SHA-256 digest of raw payload")
    record_count: int = Field(default=0, ge=0)
    time_range_start: Optional[datetime] = None
    time_range_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DataProvenanceRecord(BaseModel):
    id: Optional[str] = None
    entity_type: str = Field(..., description="Entity kind, e.g., observation, telemetry, model_prediction")
    entity_id: str = Field(..., description="Specific identifier of the record or asset")
    provenance_type: ProvenanceType
    source_dataset_id: Optional[str] = None
    processing_step: str = Field(..., description="Pipeline transformation or ingestion step")
    transformation_hash: Optional[str] = Field(None, description="SHA-256 hash of transformation code / output")
    parent_entity_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DataQualityReport(BaseModel):
    id: Optional[str] = None
    dataset_id: str
    check_type: str
    passed: bool
    total_records: int
    invalid_records: int = 0
    null_counts: Dict[str, int] = Field(default_factory=dict)
    outlier_counts: Dict[str, int] = Field(default_factory=dict)
    violations: List[str] = Field(default_factory=list)
    execution_timestamp: datetime = Field(default_factory=datetime.utcnow)
