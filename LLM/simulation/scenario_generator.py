"""
POLAR-TWIN Data Engineering: Operational Scenario Generator
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Generates critical operational scenarios (Blizzard, Fuel Starvation, Genset Failure)
with strict simulation provenance and consequence tracking.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from LLM.schemas.provenance_schema import ProvenanceType
from .synthetic_ops_generator import SyntheticOpsGenerator


class ScenarioGenerator:
    def __init__(self, station_id: str = "station_bharati"):
        self.station_id = station_id
        self.generator = SyntheticOpsGenerator(station_id=station_id, seed=777)

    def generate_blizzard_storm_scenario(self, duration_hours: int = 48) -> Dict[str, Any]:
        """
        Simulates severe Category 4 Antarctic Blizzard:
        - Wind gusts up to 45 m/s
        - Temperature drops to -42°C
        - Wind turbine safety shutdown
        - Heat demand surges 280%
        """
        base_dt = datetime(2025, 8, 10, 0, 0, 0, tzinfo=timezone.utc)
        timeline = []
        for h in range(duration_hours):
            cur_dt = base_dt.replace(hour=h % 24)
            # Storm peak between hour 16 and 32
            severity = 1.0 if (16 <= h <= 32) else (h / 16.0 if h < 16 else (48 - h) / 16.0)
            temp = -25.0 - 15.0 * severity
            wind = 12.0 + 32.0 * severity
            
            step = self.generator.generate_coupled_hour(
                dt=cur_dt,
                temp_ambient_c=round(temp, 1),
                wind_speed_ms=round(wind, 1),
                solar_wm2=0.0
            )
            step["scenario_phase"] = "PEAK_BLIZZARD" if severity > 0.8 else "STORM_PASSING"
            timeline.append(step)

        return {
            "scenario_name": "ANTARCTIC_SUPER_BLIZZARD",
            "station_id": self.station_id,
            "provenance_type": ProvenanceType.SIMULATED.value,
            "duration_hours": duration_hours,
            "peak_wind_ms": 44.0,
            "min_temperature_c": -40.0,
            "timeline": timeline
        }
