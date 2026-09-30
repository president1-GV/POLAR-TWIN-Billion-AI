import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    ForeignKey, Text, JSON, BigInteger, Index, CheckConstraint
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def gen_uuid() -> str:
    return str(uuid.uuid4())

def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(32), primary_key=True)  # ADMIN, STATION_OPERATOR, ENGINEER, SCIENTIST, VIEWER, AUDITOR
    name = Column(String(64), nullable=False)
    permissions = Column(JSON, default=list)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    email = Column(String(128), unique=True, nullable=False, index=True)
    username = Column(String(64), unique=True, nullable=False, index=True)
    full_name = Column(String(128), nullable=False)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="SET NULL"), nullable=True)
    role_id = Column(String(32), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False, default="VIEWER")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    role = relationship("Role", back_populates="users")
    station = relationship("Station", back_populates="assigned_users")


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    provenance_type = Column(String(32), nullable=False, default="REAL_PUBLIC")
    status = Column(String(32), nullable=False, default="CONNECTED")
    endpoint_url = Column(Text, nullable=True)
    last_update = Column(DateTime(timezone=True), default=utc_now)
    reliability_score = Column(Float, default=0.95)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    stations = relationship("Station", back_populates="data_source")


class Station(Base):
    __tablename__ = "stations"

    id = Column(String(32), primary_key=True)  # station_bharati, station_maitri
    station_code = Column(String(16), unique=True, nullable=False)  # BHR, MAI
    name = Column(String(128), nullable=False)
    region = Column(String(128), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_meters = Column(Float, nullable=False)
    commissioned_year = Column(Integer, nullable=False)
    operational_status = Column(String(32), default="ACTIVE")
    connectivity_status = Column(String(32), default="ONLINE")
    primary_power_source = Column(String(64), default="Diesel-Electric Gensets + Solar/Wind")
    population_capacity = Column(Integer, default=25)
    current_occupancy = Column(Integer, default=18)
    data_source_id = Column(String(64), ForeignKey("data_sources.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    data_source = relationship("DataSource", back_populates="stations")
    assets = relationship("Asset", back_populates="station", cascade="all, delete-orphan")
    coordinates = relationship("Coordinate", back_populates="station", cascade="all, delete-orphan")
    telemetry_readings = relationship("Telemetry", back_populates="station", cascade="all, delete-orphan")
    weather_observations = relationship("WeatherObservation", back_populates="station", cascade="all, delete-orphan")
    energy_measurements = relationship("EnergyMeasurement", back_populates="station", cascade="all, delete-orphan")
    logistics_records = relationship("LogisticsRecord", back_populates="station", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="station", cascade="all, delete-orphan")
    simulation_scenarios = relationship("SimulationScenario", back_populates="station", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="station", cascade="all, delete-orphan")
    assigned_users = relationship("User", back_populates="station")


class Coordinate(Base):
    __tablename__ = "coordinates"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation = Column(Float, nullable=False)
    crs = Column(String(32), default="EPSG:4326")
    easting_epsg3031 = Column(Float, nullable=True)
    northing_epsg3031 = Column(Float, nullable=True)
    enu_x = Column(Float, nullable=True)
    enu_y = Column(Float, nullable=True)
    enu_z = Column(Float, nullable=True)
    three_x = Column(Float, nullable=True)
    three_y = Column(Float, nullable=True)
    three_z = Column(Float, nullable=True)
    orientation = Column(JSON, default=dict)
    scale = Column(Float, default=1.0)
    source = Column(String(128), default="NCPOR As-Built Geodetic Survey")
    accuracy_meters = Column(Float, default=0.05)
    confidence = Column(String(32), default="VERIFIED")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="coordinates")
    asset = relationship("Asset", back_populates="coordinate")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(64), primary_key=True)  # BHR-GEN-001 / bh_gen_01
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    asset_type_id = Column(String(32), nullable=False)
    name = Column(String(128), nullable=False)
    code = Column(String(64), nullable=False, index=True)
    status = Column(String(16), default="NORMAL", nullable=False)
    health_score = Column(Float, default=100.0, nullable=False)
    criticality = Column(String(16), default="HIGH", nullable=False)
    location_desc = Column(Text, nullable=True)
    coordinates_3d = Column(JSON, default=dict)
    current_state = Column(JSON, default=dict)
    last_seen = Column(DateTime(timezone=True), default=utc_now)
    source_type = Column(String(32), default="PHYSICS_SYNTHETIC")
    model_version = Column(String(32), default="v2.1-calibrated")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    station = relationship("Station", back_populates="assets")
    parent = relationship("Asset", remote_side=[id], backref="children")
    coordinate = relationship("Coordinate", back_populates="asset", uselist=False)
    outgoing_relationships = relationship("AssetRelationship", foreign_keys="AssetRelationship.source_asset_id", back_populates="source_asset")
    incoming_relationships = relationship("AssetRelationship", foreign_keys="AssetRelationship.target_asset_id", back_populates="target_asset")
    telemetry_readings = relationship("Telemetry", back_populates="asset", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="asset")
    logistics_records = relationship("LogisticsRecord", back_populates="asset")


class AssetRelationship(Base):
    __tablename__ = "asset_relationships"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False)
    source_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    target_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False)
    relationship_type = Column(String(32), nullable=False)  # POWERS, SUPPLIES, SUPPORTS, BACKS_UP, CONTROLS
    impact_weight = Column(Float, default=1.0, nullable=False)
    propagation_delay_seconds = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    source_asset = relationship("Asset", foreign_keys=[source_asset_id], back_populates="outgoing_relationships")
    target_asset = relationship("Asset", foreign_keys=[target_asset_id], back_populates="incoming_relationships")


