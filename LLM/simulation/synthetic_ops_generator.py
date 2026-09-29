"""
POLAR-TWIN Data Engineering: Physics-Coupled Synthetic Telemetry Generator
POLAR-TWIN - Digital Platform for Remote Antarctic Station Management

Generates physically realistic operational telemetry for Antarctic stations (Maitri & Bharati).
Models thermodynamic building envelope, diesel gensets, BESS, and mechanical wear.
Strict Provenance: SIMULATED
Reproducible via explicit random seeds.
"""

import math
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
from LLM.schemas.provenance_schema import ProvenanceType, QualityStatus


class SyntheticOpsGenerator:
    def __init__(self, station_id: str = "station_bharati", seed: int = 42):
        self.station_id = station_id
        self.seed = seed
        self.rng = random.Random(seed)
        
        # Station thermal envelope parameters
        # Bharati: Aerodynamic elevated structure, modern triple-glazed insulation (UA ~ 1.8 kW/K)
        # Maitri: Containerized steel module complex, insulation (UA ~ 2.4 kW/K)
        if station_id == "station_bharati":
            self.UA_kw_per_k = 1.8
            self.base_electric_kw = 120.0
            self.genset_count = 3
            self.genset_capacity_kw = 250.0  # Volvo Penta D13 / Cummins 250kWe
        else:
            self.UA_kw_per_k = 2.4
            self.base_electric_kw = 140.0
            self.genset_count = 4
            self.genset_capacity_kw = 125.0  # Kirloskar / Cummins 125kWe

    def generate_coupled_hour(
        self,
        dt: datetime,
        temp_ambient_c: float,
        wind_speed_ms: float,
        solar_wm2: float = 0.0,
        wear_factor: float = 0.0,
        injector_clog: bool = False
    ) -> Dict[str, Any]:
        """
        Calculates one hour of operational telemetry tightly coupled to ambient environment.
        """
        # 1. Thermal building load (target indoor temp = 20.0°C)
        indoor_target_c = 20.0
        delta_t = max(0.0, indoor_target_c - temp_ambient_c)
        wind_convection_mult = 1.0 + 0.018 * wind_speed_ms
        thermal_loss_kw = self.UA_kw_per_k * delta_t * wind_convection_mult
        
        # Heat pump / electrical heating COP (degrades with deep freezing)
        heat_cop = max(1.1, 2.8 - 0.025 * delta_t)
        hvac_electric_kw = round(thermal_loss_kw / heat_cop, 1)

        # 2. Base critical & scientific loads
        critical_kw = round(self.base_electric_kw * 0.45 + self.rng.gauss(0, 1.5), 1)
        scientific_kw = round(self.base_electric_kw * 0.55 + self.rng.gauss(0, 2.0), 1)
        total_demand_kw = round(hvac_electric_kw + critical_kw + scientific_kw, 1)

        # 3. Renewable contribution (if solar or wind available)
        solar_kw = round((solar_wm2 / 1000.0) * 45.0, 1) if solar_wm2 > 20.0 else 0.0
        wind_kw = 0.0
        if 4.0 <= wind_speed_ms <= 22.0:
            wind_kw = round(min(50.0, 0.45 * (wind_speed_ms ** 2.2)), 1)
        elif wind_speed_ms > 22.0:
            # Cut-out wind speed for Antarctic wind turbines to prevent blade damage
            wind_kw = 0.0

        net_genset_demand_kw = max(35.0, total_demand_kw - solar_kw - wind_kw)

        # 4. Genset load allocation (lead genset 1, lag genset 2)
        active_gensets = 1
        g1_load_kw = net_genset_demand_kw
        g2_load_kw = 0.0
        if g1_load_kw > self.genset_capacity_kw * 0.85:
            active_gensets = 2
            g1_load_kw = round(net_genset_demand_kw * 0.55, 1)
            g2_load_kw = round(net_genset_demand_kw * 0.45, 1)

        # 5. Genset 1 mechanical & combustion physics
        load_pct = min(110.0, (g1_load_kw / self.genset_capacity_kw) * 100.0)
        
        # BSFC curve: ~0.24 L/kWh at optimal load (75%), rising at light load or overload
        bsfc = 0.235 + 0.0008 * abs(load_pct - 75.0)
        fuel_rate_lph = round(g1_load_kw * bsfc + 2.5, 2)
        
        # Exhaust temperature (°C)
        exhaust_temp_c = round(160.0 + 3.2 * load_pct + (45.0 if injector_clog else 0.0) + self.rng.gauss(0, 2.5), 1)
        
        # Vibration RMS (mm/s): ISO 10816 class II (normal < 4.5 mm/s, alert > 7.1 mm/s)
        base_vib = 1.8 + 0.02 * load_pct + (wear_factor * 4.2)
        if injector_clog:
            base_vib += 3.8  # combustion knock / misfire signature
        vib_rms = round(base_vib + self.rng.gauss(0, 0.15), 2)

        # Lube oil pressure (bar) and coolant temp (°C)
        coolant_temp_c = round(82.0 + 0.12 * load_pct + self.rng.gauss(0, 0.8), 1)
        oil_pressure_bar = round(4.5 - 0.008 * (coolant_temp_c - 80.0) + self.rng.gauss(0, 0.05), 2)

        # BESS SOC (%)
        battery_soc = round(88.0 + 6.0 * math.sin(dt.hour * 0.26) + self.rng.gauss(0, 0.5), 1)
        battery_soc = min(100.0, max(20.0, battery_soc))

        return {
            "timestamp": dt.isoformat(),
            "station_id": self.station_id,
            "provenance_type": ProvenanceType.SIMULATED.value,
            "simulation_id": f"sim_seed_{self.seed}",
            "ambient_weather": {
                "temperature_c": temp_ambient_c,
                "wind_speed_ms": wind_speed_ms,
                "solar_radiation_wm2": solar_wm2
            },
            "energy_grid": {
                "total_generation_kw": round(g1_load_kw + g2_load_kw + solar_kw + wind_kw, 1),
                "total_consumption_kw": total_demand_kw,
                "generator_output_kw": round(g1_load_kw + g2_load_kw, 1),
                "solar_output_kw": solar_kw,
                "wind_output_kw": wind_kw,
                "hvac_load_kw": hvac_electric_kw,
                "critical_load_kw": critical_kw,
                "scientific_load_kw": scientific_kw,
                "battery_charge_pct": battery_soc,
                "reserve_margin_pct": round(max(5.0, ((self.genset_capacity_kw * active_gensets - net_genset_demand_kw) / (self.genset_capacity_kw * active_gensets)) * 100.0), 1),
                "grid_frequency_hz": round(50.0 + self.rng.gauss(0, 0.04), 2)
            },
            "lead_genset_telemetry": {
                "asset_id": f"genset_{self.station_id.split('_')[1]}_1",
                "load_kw": g1_load_kw,
                "load_percentage": round(load_pct, 1),
                "fuel_rate_lph": fuel_rate_lph,
                "exhaust_temp_c": exhaust_temp_c,
                "vibration_rms_mms": vib_rms,
                "coolant_temp_c": coolant_temp_c,
                "oil_pressure_bar": oil_pressure_bar
            }
        }

    def generate_sequence(self, hours: int = 168, base_dt: Optional[datetime] = None) -> List[Dict[str, Any]]:
        """Generates continuous hourly sequence of physics-coupled telemetry."""
        if base_dt is None:
            base_dt = datetime(2025, 7, 1, 0, 0, 0, tzinfo=timezone.utc)
            
        sequence = []
        for h in range(hours):
            cur_dt = base_dt + timedelta(hours=h)
            # Ambient weather synthesis for polar winter
            t_amb = -22.0 + 6.0 * math.sin(h * 0.12) - (4.0 if 50 <= h <= 80 else 0.0)
            w_spd = 8.0 + 5.0 * math.cos(h * 0.09) + (14.0 if 60 <= h <= 90 else 0.0)
            
            # Inject a transient wear anomaly halfway through
            wear = 0.0
            inj_clog = False
            if 100 <= h <= 125:
                wear = 0.65
                inj_clog = True

            record = self.generate_coupled_hour(
                dt=cur_dt,
                temp_ambient_c=round(t_amb, 1),
                wind_speed_ms=round(w_spd, 1),
                solar_wm2=0.0,
                wear_factor=wear,
                injector_clog=inj_clog
            )
            sequence.append(record)
        return sequence
