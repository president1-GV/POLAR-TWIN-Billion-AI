from typing import Dict, Any, List
from datetime import datetime, timezone

class PredictiveMaintenanceService:
    """
    Predictive maintenance analyzer for station critical equipment.
    Projects remaining useful life (RUL) and health degradation based on physical telemetry.
    """
    MODEL_STATUS = "PROTOTYPE / SYNTHETICALLY CALIBRATED"

    def evaluate_asset(self, asset_id: str, telemetry: Dict[str, Any], anomaly_result: Dict[str, Any]) -> Dict[str, Any]:
        vib = float(telemetry.get("vibration_mms", 2.1))
        exhaust = float(telemetry.get("exhaust_temp_c", 385.0))
        oil = float(telemetry.get("oil_pressure_bar", 4.6))
        load = float(telemetry.get("load_pct", 74.0))

        # Base health calculation
        health = 100.0
        evidence = []

        if vib > 2.8:
            penalty = (vib - 2.8) * 18.0
            health -= penalty
            evidence.append(f"Mechanical vibration elevated at {vib:.2f} mm/s (normal < 2.8 mm/s)")
        if exhaust > 420.0:
            penalty = (exhaust - 420.0) * 0.8
            health -= penalty
            evidence.append(f"Exhaust thermal threshold exceeded at {exhaust:.1f} °C (normal < 420 °C)")
        if oil < 3.8:
            penalty = (3.8 - oil) * 25.0
            health -= penalty
            evidence.append(f"Lube oil pressure depressed at {oil:.2f} bar (normal > 3.8 bar)")

        health = max(10.0, min(100.0, health))

        # RUL estimation based on linear/exponential stress projection
        if health < 45.0:
            rul_hours = round(max(2.0, (health / 45.0) * 16.0), 1)
            urgency = "IMMEDIATE_ACTION_REQUIRED"
            action = "Transition primary load to Auxiliary Genset 02. Isolate Genset 01 for bearing & injector inspection."
        elif health < 75.0:
            rul_hours = round(24.0 + (health - 45.0) * 3.5, 1)
            urgency = "SCHEDULE_INSPECTION_WITHIN_48H"
            action = "Reduce continuous load to under 65%. Order oil sample spectrography and filter replacement."
        else:
            rul_hours = 1200.0  # ~50 days to standard overhaul interval
            urgency = "ROUTINE_MONITORING"
            action = "Standard preventive maintenance schedule valid."

        return {
            "asset_id": asset_id,
            "evaluation_status": self.MODEL_STATUS,
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "health_score": round(health, 1),
            "predicted_failure_risk": "CRITICAL" if health < 45.0 else ("ELEVATED" if health < 75.0 else "NORMAL"),
            "estimated_rul_hours": rul_hours,
            "maintenance_urgency": urgency,
            "evidence": evidence if evidence else ["All monitored physical telemetry points within nominal tolerance"],
            "recommended_action": action,
            "confidence": "Synthetic calibration based on Kirloskar 250kVA Polar operating curves"
        }

predictive_maintenance = PredictiveMaintenanceService()