class Telemetry(Base):
    __tablename__ = "telemetry_readings"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    metric = Column(String(64), nullable=False, index=True)
    value = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    quality = Column(String(16), default="GOOD")
    source_type = Column(String(32), default="PHYSICS_SYNTHETIC")
    simulation_id = Column(String(64), nullable=True)
    sequence_number = Column(BigInteger, nullable=True)
    crc32 = Column(BigInteger, nullable=True)
    is_demo = Column(Boolean, default=False)
    received_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="telemetry_readings")
    asset = relationship("Asset", back_populates="telemetry_readings")

    __table_args__ = (
        Index("idx_telemetry_station_asset_ts", "station_id", "asset_id", "timestamp"),
        Index("idx_telemetry_metric_ts", "metric", "timestamp"),
    )


class WeatherObservation(Base):
    __tablename__ = "environment_observations"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    temperature_c = Column(Float, nullable=False)
    apparent_temp_c = Column(Float, nullable=True)
    wind_speed_ms = Column(Float, nullable=False)
    wind_gust_ms = Column(Float, nullable=True)
    wind_direction_deg = Column(Integer, nullable=True)
    atmospheric_pressure_hpa = Column(Float, nullable=False)
    relative_humidity_pct = Column(Float, nullable=False)
    solar_radiation_wm2 = Column(Float, default=0.0)
    visibility_km = Column(Float, default=10.0)
    blizzard_condition = Column(Boolean, default=False)
    source_type = Column(String(32), default="REAL_PUBLIC")
    source_provider = Column(String(64), default="NCPOR / OpenMeteo Antarctic Gateway")
    is_demo = Column(Boolean, default=False)
    recorded_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="weather_observations")

    __table_args__ = (
        Index("idx_env_obs_station_ts", "station_id", "timestamp"),
    )


class EnergyMeasurement(Base):
    __tablename__ = "energy_readings"

    id = Column(BigInteger().with_variant(Integer, "sqlite"), primary_key=True, autoincrement=True)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    total_generation_kw = Column(Float, nullable=False)
    total_consumption_kw = Column(Float, nullable=False)
    generator_output_kw = Column(Float, nullable=False)
    solar_output_kw = Column(Float, default=0.0)
    wind_output_kw = Column(Float, default=0.0)
    battery_charge_pct = Column(Float, nullable=False)
    battery_power_kw = Column(Float, default=0.0)
    hvac_load_kw = Column(Float, nullable=False)
    critical_load_kw = Column(Float, nullable=False)
    scientific_load_kw = Column(Float, nullable=False)
    reserve_margin_pct = Column(Float, nullable=False)
    grid_frequency_hz = Column(Float, default=50.0)
    source_type = Column(String(32), default="PHYSICS_SYNTHETIC")
    is_demo = Column(Boolean, default=False)
    recorded_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="energy_measurements")

    __table_args__ = (
        Index("idx_energy_obs_station_ts", "station_id", "timestamp"),
    )


