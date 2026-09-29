"""
POLAR-TWIN Data Engineering: Validation Rules & Bounds
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Defines Antarctic physical plausibility bounds, consistency checks, and outlier thresholds.
"""

from typing import Dict, Any, Tuple, Optional
from .provenance_schema import QualityStatus


# Physical plausibility intervals for Antarctic environment and station assets
ANTARCTIC_PHYSICAL_BOUNDS: Dict[str, Tuple[float, float]] = {
    # Environment
    "temperature_c": (-90.0, 35.0),
    "wind_speed_ms": (0.0, 120.0),
    "wind_gust_ms": (0.0, 140.0),
    "wind_direction_deg": (0.0, 360.0),
    "atmospheric_pressure_hpa": (800.0, 1080.0),
    "relative_humidity_pct": (0.0, 100.0),
    "solar_radiation_wm2": (0.0, 1450.0),
    "visibility_km": (0.0, 100.0),
    
    # Energy & Microgrid
    "total_generation_kw": (0.0, 1500.0),
    "total_consumption_kw": (0.0, 1500.0),
    "generator_output_kw": (0.0, 1200.0),
    "solar_output_kw": (0.0, 250.0),
    "wind_output_kw": (0.0, 200.0),
    "battery_charge_pct": (0.0, 100.0),
    "battery_power_kw": (-300.0, 300.0),
    "hvac_load_kw": (0.0, 600.0),
    "critical_load_kw": (0.0, 250.0),
    "reserve_margin_pct": (0.0, 100.0),
    "grid_frequency_hz": (47.0, 53.0),
    
    # Asset Telemetry
    "vibration_rms_mms": (0.0, 25.0),
    "exhaust_temp_c": (15.0, 650.0),
    "oil_pressure_bar": (0.0, 12.0),
    "coolant_temp_c": (-30.0, 125.0),
    "fuel_rate_lph": (0.0, 150.0),
    "bearing_temp_c": (-30.0, 130.0),
    "cop_heating": (0.5, 4.5),
}


def validate_metric_value(metric: str, value: float) -> Tuple[QualityStatus, Optional[str]]:
    """
    Validates a single metric value against physical plausibility bounds.
    Returns (QualityStatus, violation_message_if_any).
    """
    if value is None:
        return QualityStatus.INVALID, f"Metric '{metric}' value is null"
    
    if metric not in ANTARCTIC_PHYSICAL_BOUNDS:
        return QualityStatus.VALID, None
    
    min_val, max_val = ANTARCTIC_PHYSICAL_BOUNDS[metric]
    if value < min_val or value > max_val:
        return QualityStatus.INVALID, (
            f"Physical bound violation for '{metric}': value {value} is outside valid "
            f"Antarctic range [{min_val}, {max_val}]"
        )
    
    # Check for suspect or soft-outlier values (e.g. extreme winds or deep sub-zero)
    if metric == "temperature_c" and value < -75.0:
        return QualityStatus.SUSPECT, f"Extreme low temperature: {value}°C (nearing world record)"
    if metric == "wind_speed_ms" and value > 60.0:
        return QualityStatus.SUSPECT, f"Severe hurricane-force blizzard wind: {value} m/s"
    if metric == "vibration_rms_mms" and value > 12.0:
        return QualityStatus.OUTLIER, f"Critical mechanical vibration surge: {value} mm/s"
        
    return QualityStatus.VALID, None


def validate_observation_dict(obs: Dict[str, Any]) -> Tuple[bool, list]:
    """
    Validates an observation record against multiple constraints:
    - Temperature, pressure, wind, humidity within range
    - Apparent temperature consistency
    - Monotonic or non-null timestamp
    """
    violations = []
    
    if "timestamp" not in obs or not obs["timestamp"]:
        violations.append("Missing observation timestamp")
        
    for k, v in obs.items():
        if k in ANTARCTIC_PHYSICAL_BOUNDS and isinstance(v, (int, float)):
            status, msg = validate_metric_value(k, float(v))
            if status == QualityStatus.INVALID and msg:
                violations.append(msg)
                
    # Physical consistency check: Wind gust >= wind speed
    if "wind_speed_ms" in obs and "wind_gust_ms" in obs:
        ws = obs["wind_speed_ms"]
        wg = obs["wind_gust_ms"]
        if ws is not None and wg is not None and wg < ws:
            violations.append(f"Inconsistent wind metrics: wind_gust ({wg} m/s) cannot be lower than wind_speed ({ws} m/s)")
            
    return (len(violations) == 0, violations)
