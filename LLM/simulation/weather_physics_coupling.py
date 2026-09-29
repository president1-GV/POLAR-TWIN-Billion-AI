"""
POLAR-TWIN Data Engineering: Weather-to-Digital-Twin Physics Coupling
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Bridges real AWS observations (REAL_NCPOR) with digital twin asset physics,
producing DERIVED telemetry while rigorously maintaining source provenance links.
"""

from typing import Dict, Any, List
from LLM.schemas.provenance_schema import ProvenanceType
from .synthetic_ops_generator import SyntheticOpsGenerator


class WeatherPhysicsCoupler:
    def __init__(self, station_id: str = "station_bharati"):
        self.station_id = station_id
        self.sim_engine = SyntheticOpsGenerator(station_id=station_id, seed=101)

    def couple_observations(self, observations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes real observations (REAL_NCPOR) and drives digital twin state equations.
        Outputs records tagged with DERIVED provenance, preserving the parent observation reference.
        """
        derived_states = []
        for obs in observations:
            obs_dt_str = obs.get("timestamp")
            from datetime import datetime
            dt = datetime.fromisoformat(obs_dt_str)
            t_amb = float(obs.get("temperature_c", -20.0))
            w_spd = float(obs.get("wind_speed_ms", 10.0))
            solar = float(obs.get("solar_radiation_wm2", 0.0))

            telemetry = self.sim_engine.generate_coupled_hour(
                dt=dt,
                temp_ambient_c=t_amb,
                wind_speed_ms=w_spd,
                solar_wm2=solar
            )
            
            # Reclassify provenance as DERIVED because it is physically derived from REAL_NCPOR input
            telemetry["provenance_type"] = ProvenanceType.DERIVED.value
            telemetry["parent_observation_timestamp"] = obs_dt_str
            telemetry["parent_provenance"] = obs.get("provenance_type", ProvenanceType.REAL_NCPOR.value)
            telemetry["coupling_model"] = "POLAR-TWIN-Thermal-Electric-Coupling-v2.0"
            derived_states.append(telemetry)

        return derived_states
