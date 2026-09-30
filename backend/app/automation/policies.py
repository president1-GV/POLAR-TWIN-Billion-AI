"""
POLAR-TWIN AUTOMATION POLICIES & TRIGGER DEFINITIONS
Configurable operational policies, trigger types, and role-based permissions.
"""

from typing import Dict, Any, List, Set, Literal


TriggerType = Literal[
    "THRESHOLD_TRIGGER",
    "FORECAST_TRIGGER",
    "ANOMALY_TRIGGER",
    "SCHEDULE_TRIGGER",
    "SCENARIO_TRIGGER",
    "DATA_QUALITY_TRIGGER",
    "EVENT_TRIGGER",
]

# Role-Based Permissions for Smart Automation
AUTOMATION_PERMISSIONS: Dict[str, Set[str]] = {
    "ADMIN": {
        "configure_policies",
        "override_thresholds",
        "approve_consequential_actions",
        "execute_simulation",
        "view_decision_trace",
        "view_audit_history",
        "rollback_automation"
    },
    "COMMANDER": {
        "approve_consequential_actions",
        "escalate_action",
        "execute_simulation",
        "view_decision_trace",
        "view_audit_history",
        "emergency_override"
    },
    "ENGINEER": {
        "approve_consequential_actions",
        "inspect_technical_trace",
        "execute_simulation",
        "view_decision_trace",
        "view_audit_history"
    },
    "STATION_OPERATOR": {
        "approve_consequential_actions",
        "reject_action",
        "execute_simulation",
        "view_decision_trace",
        "view_audit_history"
    },
    "SCIENTIST": {
        "view_decision_trace",
        "view_audit_history",
        "inspect_environmental_triggers"
    },
    "AUDITOR": {
        "view_decision_trace",
        "view_audit_history",
        "export_audit_trail"
    },
    "VIEWER": {
        "view_decision_trace",
        "view_status"
    }
}


def can_user_execute(role: str, permission: str) -> bool:
    """Verifies server-side authorization for automation actions."""
    role_norm = (role or "VIEWER").upper().replace(" ", "_")
    # Station Commander has all operator and commander permissions
    if role_norm in {"STATION_COMMANDER", "COMMANDER"}:
        role_norm = "COMMANDER"
    return permission in AUTOMATION_PERMISSIONS.get(role_norm, set())


# Configurable Station Automation Policies
DEFAULT_STATION_POLICIES: Dict[str, Dict[str, Any]] = {
    "station_bharati": {
        "station_name": "Bharati Antarctic Research Station",
        "max_peak_load_kw": 450.0,
        "min_spinning_reserve_pct": 20.0,
        "battery_min_soc_pct": 25.0,
        "emergency_generator_id": "bh_gen_03",
        "auto_approval_enabled": False,  # Strict human-in-the-loop for consequential physical actions
        "simulation_sandbox_only": True,
        "blizzard_wind_threshold_ms": 32.0,
        "fuel_reserve_critical_days": 30.0,
    },
    "station_maitri": {
        "station_name": "Maitri Antarctic Research Station",
        "max_peak_load_kw": 300.0,
        "min_spinning_reserve_pct": 25.0,
        "battery_min_soc_pct": 30.0,
        "emergency_generator_id": "ma_gen_03",
        "auto_approval_enabled": False,
        "simulation_sandbox_only": True,
        "blizzard_wind_threshold_ms": 30.0,
        "fuel_reserve_critical_days": 35.0,
    }
}
