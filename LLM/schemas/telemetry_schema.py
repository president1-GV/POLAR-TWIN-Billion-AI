"""
POLAR-TWIN Data Engineering: Telemetry & Energy Schemas
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Defines schemas for asset telemetry and station microgrid energy readings.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from .provenance_schema import ProvenanceType, QualityStatus


class TelemetryReadingRecord(BaseModel):
    station_id: str = Field(..., description="Target station, e.g. station_bharati")
    asset_id: str = Field(..., description="Target asset ID, e.g. genset_bharati_1")
    timestamp: datetime = Field(..., description="UTC ISO-8601 reading timestamp")
    metric: str = Field(..., description="Metric key: vibration_rms_mms, exhaust_temp_c, fuel_rate_lph, etc.")
    value: float = Field(..., description="Physical sensor value")
    unit: str = Field(..., description="Engineering unit: mm/s, °C, L/h, kW, %, Hz")
    quality: QualityStatus = Field(default=QualityStatus.VALID)
    provenance_type: ProvenanceType = Field(default=ProvenanceType.SIMULATED)
    simulation_id: Optional[str] = Field(None, description="Simulation run identifier if simulated")
    sequence_number: Optional[int] = None


class EnergyReadingRecord(BaseModel):
    station_id: str = Field(..., description="Target station, e.g. station_bharati")
    timestamp: datetime = Field(..., description="UTC ISO-8601 reading timestamp")
    total_generation_kw: float = Field(..., ge=0.0, description="Total active generation in kW")
    total_consumption_kw: float = Field(..., ge=0.0, description="Total active consumption in kW")
    generator_output_kw: float = Field(..., ge=0.0, description="Active diesel generator output in kW")
    solar_output_kw: float = Field(default=0.0, ge=0.0, description="Active solar PV generation in kW")
    wind_output_kw: float = Field(default=0.0, ge=0.0, description="Active wind turbine generation in kW")
    battery_charge_pct: float = Field(..., ge=0.0, le=100.0, description="Station BESS State of Charge percentage")
    battery_power_kw: float = Field(default=0.0, description="BESS active power in kW (+ discharge, - charge)")
    hvac_load_kw: float = Field(..., ge=0.0, description="Habitation heating and life support load")
    critical_load_kw: float = Field(..., ge=0.0, description="Uninterruptible critical server and communication load")
    scientific_load_kw: float = Field(default=0.0, ge=0.0, description="Laboratory and scientific experiment load")
    reserve_margin_pct: float = Field(..., ge=0.0, le=100.0, description="Spinning reserve margin percentage")
    grid_frequency_hz: float = Field(default=50.0, ge=45.0, le=55.0, description="Station microgrid frequency in Hz")
    provenance_type: ProvenanceType = Field(default=ProvenanceType.SIMULATED)
