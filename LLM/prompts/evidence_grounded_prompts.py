"""
POLAR-TWIN Data Engineering: Evidence-Grounded LLM Prompt Engineering
SIH 26060 - Digital Platform for Remote Antarctic Station Management

Defines system prompts, query templates, and strict anti-hallucination protocols:
- Requires citing Provenance Tier, Dataset ID, Observation Timestamp, Sensor ID
- Strict refusal policy for operational queries lacking grounded database records
- Explicit disclaimer when referencing SIMULATED or EXTERNAL_ANTARCTIC_BENCHMARK data
"""

from typing import Dict, Any, List
from LLM.schemas.provenance_schema import ProvenanceType


SYSTEM_PROMPT_EVIDENCE_GROUNDED = """
You are the POLAR-TWIN Sovereign Polar Assistant for Indian Antarctic Station Operations (Maitri & Bharati).
You serve the National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences, Government of India.

CRITICAL INSTRUCTIONS & ZERO-HALLUCINATION PROTOCOL:
1. NEVER invent, fabricate, or assume station telemetry, weather metrics, fuel reserves, or generator statuses.
2. Every operational fact cited MUST be grounded in provided EVIDENCE PACKETS from the POLAR-TWIN database.
3. For every metric stated, you MUST append its strict provenance tier:
   - [REAL_NCPOR]: Official Automatic Weather Station observations for Maitri or Bharati.
   - [EXTERNAL_ANTARCTIC_BENCHMARK]: Australian Antarctic Division (Davis Station) benchmark data. Never conflate with Indian stations!
   - [PUBLIC_EXTERNAL]: Copernicus Southern Ocean sea ice analysis.
   - [SIMULATED]: Digital Twin synthetic operational telemetry or stress scenario.
   - [DERIVED]: Physics engine calculation (e.g. heating degree hours, building envelope thermal loss).
4. If asked for telemetry that is not present in the evidence packets or is outside recorded time windows, you MUST respond:
   "DATA UNAVAILABLE: No verified observation or telemetry record exists in the POLAR-TWIN database for this timestamp/station. Refusing to speculate on mission-critical Antarctic life-support parameters."
5. Never label Australian Antarctic benchmark data as Maitri or Bharati data.
"""


def format_evidence_context(evidence_records: List[Dict[str, Any]]) -> str:
    """
    Serializes database records into a structured, provenance-tagged evidence block
    for LLM prompt injection.
    """
    if not evidence_records:
        return "NO EVIDENCE RECORDS FOUND IN DATABASE."

    lines = ["=== BEGIN POLAR-TWIN GROUND TRUTH EVIDENCE ==="]
    for idx, r in enumerate(evidence_records, 1):
        prov = r.get("provenance_type", "UNKNOWN")
        st_id = r.get("station_id", r.get("benchmark_station", "N/A"))
        ts = r.get("timestamp", "N/A")
        
        # Format payload summary
        details = []
        if "temperature_c" in r:
            details.append(f"Temp={r['temperature_c']}°C")
        if "wind_speed_ms" in r:
            details.append(f"Wind={r['wind_speed_ms']}m/s (Gust={r.get('wind_gust_ms', 'N/A')}m/s)")
        if "atmospheric_pressure_hpa" in r:
            details.append(f"Pressure={r['atmospheric_pressure_hpa']}hPa")
        if "electrical_load_kw" in r:
            details.append(f"Load={r['electrical_load_kw']}kW")
        if "fuel_consumption_rate_lph" in r:
            details.append(f"FuelRate={r['fuel_consumption_rate_lph']}L/h")
        if "energy_grid" in r:
            g = r["energy_grid"]
            details.append(f"GridTotal={g.get('total_consumption_kw')}kW, BattSOC={g.get('battery_charge_pct')}%")
        if "lead_genset_telemetry" in r:
            g = r["lead_genset_telemetry"]
            details.append(f"GensetVib={g.get('vibration_rms_mms')}mm/s, Exhaust={g.get('exhaust_temp_c')}°C")

        summary = ", ".join(details) if details else "Payload details attached."
        lines.append(f"[{idx}] Station: {st_id} | Time: {ts} | Tier: [{prov}] | Data: {summary}")

    lines.append("=== END POLAR-TWIN GROUND TRUTH EVIDENCE ===")
    return "\n".join(lines)


def build_grounded_prompt(user_query: str, evidence_records: List[Dict[str, Any]]) -> str:
    """Builds final prompt with injected evidence context."""
    context = format_evidence_context(evidence_records)
    prompt = f"{SYSTEM_PROMPT_EVIDENCE_GROUNDED}\n\n{context}\n\nUSER OPERATIONAL QUERY:\n{user_query}\n\nASSISTANT EVIDENCE-GROUNDED RESPONSE:"
    return prompt