class LogisticsRecord(Base):
    __tablename__ = "logistics_items"

    id = Column(String(64), primary_key=True)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(32), nullable=False)  # FUEL, FOOD, MEDICAL, SPARE_PARTS, SCIENTIFIC_SUPPLIES, WATER
    name = Column(String(128), nullable=False)
    sku = Column(String(32), nullable=False)
    current_stock = Column(Float, nullable=False)
    unit = Column(String(32), nullable=False)
    daily_burn_rate = Column(Float, nullable=False)
    minimum_reserve = Column(Float, nullable=False)
    days_remaining = Column(Float, nullable=False)
    shortage_risk_level = Column(String(16), default="LOW")
    storage_location = Column(String(128), nullable=True)
    last_restocked_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    station = relationship("Station", back_populates="logistics_records")
    asset = relationship("Asset", back_populates="logistics_records")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(64), nullable=False)
    model_version = Column(String(32), nullable=False)
    training_dataset = Column(String(128), default="NCPOR_HISTORICAL_2020_2025")
    prediction_type = Column(String(64), nullable=False)  # ENERGY_DEMAND, ANOMALY_DETECTION, RUL_DEGRADATION
    forecast_horizon_hours = Column(Integer, default=24)
    features_used = Column(JSON, default=list)
    predicted_value = Column(Float, nullable=True)
    prediction_data = Column(JSON, default=dict)
    confidence_score = Column(Float, default=0.92)
    anomaly_score = Column(Float, nullable=True)
    threshold = Column(Float, nullable=True)
    provenance = Column(String(64), default="ML_INFERRED_NON_OBSERVATIONAL")
    generated_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="predictions")


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    scenario_key = Column(String(64), unique=True, nullable=False, index=True)
    title = Column(String(128), nullable=False)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(64), default="CONTINGENCY")
    severity = Column(String(16), default="HIGH")
    trigger_asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    initial_conditions = Column(JSON, default=dict)
    parameters = Column(JSON, default=dict)
    mitigation_protocols = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="simulation_scenarios")
    results = relationship("SimulationResult", back_populates="scenario", cascade="all, delete-orphan")


class SimulationResult(Base):
    __tablename__ = "simulation_results"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    scenario_id = Column(String(64), ForeignKey("simulation_scenarios.id", ondelete="CASCADE"), nullable=False)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False)
    run_timestamp = Column(DateTime(timezone=True), default=utc_now)
    initial_state_hash = Column(String(64), nullable=False)
    parameter_modifications = Column(JSON, default=dict)
    trajectory_results = Column(JSON, default=dict)
    impact_analysis = Column(JSON, default=dict)
    operator_action = Column(String(32), default="PENDING_REVIEW")
    operator_id = Column(String(64), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    isolated_from_telemetry = Column(Boolean, default=True)

    scenario = relationship("SimulationScenario", back_populates="results")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    station_id = Column(String(32), ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(String(64), ForeignKey("assets.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(16), nullable=False)  # INFO, WATCH, WARNING, CRITICAL
    status = Column(String(16), default="ACTIVE", nullable=False)  # ACTIVE, ACKNOWLEDGED, RESOLVED, SUPPRESSED
    source_type = Column(String(32), default="PHYSICS_SYNTHETIC")
    evidence = Column(JSON, default=list)
    predicted_consequence = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    acknowledged_by = Column(String(64), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    station = relationship("Station", back_populates="alerts")
    asset = relationship("Asset", back_populates="alerts")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=gen_uuid)
    request_id = Column(String(64), nullable=True, index=True)
    user_id = Column(String(64), default="system", nullable=False)
    role = Column(String(32), default="OPERATOR", nullable=False)
    station_id = Column(String(32), nullable=True)
    action = Column(String(64), nullable=False, index=True)
    resource = Column(String(128), nullable=False)
    before_state = Column(JSON, nullable=True)
    after_state = Column(JSON, nullable=True)
    details = Column(JSON, default=dict)
    client_ip = Column(String(45), nullable=True)
    source = Column(String(64), default="API_GATEWAY")
    hash_signature = Column(String(64), nullable=True)
    timestamp = Column(DateTime(timezone=True), default=utc_now, index=True)
