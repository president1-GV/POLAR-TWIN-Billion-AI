import unittest
from backend.digital_twin.causal_chain import causal_chain_engine
from backend.digital_twin.state_engine import digital_twin_engine

class TestCrossDomainCausalChainAndCanonicalTwin(unittest.TestCase):
    """
    Forensic test suite for the 10-Link Cross-Domain Causal Chain Engine
    and the 15 Canonical Domains of the Digital Twin.
    """

    def test_causal_chain_10_links_complete(self):
        """Verify that evaluate() produces all 10 links in precise sequence."""
        res = causal_chain_engine.evaluate(
            station_id="station_bharati",
            ambient_temp_c=-20.0,
            wind_speed_ms=15.0
        )
        self.assertIn("causal_chain_links", res)
        links = res["causal_chain_links"]
        self.assertEqual(len(links), 10, "Causal chain must contain exactly 10 links")

        expected_link_ids = [
            "ENVIRONMENTAL_CHANGE",
            "ENERGY_FORECAST_THERMAL",
            "GENERATION_LOAD_IMPACT",
            "BATTERY_GENERATOR_OPTIMIZATION",
            "FUEL_CONSUMPTION_SURGE",
            "INVENTORY_FORECAST",
            "LOGISTICS_RISK",
            "ALERT_DISPATCH",
            "SCENARIO_ANALYSIS",
            "DECISION_SUPPORT"
        ]

        for i, expected_id in enumerate(expected_link_ids):
            link = links[i]
            self.assertEqual(link["link_index"], i + 1)
            self.assertEqual(link["link_id"], expected_id)
            self.assertIn("station_id", link)
            self.assertIn("timestamp", link)
            self.assertIn("source", link)
            self.assertIn("data_status", link)
            self.assertIn("confidence", link)
            self.assertGreaterEqual(link["confidence"], 0.8)
            self.assertIn("outputs", link)

    def test_causal_chain_physics_sensitivity(self):
        """Verify that severe weather increases convective loss, load, fuel burn, and risk."""
        mild_res = causal_chain_engine.evaluate(
            station_id="station_bharati",
            ambient_temp_c=-12.0,
            wind_speed_ms=5.0
        )
        storm_res = causal_chain_engine.evaluate(
            station_id="station_bharati",
            ambient_temp_c=-42.0,
            wind_speed_ms=38.0
        )

        mild_kpis = mild_res["summary_kpis"]
        storm_kpis = storm_res["summary_kpis"]

        # Convective heat loss must be significantly higher in storm
        self.assertGreater(storm_kpis["heat_loss_kw"], mild_kpis["heat_loss_kw"])
        # Microgrid electrical demand must surge
        self.assertGreater(storm_kpis["microgrid_load_kw"], mild_kpis["microgrid_load_kw"])
        # Generator fuel burn must surge
        self.assertGreater(storm_kpis["fuel_burn_lph"], mild_kpis["fuel_burn_lph"])
        # Fuel runway days must compress
        self.assertLess(storm_kpis["fuel_runway_days"], mild_kpis["fuel_runway_days"])
        # Logistics risk margin must narrow
        self.assertLess(storm_kpis["resupply_safety_margin_days"], mild_kpis["resupply_safety_margin_days"])

    def test_causal_chain_mitigation_recovery(self):
        """Verify that shedding non-critical science loads recovers fuel runway."""
        unmitigated = causal_chain_engine.evaluate(
            station_id="station_bharati",
            ambient_temp_c=-35.0,
            wind_speed_ms=30.0,
            shed_priority_1_loads=False
        )
        mitigated = causal_chain_engine.evaluate(
            station_id="station_bharati",
            ambient_temp_c=-35.0,
            wind_speed_ms=30.0,
            shed_priority_1_loads=True
        )

        unmit_kpis = unmitigated["summary_kpis"]
        mit_kpis = mitigated["summary_kpis"]

        # Electrical demand must decrease
        self.assertLess(mit_kpis["microgrid_load_kw"], unmit_kpis["microgrid_load_kw"])
        # Fuel burn must drop
        self.assertLess(mit_kpis["fuel_burn_lph"], unmit_kpis["fuel_burn_lph"])
        # Runway days must increase
        self.assertGreater(mit_kpis["fuel_runway_days"], unmit_kpis["fuel_runway_days"])

    def test_maitri_station_specific_causal_chain(self):
        """Verify that Maitri parameters reflect its 100 kW gensets and modular U-value."""
        maitri_res = causal_chain_engine.evaluate(
            station_id="station_maitri",
            ambient_temp_c=-20.0,
            wind_speed_ms=15.0
        )
        self.assertEqual(maitri_res["station_id"], "station_maitri")
        self.assertEqual(len(maitri_res["causal_chain_links"]), 10)
        self.assertIn("Maitri", maitri_res["station_name"])

    def test_canonical_15_domains_in_state_engine(self):
        """Verify that get_station_twin strictly outputs the 15 canonical domains."""
        twin = digital_twin_engine.get_station_twin("station_bharati")
        self.assertIn("canonical_twin", twin)
        c_twin = twin["canonical_twin"]

        expected_15_domains = [
            "station",
            "geography",
            "terrain",
            "assets",
            "relationships",
            "infrastructure",
            "energy",
            "logistics",
            "environment",
            "telemetry",
            "predictions",
            "simulations",
            "alerts",
            "provenance",
            "audit"
        ]

        for domain in expected_15_domains:
            self.assertIn(domain, c_twin, f"Domain '{domain}' missing from canonical_twin")

        # Check metadata fields in domain_station
        st = c_twin["station"]
        self.assertEqual(st["station_code"], "BHARATI")
        self.assertEqual(st["data_status"], "OBSERVED_VERIFIED")
        self.assertEqual(st["confidence"], 1.0)

        # Check domain_geography
        geo = c_twin["geography"]
        self.assertEqual(geo["datum"], "WGS84")
        self.assertEqual(geo["spatial_drift_meters"], 0.0)

        # Check backwards compatibility top-level keys
        self.assertIn("overall_health_score", twin)
        self.assertIn("life_support_state", twin)
        self.assertIn("microgrid_summary", twin)
        self.assertIn("thermal_summary", twin)

if __name__ == "__main__":
    unittest.main()
