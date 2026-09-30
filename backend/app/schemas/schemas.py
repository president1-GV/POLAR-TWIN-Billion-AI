from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, model_validator
import re

# Allowed Station IDs
VALID_STATION_IDS = {"station_bharati", "station_maitri"}

# Provenance Tiers
PROVENANCE_TIERS = Literal[
    "REAL_PUBLIC",
    "PHYSICS_SYNTHETIC",
    "EDGE_SIMULATED",
    "FUTURE_IOT",
    "MOCK"
]

# Asset Status
ASSET_STATUS = Literal["NORMAL", "WATCH", "WARNING", "CRITICAL", "FAILED", "OFFLINE"]
CRITICALITY_LEVELS = Literal["CRITICAL", "HIGH", "MEDIUM", "LOW"]
QUALITY_LEVELS = Literal["GOOD", "SUSPECT", "BAD", "INTERPOLATED"]


class CoordinateSchema(BaseModel):
    latitude: float = Field(..., ge=-90.0, le=-60.0, description="Antarctic latitude (-90° to -60°)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    elevation: float = Field(..., ge=-50.0, le=5000.0, description="Elevation in meters ASL")
    crs: str = Field(default="EPSG:4326")
    easting_epsg3031: Optional[float] = None
    northing_epsg3031: Optional[float] = None
    three_coords: Optional[Dict[str, float]] = None


class StationBase(BaseModel):
    id: str = Field(..., description="Unique station identifier")
    station_code: str = Field(..., min_length=2, max_length=16)
    name: str = Field(..., min_length=3, max_length=128)
    region: str = Field(..., min_length=3, max_length=128)
    latitude: float = Field(..., ge=-90.0, le=-60.0)
    longitude: float = Field(..., ge=-180.0, le=180.0)
    elevation_meters: float = Field(..., ge=-50.0, le=5000.0)
    commissioned_year: int = Field(..., ge=1950, le=2030)
    operational_status: str = Field(default="ACTIVE")
    connectivity_status: Literal["ONLINE", "DEGRADED", "OFFLINE", "SYNCING"] = "ONLINE"
    primary_power_source: str = "Diesel-Electric Gensets + Solar/Wind"
    population_capacity: int = Field(default=25, ge=1, le=200)
    current_occupancy: int = Field(default=18, ge=0, le=200)

    @field_validator("id")
    @classmethod
    def validate_station_id(cls, v: str) -> str:
        if v not in VALID_STATION_IDS:
            raise ValueError(f"Station ID must be one of {VALID_STATION_IDS}")
        return v


class StationCreate(StationBase):
    pass


class StationResponse(StationBase):
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssetBase(BaseModel):
    id: str = Field(..., min_length=3, max_length=64)
    station_id: str = Field(...)
    asset_type_id: str = Field(...)
    name: str = Field(..., min_length=2, max_length=128)
    code: str = Field(..., min_length=2, max_length=64)
    status: ASSET_STATUS = "NORMAL"
    health_score: float = Field(default=100.0, ge=0.0, le=100.0)
    criticality: CRITICALITY_LEVELS = "HIGH"
    location_desc: Optional[str] = None
    coordinates_3d: Optional[Dict[str, float]] = None
    current_state: Optional[Dict[str, Any]] = None
    source_type: PROVENANCE_TIERS = "PHYSICS_SYNTHETIC"

    @field_validator("station_id")
    @classmethod
    def validate_station(cls, v: str) -> str:
        if v not in VALID_STATION_IDS:
            raise ValueError(f"Invalid station ID: {v}")
        return v


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    status: Optional[ASSET_STATUS] = None
    health_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    criticality: Optional[CRITICALITY_LEVELS] = None
    location_desc: Optional[str] = None
    current_state: Optional[Dict[str, Any]] = None


class TelemetryIngestSchema(BaseModel):
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp")
    station_id: str = Field(...)
    asset_id: str = Field(...)
    metric: str = Field(..., min_length=2, max_length=64)
    value: float = Field(...)
    unit: str = Field(..., min_length=1, max_length=32)
    quality: QUALITY_LEVELS = "GOOD"
    source_type: PROVENANCE_TIERS = "PHYSICS_SYNTHETIC"
    simulation_id: Optional[str] = None
    sequence_number: Optional[int] = None
    crc32: Optional[int] = None

    @field_validator("station_id")
    @classmethod
    def validate_station(cls, v: str) -> str:
        if v not in VALID_STATION_IDS:
            raise ValueError(f"Invalid station ID: {v}")
        return v

    @field_validator("timestamp")
    @classmethod
    def validate_iso_timestamp(cls, v: str) -> str:
        try:
            # Verify ISO format
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except Exception:
            raise ValueError("timestamp must be valid ISO 8601 format")
        return v


class WeatherObservationSchema(BaseModel):
    station_id: str = Field(...)
    timestamp: str = Field(...)
    temperature_c: float = Field(..., ge=-95.0, le=25.0, description="Antarctic surface air temperature")
    apparent_temp_c: Optional[float] = Field(None, ge=-110.0, le=25.0)
    wind_speed_ms: float = Field(..., ge=0.0, le=110.0, description="Wind speed in meters/second")
    wind_gust_ms: Optional[float] = Field(None, ge=0.0, le=125.0)
    wind_direction_deg: Optional[int] = Field(None, ge=0, le=360)
    atmospheric_pressure_hpa: float = Field(..., ge=750.0, le=1150.0)
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0)
    solar_radiation_wm2: float = Field(default=0.0, ge=0.0, le=1500.0)
    visibility_km: float = Field(default=10.0, ge=0.0, le=150.0)
    blizzard_condition: bool = False
    source_type: PROVENANCE_TIERS = "REAL_PUBLIC"
    source_provider: str = "NCPOR / OpenMeteo Gateway"


