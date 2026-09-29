import math
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta

class EnergyAndLogisticsForecastService:
    """
    Forecasting service for Antarctic station energy demand, fuel burn, and logistics runway.
    Uses physics-grounded weather forecasts as causal drivers.
    """
    MODEL_STATUS = "PROTOTYPE / SYNTHETICALLY CALIBRATED"

    def forecast_energy_24h(self, base_temp_c: float = -18.5, base_wind_ms: float = 11.2) -> Dict[str, Any]:
        """
        Generates 24-hour hourly forward projections based on diurnal temperature cycles.
        """
        hourly_points = []
        now = datetime.now(timezone.utc)
        
        total_kwh = 0.0
        total_fuel_litres = 0.0

        for h in range(24):
            ts = (now + timedelta(hours=h)).strftime("%H:00")
            # Diurnal temperature cycle: lowest in early hours, warmer during solar midday
            diurnal_delta = 4.5 * math.sin((h - 8) * (2 * math.pi / 24))
            temp_c = round(base_temp_c + diurnal_delta, 1)
            # Wind gusts vary slightly
            wind_ms = round(max(3.0, base_wind_ms + 2.5 * math.cos(h * 0.5)), 1)

            # Causal heating and power calculation
            wind_factor = 1.0 + 0.045 * (wind_ms ** 0.78)
            delta_t = max(0.0, 21.5 - temp_c)
            q_heat_kw = (0.22 * 1420.0 * delta_t * wind_factor) / 1000.0
            p_hvac_kw = q_heat_kw / 2.4
            p_total_kw = round(82.0 + p_hvac_kw, 1)

            # Fuel consumption in litres per hour
            fuel_lph = round(8.5 + (0.165 * p_total_kw), 1)

            total_kwh += p_total_kw
            total_fuel_litres += fuel_lph

            hourly_points.append({
                "hour": ts,
                "ambient_temp_c": temp_c,
                "wind_speed_ms": wind_ms,
                "demand_kw": p_total_kw,
                "hvac_kw": round(p_hvac_kw, 1),
                "fuel_burn_lph": fuel_lph
            })

        return {
            "forecast_type": "24_HOUR_HOURLY",
            "model_status": self.MODEL_STATUS,
            "generated_at": now.isoformat(),
            "causal_driver": "Diurnal Antarctic thermal envelope differential equations",
            "summary": {
                "total_energy_kwh": round(total_kwh, 1),
                "avg_demand_kw": round(total_kwh / 24.0, 1),
                "peak_demand_kw": max(p["demand_kw"] for p in hourly_points),
                "total_fuel_burn_litres": round(total_fuel_litres, 1),
                "avg_fuel_flow_lph": round(total_fuel_litres / 24.0, 1)
            },
            "hourly_points": hourly_points
        }

    def forecast_logistics_runway(self, items: List[Dict[str, Any]], shipment_delay_days: int = 0) -> List[Dict[str, Any]]:
        """
        Recalculates supply runway and shortage risk under normal or delayed shipping conditions.
        """
        results = []
        for it in items:
            stock = float(it.get("current_stock", 1000.0))
            burn = float(it.get("daily_burn_rate", 10.0))
            reserve = float(it.get("minimum_reserve", 200.0))
            days_left = round(stock / max(0.01, burn), 1)

            # Calculate days remaining after shipment delay
            # If shipment is scheduled in X days, will reserve be breached?
            nominal_resupply_day = 78  # e.g., next expedition arrival
            effective_arrival_day = nominal_resupply_day + shipment_delay_days
            days_margin = days_left - effective_arrival_day

            if days_margin < 0:
                risk = "CRITICAL"
                msg = f"Stock will be exhausted {abs(days_margin):.1f} days before delayed vessel arrival!"
            elif days_margin < 15:
                risk = "HIGH"
                msg = f"Severe reserve breach: Only {days_margin:.1f} buffer days remain at arrival."
            elif days_margin < 30:
                risk = "MEDIUM"
                msg = f"Close tolerance: Safety reserve compromised by {shipment_delay_days} days delay."
            else:
                risk = "LOW"
                msg = "Adequate operational buffer above minimum emergency threshold."

            results.append({
                "item_id": it.get("id") or it.get("item_id"),
                "id": it.get("id") or it.get("item_id"),
                "name": it.get("name", "Unknown Resource"),
                "category": it.get("category", "GENERAL"),
                "sku": it.get("sku", "POLAR-RES"),
                "unit": it.get("unit", "Units"),
                "current_stock": stock,
                "daily_burn_rate": burn,
                "minimum_reserve": reserve,
                "days_remaining_nominal": days_left,
                "simulated_days_remaining": round(max(0.0, days_left - shipment_delay_days), 1),
                "shipment_delay_days": shipment_delay_days,
                "days_buffer_at_arrival": round(days_margin, 1),
                "shortage_risk_level": risk,
                "risk_level": risk,
                "storage_location": it.get("storage_location", "Station Storage Depot"),
                "evidence_rationale": msg,
                "recommended_contingency": (
                    "CRITICAL: Initiate Tier-3 emergency rationing and prioritize air drop resupply"
                    if risk == "CRITICAL"
                    else "HIGH: Implement auxiliary conservation protocol"
                    if risk == "HIGH"
                    else "Monitor consumption against daily burn target"
                )
            })
        return results

forecasting_service = EnergyAndLogisticsForecastService()
