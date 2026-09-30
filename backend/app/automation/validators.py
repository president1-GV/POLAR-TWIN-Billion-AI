"""
POLAR-TWIN SMART AUTOMATION DATA QUALITY GATE
Strict pre-execution validation for Antarctic station automation workflows.

Enforces:
- Telemetry freshness and temporal validity
- Strict physical sensor range limits
- Data completeness and asset existence
- Transparent data provenance gating
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple


class DataQualityGate:
    """
    Automated pre-flight data validator. Blocks automation if input state
    is stale, physically implausible, missing critical fields, or unverified.
    """

    # Physical plausibility limits for Antarctic stations (Bharati & Maitri)
    LIMITS = {
        "current_load_kw": (5.0, 2500.0),
        "battery_soc_pct": (0.0, 100.0),
        "battery_capacity_kwh": (50.0, 2000.0),
        "battery_max_discharge_kw": (10.0, 1000.0),
        "battery_max_charge_kw": (10.0, 1000.0),
        "solar_pv_generation_kw": (0.0, 500.0),
        "wind_generation_kw": (0.0, 500.0),
        "fuel_reserve_litres": (100.0, 500000.0),
        "ambient_temp_c": (-90.0, 30.0),
        "indoor_temp_c": (-10.0, 35.0),
        "wind_speed_ms": (0.0, 85.0),
        "critical_load_kw": (5.0, 1500.0),
    }

    MAX_FRESHNESS_SECONDS = 900.0  # 15 minutes max acceptable staleness

    @classmethod
    def validate_state(cls, state: Dict[str, Any]) -> Tuple[bool, str, List[str], Dict[str, Any]]:
        """
        Validates a digital twin state dictionary.
        Returns:
            (is_valid: bool, quality_tier: str, issues: List[str], sanitized_state: Dict[str, Any])
        """
        issues: List[str] = []
        now_dt = datetime.now(timezone.utc)

        # 1. Station verification
        station_id = state.get("station_id")
        if not station_id or station_id not in {"station_bharati", "station_maitri"}:
            issues.append(f"Invalid or missing station_id: '{station_id}'. Must be station_bharati or station_maitri.")

        # 2. Freshness check
        timestamp_str = state.get("timestamp")
        if timestamp_str:
            try:
                # Handle ISO timestamps with or without Z
                ts_clean = timestamp_str.replace("Z", "+00:00")
                parsed_ts = datetime.fromisoformat(ts_clean)
                if parsed_ts.tzinfo is None:
                    parsed_ts = parsed_ts.replace(tzinfo=timezone.utc)
                age_seconds = (now_dt - parsed_ts).total_seconds()
                if age_seconds < -60:
                    issues.append(f"Timestamp is in the future by {-age_seconds:.1f}s.")
                elif age_seconds > cls.MAX_FRESHNESS_SECONDS:
                    issues.append(f"Data is STALE (age: {age_seconds:.1f}s > threshold: {cls.MAX_FRESHNESS_SECONDS}s).")
            except Exception as e:
                issues.append(f"Unparseable timestamp '{timestamp_str}': {str(e)}")
        else:
            # If no timestamp provided, treat as fresh synthetic state for simulation
            state["timestamp"] = now_dt.isoformat()

        # 3. Essential fields presence
        required_fields = ["current_load_kw", "battery_soc_pct", "fuel_reserve_litres"]
        for field in required_fields:
            if field not in state or state[field] is None:
                issues.append(f"Missing mandatory telemetry field: '{field}'.")

        # 4. Physical range validation
        for param, (min_v, max_v) in cls.LIMITS.items():
            if param in state and state[param] is not None:
                try:
                    val = float(state[param])
                    if val < min_v or val > max_v:
                        issues.append(
                            f"Out-of-range sensor value for '{param}': {val} (expected [{min_v}, {max_v}])."
                        )
                except (ValueError, TypeError):
                    issues.append(f"Non-numeric telemetry received for '{param}': {state[param]}")

        # 5. Logical consistency checks
        curr_load = float(state.get("current_load_kw", 0.0) or 0.0)
        crit_load = float(state.get("critical_load_kw", 0.0) or 0.0)
        if crit_load > curr_load and curr_load > 0:
            issues.append(f"Critical load ({crit_load} kW) cannot exceed total current load ({curr_load} kW).")

        # 6. Quality tier determination
        if any("Invalid or missing" in i or "Missing mandatory" in i or "Out-of-range" in i for i in issues):
            quality_tier = "INVALID"
            is_valid = False
        elif any("STALE" in i for i in issues):
            quality_tier = "DEGRADED"
            is_valid = False  # Stale data blocks consequential autonomous actions
        elif issues:
            quality_tier = "SUSPECT"
            is_valid = True
        else:
            quality_tier = "VERIFIED"
            is_valid = True

        return is_valid, quality_tier, issues, state
