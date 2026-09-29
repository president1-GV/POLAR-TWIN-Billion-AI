"""
POLAR-TWIN Data Engineering: Observation Schema
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Defines schemas for physical meteorological observations from NCPOR AWS stations
and external ocean/sea ice data.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .provenance_schema import ProvenanceType, QualityStatus


class EnvironmentObservationRecord(BaseModel):
    station_id: str = Field(..., description="Target station, e.g. station_bharati or station_maitri")
    timestamp: datetime = Field(..., description="UTC ISO-8601 observation timestamp")
    temperature_c: float = Field(..., ge=-90.0, le=35.0, description="Surface air temperature in Celsius")
    apparent_temp_c: Optional[float] = Field(None, ge=-110.0, le=35.0, description="Wind-chill adjusted apparent temp")
    wind_speed_ms: float = Field(..., ge=0.0, le=120.0, description="Wind speed in meters per second")
    wind_gust_ms: Optional[float] = Field(None, ge=0.0, le=140.0, description="Maximum wind gust in m/s")
    wind_direction_deg: Optional[int] = Field(None, ge=0, le=360, description="Wind direction degrees from true North")
    atmospheric_pressure_hpa: float = Field(..., ge=800.0, le=1080.0, description="Station atmospheric pressure in hPa")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity percentage")
    solar_radiation_wm2: float = Field(default=0.0, ge=0.0, le=1500.0, description="Global horizontal irradiance W/m²")
    visibility_km: float = Field(default=10.0, ge=0.0, le=100.0, description="Horizontal visibility in kilometers")
    blizzard_condition: bool = Field(default=False, description="Flagged if wind >= 15 m/s, temp <= -5°C, vis <= 1.0 km")
    provenance_type: ProvenanceType = Field(default=ProvenanceType.REAL_NCPOR)
    source_provider: str = Field(default="NCPOR / IMD Automatic Weather Station")
    quality: QualityStatus = Field(default=QualityStatus.VALID)
    raw_payload_hash: Optional[str] = None
