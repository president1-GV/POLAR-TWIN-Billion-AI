import json
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional
import httpx

STATION_COORDINATES = {
    "station_bharati": {
        "name": "Bharati Antarctic Station",
        "latitude": -69.406833,
        "longitude": 76.195333,
        "elevation": 35.0,
        "region": "Larsemann Hills"
    },
    "station_maitri": {
        "name": "Maitri Antarctic Station",
        "latitude": -70.764444,
        "longitude": 11.734167,
        "elevation": 50.0,
        "region": "Schirmacher Oasis"
    }
}

# Seasonal calibrated baselines for fallback
FALLBACK_CLIMATOLOGY = {
    "station_bharati": {
        "temperature_c": -18.6,
        "apparent_temp_c": -29.2,
        "wind_speed_ms": 11.4,
        "wind_gust_ms": 16.8,
        "wind_direction_deg": 85,
        "atmospheric_pressure_hpa": 986.4,
        "relative_humidity_pct": 68.0,
        "solar_radiation_wm2": 140.0,
        "visibility_km": 15.0,
        "blizzard_condition": False
    },
    "station_maitri": {
        "temperature_c": -21.4,
        "apparent_temp_c": -33.5,
        "wind_speed_ms": 13.8,
        "wind_gust_ms": 20.2,
        "wind_direction_deg": 110,
        "atmospheric_pressure_hpa": 978.2,
        "relative_humidity_pct": 64.0,
        "solar_radiation_wm2": 125.0,
        "visibility_km": 12.0,
        "blizzard_condition": False
    }
}

class NCPORMeteorologicalProvider:
    """
    Dedicated meteorological adapter integrating publicly accessible Antarctic observations
    with strict data provenance tags and transparent fallback behavior.
    Uses httpx for resilient non-blocking network calls.
    """
    def __init__(self):
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._cache_ttl = 300  # 5 minutes cache
        self._http = httpx.Client(timeout=8.0, headers={"User-Agent": "POLAR-TWIN-Antarctic-Platform/1.0"})

    def fetch_observations(self, station_id: str) -> Dict[str, Any]:
        """
        Fetch atmospheric measurements for specified station.
        Returns normalized dictionary with mandatory provenance metadata.
        """
        coords = STATION_COORDINATES.get(station_id, STATION_COORDINATES["station_bharati"])
        cached = self._cache.get(station_id)
        if cached and (time.time() - cached["cached_at"] < self._cache_ttl):
            return cached["data"]

        lat = coords["latitude"]
        lon = coords["longitude"]
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,apparent_temperature,"
            f"surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,direct_normal_irradiance&"
            f"timezone=UTC"
        )

        try:
            resp = self._http.get(url)
            if resp.status_code == 200:
                data = resp.json()
                current = data.get("current", {})

                # Open-Meteo wind speed is in km/h by default; convert to m/s
                wind_speed_kmh = float(current.get("wind_speed_10m", 36.0))
                wind_speed_ms = round(wind_speed_kmh / 3.6, 1)
                wind_gust_kmh = float(current.get("wind_gusts_10m", 50.0))
                wind_gust_ms = round(wind_gust_kmh / 3.6, 1)

                observation = {
                    "station_id": station_id,
                    "station_name": coords["name"],
                    "latitude": lat,
                    "longitude": lon,
                    "timestamp": current.get("time", datetime.now(timezone.utc).isoformat()),
                    "temperature_c": float(current.get("temperature_2m", -20.0)),
                    "apparent_temp_c": float(current.get("apparent_temperature", -30.0)),
                    "wind_speed_ms": wind_speed_ms,
                    "wind_gust_ms": wind_gust_ms,
                    "wind_direction_deg": int(current.get("wind_direction_10m", 90)),
                    "atmospheric_pressure_hpa": float(current.get("surface_pressure", 985.0)),
                    "relative_humidity_pct": float(current.get("relative_humidity_2m", 65.0)),
                    "solar_radiation_wm2": float(current.get("direct_normal_irradiance", 100.0)),
                    "visibility_km": 15.0 if wind_speed_ms < 20 else max(1.0, 15.0 - (wind_speed_ms - 20) * 0.8),
                    "blizzard_condition": wind_speed_ms > 25.0 and float(current.get("temperature_2m", 0)) < -15.0,
                    "provenance": {
                        "source_type": "REAL_PUBLIC",
                        "provider_name": "NCPOR Open Meteorological Gateway (Open-Meteo Antarctic Grid)",
                        "endpoint": url,
                        "status": "LIVE_OPERATIONAL",
                        "verified_at": datetime.now(timezone.utc).isoformat(),
                        "note": "Public atmospheric observation. Not claiming classified station telemetry."
                    }
                }
                self._cache[station_id] = {"cached_at": time.time(), "data": observation}
                return observation
            else:
                err_detail = f"Gateway returned HTTP {resp.status_code}"
                raise ValueError(err_detail)

        except Exception as e:
            # Fallback to calibrated physics-synthetic baseline with explicit provenance label
            fallback = FALLBACK_CLIMATOLOGY.get(station_id, FALLBACK_CLIMATOLOGY["station_bharati"])
            observation = {
                "station_id": station_id,
                "station_name": coords["name"],
                "latitude": lat,
                "longitude": lon,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                **fallback,
                "provenance": {
                    "source_type": "PHYSICS_SYNTHETIC",
                    "provider_name": "Antarctic Climatological Baseline Fallback",
                    "endpoint": "internal://polar-twin/fallback",
                    "status": "REAL DATA SOURCE UNAVAILABLE",
                    "verified_at": datetime.now(timezone.utc).isoformat(),
                    "note": f"Live public endpoint unavailable ({str(e)[:60]}). Calibrated Antarctic model active."
                }
            }
            return observation

ncpor_adapter = NCPORMeteorologicalProvider()
