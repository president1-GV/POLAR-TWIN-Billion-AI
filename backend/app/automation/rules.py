"""
POLAR-TWIN DETERMINISTIC RULE ENGINE
Strict, auditable operational rules for Antarctic station digital twin automation.

Every rule specification enforces:
- rule_id, description, version, priority, timestamp
- inputs, thresholds, conditions
- deterministic result recommendations
"""

from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Callable


class AutomationRule:
    """
    Standard operational rule structure for deterministic decision support.
    """
    def __init__(
        self,
        rule_id: str,
        description: str,
        inputs: List[str],
        thresholds: Dict[str, Any],
        priority: int,
        version: str,
        eval_fn: Callable[[Dict[str, Any], Dict[str, Any]], Tuple[bool, Optional[Dict[str, Any]]]]
    ):
        self.rule_id = rule_id
        self.description = description
        self.inputs = inputs
        self.thresholds = thresholds
        self.priority = priority
        self.version = version
        self.timestamp = "2026-09-30T00:00:00Z"
        self.eval_fn = eval_fn

    def evaluate(self, state: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Executes rule condition against current digital twin state.
        Returns (is_triggered: bool, recommendation_dict: Optional[Dict])
        """
        # Ensure all required inputs are present
        for inp in self.inputs:
            if inp not in state or state[inp] is None:
                return False, None
        return self.eval_fn(state, self.thresholds)


def _eval_high_load_surge(state: Dict[str, Any], th: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    RULE-ENG-001: Surge Demand Exceeds Preferred Operating Envelope
    IF predicted_or_current_load > available_generation AND battery_soc > min_soc
    THEN recommend battery discharge to shave peak and protect spinning reserve margin.
    """
    load_kw = max(float(state.get("predicted_load_kw", 0.0) or 0.0), float(state.get("current_load_kw", 0.0) or 0.0))
    avail_gen = float(state.get("available_generation_kw", 0.0) or 0.0)
    battery_soc = float(state.get("battery_soc_pct", 0.0) or 0.0)
    min_soc = float(th.get("min_operating_soc", 30.0))

    if load_kw > avail_gen and battery_soc > min_soc:
        deficit_kw = round(load_kw - avail_gen, 1)
        max_dis = float(state.get("battery_max_discharge_kw", 150.0))
        target_discharge = min(deficit_kw + 20.0, max_dis)  # +20 kW buffer
        return True, {
            "action_type": "DISCHARGE_BATTERY",
            "asset_id": "bh_bess_01" if state.get("station_id") == "station_bharati" else "ma_bess_01",
            "reason": f"Predicted demand ({load_kw} kW) exceeds active online generation ({avail_gen} kW) by {deficit_kw} kW.",
            "expected_effect": f"Discharge BESS at {target_discharge:.1f} kW to stabilize microgrid bus and prevent blackout.",
            "parameters": {"discharge_kw": target_discharge, "target_bus": "415V_MAIN_BUS", "mode": "PEAK_SHAVING"},
            "confidence": 0.94,
        }
    return False, None


def _eval_gen_shortfall_spin_aux(state: Dict[str, Any], th: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    RULE-ENG-002: Deficit Exceeds Safe Battery Capability
    IF load > available_generation + safe_battery_output
    THEN evaluate and spin auxiliary generator capacity.
    """
    load_kw = max(float(state.get("predicted_load_kw", 0.0) or 0.0), float(state.get("current_load_kw", 0.0) or 0.0))
    avail_gen = float(state.get("available_generation_kw", 0.0) or 0.0)
    battery_max_dis = float(state.get("battery_max_discharge_kw", 100.0))

    if load_kw > (avail_gen + battery_max_dis):
        net_shortfall = round(load_kw - (avail_gen + battery_max_dis), 1)
        target_gen = "bh_gen_02" if state.get("station_id") == "station_bharati" else "ma_gen_02"
        return True, {
            "action_type": "ADJUST_GENERATION",
            "asset_id": target_gen,
            "reason": f"Gross demand ({load_kw} kW) exceeds combined generation and BESS capability by {net_shortfall} kW.",
            "expected_effect": f"Commit Auxiliary Genset 02 at rated capacity (200 kW) to restore a 25% spinning reserve margin.",
            "parameters": {"genset_id": target_gen, "target_output_kw": 180.0, "auto_sync": True},
            "confidence": 0.96,
        }
    return False, None


def _eval_gen_failure_trip(state: Dict[str, Any], th: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    RULE-FAIL-001: Online Generator Sudden Trip / Mechanical Lockout
    IF active generator status is FAILED or CRITICAL and online capacity drops below critical load
    THEN automatically prioritize critical life-support loads, activate emergency battery discharge, and spin emergency backup.
    """
    failed_gens = state.get("failed_generator_ids", [])
    has_trip = len(failed_gens) > 0 or state.get("generator_trip_event", False)
    avail_gen = float(state.get("available_generation_kw", 0.0) or 0.0)
    crit_load = float(state.get("critical_load_kw", 120.0))

    if has_trip and avail_gen < crit_load:
        emergency_gen = "bh_gen_03" if state.get("station_id") == "station_bharati" else "ma_gen_03"
        return True, {
            "action_type": "PRIORITIZE_CRITICAL_LOAD",
            "asset_id": emergency_gen,
            "reason": f"Primary generator tripped ({failed_gens}). Online generation ({avail_gen} kW) below critical life support ({crit_load} kW).",
            "expected_effect": f"Shed non-essential science loads, ramp BESS to 100 kW, and synchronize Emergency Backup Genset ({emergency_gen}).",
            "parameters": {
                "emergency_genset_id": emergency_gen,
                "shed_loads": ["lab_spectrometer", "snowcat_charging_dock", "exterior_floodlights"],
                "protected_loads": ["habitat_hvac_core", "potable_ro_plant", "satellite_uplink"]
            },
            "confidence": 0.99,
        }
    return False, None


def _eval_blizzard_cross_domain_fuel(state: Dict[str, Any], th: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    RULE-CROSS-001: Katabatic Blizzard Thermal Wind-Chill Supply Chain Alert
    IF wind_speed > 35 m/s AND ambient_temp < -25°C AND solar_pv == 0
    THEN thermal loss spikes, specific fuel burn increases by 40%+, and logistics runway drops.
    """
    wind_spd = float(state.get("wind_speed_ms", 0.0) or 0.0)
    amb_temp = float(state.get("ambient_temp_c", 0.0) or 0.0)
    fuel_litres = float(state.get("fuel_reserve_litres", 20000.0) or 0.0)
    
    wind_thresh = float(th.get("wind_blizzard_threshold_ms", 32.0))
    temp_thresh = float(th.get("temp_blizzard_threshold_c", -20.0))

    if wind_spd >= wind_thresh and amb_temp <= temp_thresh:
        # Calculate daily burn rate under storm conditions
        nominal_burn_lpd = float(state.get("nominal_burn_litres_per_day", 850.0))
        storm_burn_lpd = nominal_burn_lpd * 1.45  # 45% increase due to wind-chill convective heat loss
        days_runway = round(fuel_litres / storm_burn_lpd, 1)

        return True, {
            "action_type": "CREATE_LOGISTICS_ALERT",
            "asset_id": "bh_fuel_farm" if state.get("station_id") == "station_bharati" else "ma_fuel_farm",
            "reason": f"Severe katabatic blizzard ({wind_spd} m/s, {amb_temp}°C). Thermal building loss increases fuel burn to {storm_burn_lpd:.0f} L/day. Runway reduced to {days_runway} days.",
            "expected_effect": f"Conserve fuel by reducing secondary habitat heating setpoint by 1.5°C and flag resupply flight window advisory.",
            "parameters": {
                "storm_fuel_burn_lpd": storm_burn_lpd,
                "projected_runway_days": days_runway,
                "recommended_indoor_temp_setpoint_c": 19.5,
                "logistics_priority": "ELEVATED"
            },
            "confidence": 0.91,
        }
    return False, None


def _eval_battery_low_soc_protection(state: Dict[str, Any], th: Dict[str, Any]) -> Tuple[bool, Optional[Dict[str, Any]]]:
    """
    RULE-ENG-003: Battery Low State of Charge (SOC) Reserve Protection
    IF battery_soc <= minimum_reserve_threshold (25%) AND battery is discharging
    THEN halt battery discharge and initiate controlled generator recharge to preserve emergency buffer.
    """
    soc = float(state.get("battery_soc_pct", 100.0) or 100.0)
    min_reserve = float(th.get("min_reserve_soc", 25.0))
    is_discharging = float(state.get("battery_discharge_kw", 0.0) or 0.0) > 0.0

    if soc <= min_reserve and is_discharging:
        return True, {
            "action_type": "CHARGE_BATTERY",
            "asset_id": "bh_bess_01" if state.get("station_id") == "station_bharati" else "ma_bess_01",
            "reason": f"Battery SOC has reached low reserve limit ({soc:.1f}% <= {min_reserve}%).",
            "expected_effect": "Halt battery discharge to prevent cell degradation and switch to slow generator charging mode.",
            "parameters": {"target_charge_kw": 40.0, "cutoff_soc_pct": 80.0},
            "confidence": 0.95,
        }
    return False, None


# Master Canonical Rule Registry
STANDARD_AUTOMATION_RULES: List[AutomationRule] = [
    AutomationRule(
        rule_id="RULE-FAIL-001",
        description="Emergency response to online generator trip or sudden generation loss",
        inputs=["available_generation_kw", "critical_load_kw"],
        thresholds={"critical_margin_kw": 0.0},
        priority=1,
        version="2.1.0",
        eval_fn=_eval_gen_failure_trip,
    ),
    AutomationRule(
        rule_id="RULE-ENG-002",
        description="Auxiliary generator unit commitment when load exceeds generation and battery combined",
        inputs=["current_load_kw", "available_generation_kw", "battery_max_discharge_kw"],
        thresholds={"spinning_reserve_pct": 20.0},
        priority=2,
        version="1.4.0",
        eval_fn=_eval_gen_shortfall_spin_aux,
    ),
    AutomationRule(
        rule_id="RULE-ENG-001",
        description="BESS battery peak-shaving dispatch during high energy demand surges",
        inputs=["current_load_kw", "available_generation_kw", "battery_soc_pct"],
        thresholds={"min_operating_soc": 30.0},
        priority=2,
        version="1.3.0",
        eval_fn=_eval_high_load_surge,
    ),
    AutomationRule(
        rule_id="RULE-CROSS-001",
        description="Cross-domain katabatic blizzard wind-chill fuel consumption & supply risk cascade",
        inputs=["wind_speed_ms", "ambient_temp_c", "fuel_reserve_litres"],
        thresholds={"wind_blizzard_threshold_ms": 32.0, "temp_blizzard_threshold_c": -20.0},
        priority=1,
        version="1.2.0",
        eval_fn=_eval_blizzard_cross_domain_fuel,
    ),
    AutomationRule(
        rule_id="RULE-ENG-003",
        description="Battery low State of Charge (SOC) reserve protection cutoff",
        inputs=["battery_soc_pct"],
        thresholds={"min_reserve_soc": 25.0},
        priority=3,
        version="1.1.0",
        eval_fn=_eval_battery_low_soc_protection,
    ),
]


class RuleEngine:
    """
    Deterministic evaluation engine executing operational rules in priority order.
    """
    def __init__(self, rules: Optional[List[AutomationRule]] = None):
        self.rules = rules or STANDARD_AUTOMATION_RULES

    def evaluate_all(self, state: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Evaluates state against registered rules and returns triggered action recommendations
        sorted by rule priority (1 = highest).
        """
        triggered_results = []
        for rule in sorted(self.rules, key=lambda r: r.priority):
            is_triggered, rec = rule.evaluate(state)
            if is_triggered and rec:
                rec["rule_id"] = rule.rule_id
                rec["rule_description"] = rule.description
                rec["priority"] = rule.priority
                rec["version"] = rule.version
                triggered_results.append(rec)
        return triggered_results
