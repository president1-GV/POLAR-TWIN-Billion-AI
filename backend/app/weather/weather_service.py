from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from pydantic import ValidationError

from backend.adapters.ncpor_adapter import ncpor_adapter
from backend.app.schemas.schemas import WeatherObservationSchema
from backend.database.supabase_client import supabase_client


class WeatherService:
    """
    Authoritative Weather Service satisfying Section 17:
    NCPOR + Authorized Sources -> Weather Ingestion -> Pydantic Validation -> Time Series DB -> Weather API.
    
    STRICT RULE: Weather observations are strictly isolated from:
    - Synthetic physics data
    - ML predictions
    - Simulation scenarios
    - Subsystem telemetry
    """

    def fetch_and_record_observation(self, station_id: str) -> Dict[str, Any]:
        """
        Ingests real station weather from NCPOR / Open-Meteo Gateway, validates schema,
        and records into environment_observations table.
        """
        raw_obs = ncpor_adapter.fetch_observations(station_id)
        
        # Pydantic Validation Boundary
        try:
            validated = WeatherObservationSchema(**raw_obs)
        except ValidationError as e:
            print(f"[WeatherService] Validation error on atmospheric data: {e}")
            return raw_obs

        record = {
            "station_id": validated.station_id,
            "timestamp": validated.timestamp,
            "temperature_c": validated.temperature_c,
            "apparent_temp_c": validated.apparent_temp_c,
            "wind_speed_ms": validated.wind_speed_ms,
            "wind_gust_ms": validated.wind_gust_ms,
            "wind_direction_deg": validated.wind_direction_deg,
            "atmospheric_pressure_hpa": validated.atmospheric_pressure_hpa,
            "relative_humidity_pct": validated.relative_humidity_pct,
            "solar_radiation_wm2": validated.solar_radiation_wm2,
            "visibility_km": validated.visibility_km,
            "blizzard_condition": validated.blizzard_condition,
            "source_type": validated.source_type,
            "source_provider": validated.source_provider,
            "recorded_at": datetime.now(timezone.utc).isoformat()
        }

        # Store in Supabase / PostgreSQL time series table
        supabase_client.insert_row("environment_observations", record)

        return record

    def get_latest_observation(self, station_id: str) -> Dict[str, Any]:
        rows = supabase_client.get_table("environment_observations", {
            "station_id": f"eq.{station_id}",
            "order": "timestamp.desc",
            "limit": "1"
        })
        if rows:
            return rows[0]
        return self.fetch_and_record_observation(station_id)


weather_service = WeatherService()