class EnergyDispatchInputSchema(BaseModel):
    station_id: str = Field(default="station_bharati")
    current_load_kw: float = Field(..., ge=10.0, le=1000.0, description="Total active station load demand in kW")
    solar_pv_generation_kw: float = Field(default=0.0, ge=0.0, le=100.0)
    wind_generation_kw: float = Field(default=0.0, ge=0.0, le=100.0)
    battery_current_soc_pct: float = Field(..., ge=5.0, le=100.0, description="Battery state-of-charge percentage")
    battery_capacity_kwh: float = Field(default=200.0, ge=10.0, le=2000.0)
    battery_max_charge_kw: float = Field(default=80.0, ge=0.0)
    battery_max_discharge_kw: float = Field(default=80.0, ge=0.0)
    min_reserve_margin_pct: float = Field(default=20.0, ge=10.0, le=100.0)
    available_generators: List[Dict[str, Any]] = Field(
        default_factory=lambda: [
            {"id": "bh_gen_01", "name": "Primary Genset 01", "rated_kw": 200.0, "min_kw": 40.0, "status": "ONLINE", "fuel_curve_lph": 0.22},
            {"id": "bh_gen_02", "name": "Auxiliary Genset 02", "rated_kw": 200.0, "min_kw": 40.0, "status": "STANDBY", "fuel_curve_lph": 0.22},
            {"id": "bh_gen_03", "name": "Emergency Genset 03", "rated_kw": 200.0, "min_kw": 40.0, "status": "OFFLINE", "fuel_curve_lph": 0.24},
        ]
    )


class GeneratorDispatchResult(BaseModel):
    generator_id: str
    status: Literal["RUNNING", "STANDBY", "OFFLINE"]
    dispatch_power_kw: float
    capacity_kw: float
    loading_ratio_pct: float
    fuel_consumption_lph: float


class EnergyDispatchResultSchema(BaseModel):
    solver_status: str
    station_id: str
    timestamp: str
    total_demand_kw: float
    renewable_contribution_kw: float
    generators_total_kw: float
    battery_power_kw: float  # Positive = discharge, negative = charge
    battery_next_soc_pct: float
    total_fuel_burn_lph: float
    spinning_reserve_kw: float
    spinning_reserve_margin_pct: float
    reserve_constraint_satisfied: bool
    generator_dispatches: List[GeneratorDispatchResult]
    optimization_objective: str = "MINIMIZE_FUEL_AND_MAINTENANCE"
    provenance: str = "MILP_OPTIMIZATION_ENGINE"


class SimulationRunRequestSchema(BaseModel):
    scenario_key: str = Field(..., min_length=3, max_length=64)
    station_id: str = Field(...)
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "HIGH"
    parameter_modifications: Dict[str, Any] = Field(default_factory=dict)
    operator_id: Optional[str] = None


class LogisticsRecordSchema(BaseModel):
    id: str = Field(...)
    station_id: str = Field(...)
    category: Literal["FUEL", "FOOD", "MEDICAL", "SPARE_PARTS", "SCIENTIFIC_SUPPLIES", "WATER"]
    name: str = Field(..., min_length=2, max_length=128)
    sku: str = Field(..., min_length=2, max_length=32)
    current_stock: float = Field(..., ge=0.0)
    unit: str = Field(..., min_length=1, max_length=32)
    daily_burn_rate: float = Field(..., ge=0.0)
    minimum_reserve: float = Field(..., ge=0.0)
    days_remaining: float = Field(...)
    shortage_risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = "LOW"
    storage_location: Optional[str] = None


class AuditLogCreateSchema(BaseModel):
    request_id: Optional[str] = None
    user_id: str = Field(default="system")
    role: str = Field(default="OPERATOR")
    station_id: Optional[str] = None
    action: str = Field(..., min_length=2, max_length=64)
    resource: str = Field(..., min_length=2, max_length=128)
    before_state: Optional[Dict[str, Any]] = None
    after_state: Optional[Dict[str, Any]] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    client_ip: Optional[str] = None
    source: str = Field(default="API_GATEWAY")
