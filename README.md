# POLAR-TWIN

**AI-Enabled Digital Twin for Remote Antarctic Station Operations**  
*Smart India Hackathon (SIH) Problem Statement: SIH 26060 — Digital Platform for Efficient Remote Management of Indian Antarctic Research Stations*  
*Target Stations: Maitri & Bharati (National Centre for Polar and Ocean Research — NCPOR / Ministry of Earth Sciences)*

[![Live Deployment](https://img.shields.io/badge/Live_Deployment-GitHub_Pages-00E5FF?style=for-the-badge&logo=github)](https://president1-gv.github.io/POLAR-TWIN-Billion-AI/)
[![Backend](https://img.shields.io/badge/Backend-Supabase_Cloud-3ECF8E?style=for-the-badge&logo=supabase)](https://fpoxnocbznagepusczkk.supabase.co)
[![Repository](https://img.shields.io/badge/GitHub-POLAR--TWIN-181717?style=for-the-badge&logo=github)](https://github.com/president1-GV/POLAR-TWIN-Billion-AI)

- **🌐 Live Production Website**: [https://president1-gv.github.io/POLAR-TWIN-Billion-AI/](https://president1-gv.github.io/POLAR-TWIN-Billion-AI/)
- **📦 GitHub Repository**: [https://github.com/president1-GV/POLAR-TWIN-Billion-AI](https://github.com/president1-GV/POLAR-TWIN-Billion-AI)
- **⚡ Supabase Project Ref**: `fpoxnocbznagepusczkk` (PostgreSQL 17.6 + PostGIS 3.3)

---

## 1. Operating Model

$$\text{OBSERVE} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PREDICT} \longrightarrow \text{SIMULATE} \longrightarrow \text{DECIDE}$$

POLAR-TWIN is not a passive dashboard. It is an operational decision-support Digital Twin platform engineering the complete relationship:
1. **Real & Synthetic Ingestion**: Real public meteorological observations coupled with physics-governed machinery dynamics.
2. **Digital Twin State**: Directed topological graph of station assets with upstream/downstream dependency propagation.
3. **Analytics & AI**: Multivariate anomaly detection (Mahalanobis distance) and predictive failure risk modeling.
4. **Emergency What-If Simulation**: Deterministic calculation of downstream consequences (power loss, thermal decay, freeze risk).
5. **Human-In-The-Loop Decision**: AI formulates explainable mitigation plans; human operators review, approve, and execute simulated stabilizations.

---

## 2. Critical Backend Constraint: Supabase Exclusive

- **Backend Provider**: **Supabase** is the sole backend provider for database, authentication, real-time data, and storage.
- **Strict Prohibition**: Insforge is strictly disallowed in this workspace and never invoked.
- **Supabase Project**: `POLAR-TWIN Billion AI`
- **Project Ref**: `fpoxnocbznagepusczkk`
- **API URL**: `https://fpoxnocbznagepusczkk.supabase.co`
- **Database Host**: `db.fpoxnocbznagepusczkk.supabase.co` (PostgreSQL 17.6 + PostGIS 3.3)

---

## 3. Two-Tier Edge-First Architecture

```text
                 ANTARCTIC STATION (Bharati / Maitri)
                                  │
                 ┌────────────────┴────────────────┐
                 │ RUGGED EDGE TELEMETRY NODE      │
                 │ (Advantech ARK-3531 IoT Gateway)│
                 └────────────────┬────────────────┘
                                  │
                       Local Telemetry Ingestion
                                  │
                       Local Edge Rule Engine
                                  │
                        Local Buffer Queue
                       (Sequence + CRC32 Check)
                                  │
                       Store-and-Forward Replay
                                  │
                     Satellite Link Carrier (C-Band)
                [ONLINE | DEGRADED | OFFLINE | SYNCING]
                                  │
                                  ▼
                     CENTRAL SUPABASE PLATFORM
                                  │
                      FastAPI Python Gateway
                                  │
                      PostgreSQL 17.6 + PostGIS
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
       AI/ML Engine         Twin State Engine      Physics Engine
            │                     │                     │
            └─────────────────────┼─────────────────────┘
                                  │
            ┌─────────────────────┼─────────────────────┐
            │                     │                     │
      3D Twin (Three.js)    Command Center       What-If Simulator
```

### Edge Resilience & Store-and-Forward
When satellite communication is degraded or severed:
- Link status transitions to **EDGE OFFLINE MODE**.
- Local telemetry is serialized and appended to a local FIFO queue with continuous monotonic sequence numbers and CRC32 payload checksums.
- The **Local Edge Rule Engine** continues operating on-station, generating autonomous local alerts without cloud dependency.
- Upon carrier recovery, the node initiates **Store-and-Forward Replay Sync**, transmitting buffered packets to central Supabase, validating checksum integrity, and recording a formal `sync_event`.

---

## 4. Data Provenance & Real Data Ingestion

Every data point in POLAR-TWIN possesses transparent provenance metadata:
- `REAL_PUBLIC`: Legitimate public Antarctic atmospheric measurements from NCPOR / Open-Meteo Antarctic Grid (temperature, wind speed, gusts, pressure, relative humidity). If unavailable, gracefully falls back to calibrated climatology labeled `REAL DATA SOURCE UNAVAILABLE`.
- `PHYSICS_SYNTHETIC`: Physics-correlated thermodynamic and combustion differential equations modeling building heat loss, genset fuel burn, vibration, and exhaust gas temperatures.
- `EDGE_SIMULATED`: On-station rugged edge gateway telemetry with CRC32 verification.
- `FUTURE_IOT`: Planned industrial RS-485 / Modbus / OPC-UA station SCADA integrations.

> **Absolute Rule**: POLAR-TWIN never fabricates fake telemetry or claims unverified live connections to classified station infrastructure.

---

## 5. Coupled Physics & Thermodynamic Model

The physical behavior of Bharati and Maitri is governed by causal equations:
1. **Convective Heat Loss**:
   $$K_{\text{loss}} = K_{\text{base}} \cdot \left(1 + \beta \cdot v_{\text{wind}}^{0.78}\right)$$
2. **Station Heating Demand**:
   $$Q_{\text{hvac}} = \max\left(5.0, U \cdot A \cdot (T_{\text{target}} - T_{\text{ambient}}) \cdot K_{\text{loss}}\right)$$
3. **Microgrid Total Demand**:
   $$P_{\text{total}} = P_{\text{base}} + \frac{Q_{\text{hvac}}}{\text{COP}} - P_{\text{solar}}$$
4. **Genset Specific Fuel Consumption**:
   $$F_{\text{burn}} = b_0 + b_1 \cdot P_{\text{generator}} \quad (\text{Litres/hour})$$
5. **Thermal Decay & Freeze Horizon**:
   Calculates exact hours until indoor habitat temperatures breach the $+5^\circ\text{C}$ structural freeze threshold during complete generation blackout.

---

## 6. AI Anomaly Detection & Predictive Maintenance

- **Multivariate Mahalanobis Detector**: Evaluates a 5-dimensional rotating machinery vector:
  $$\mathbf{x} = \begin{bmatrix} T_{\text{exhaust}} & \text{vibration} & \text{load}\% & P_{\text{oil}} & F_{\text{fuel}} \end{bmatrix}^T$$
  Computes distance $D_M = \sqrt{(\mathbf{x} - \boldsymbol{\mu})^T \boldsymbol{\Sigma}^{-1} (\mathbf{x} - \boldsymbol{\mu})}$.
- **Transparent Explainability**: Provides exact feature attribution z-scores (e.g. `vibration +3.4σ elevated`, `exhaust gas +3.1σ elevated`).
- **Predictive Maintenance**: Calculates Remaining Useful Life (RUL in hours) and operational urgency.
- **Model Status**: Explicitly labeled `PROTOTYPE / SYNTHETICALLY CALIBRATED`. Never fabricates fake accuracy metrics.

---

## 7. Emergency What-If Simulation Engine

Provides 8 deterministic scenarios:
1. `GENERATOR_FAILURE`: Primary 250 kVA genset trip; computes 185 kW deficit and 3.8-hour thermal decay window.
2. `EXTREME_COLD`: $-48^\circ\text{C}$ polar vortex surge; heating surge and trace heating activation.
3. `BLIZZARD`: 45 m/s katabatic gale; zero-visibility lockdown.
4. `FUEL_SHORTAGE`: Transfer line freeze and aviation fuel cloud-point wax hazard.
5. `FUEL_LEAK`: Bulk tank containment breach detection.
6. `COMMUNICATION_LOSS`: Geomagnetic blackout.
7. `BATTERY_FAILURE`: BESS cell thermal disconnect.
8. `LOGISTICS_DELAY`: Resupply ship (MV Vasiliy Golovnin) delayed 14 days in pack ice.

### Human-In-The-Loop Workflow
AI recommends actionable mitigations (e.g., auto-start Aux Genset 02 + shed East Wing Lab). The duty operator reviews and clicks **APPROVE SIMULATED MITIGATION**, which updates the Digital Twin, stabilizes the microgrid, and commits an immutable entry to `audit_logs`.

---

## 8. Deterministic Killer Demo Scenario (SIH 26060)

Click **RUN 1-CLICK KILLER DEMO** on the top command bar to watch the 8-step closed loop:
1. **BASELINE**: Bharati nominal operation ($-18.4^\circ\text{C}$, 11 m/s wind, 185 kW load, 96.5% health).
2. **SHOCK**: Polar vortex drops temperature to $-38.0^\circ\text{C}$; katabatic wind reaches 34 m/s. Heating demand surges 109%.
3. **ANOMALY**: Primary Genset 01 vibration jumps to 4.82 mm/s; exhaust temperature spikes to $468^\circ\text{C}$.
4. **AI PREDICTION**: Mahalanobis detector computes $D_M = 4.86$ ($> 3.0$ threshold) with feature attributions.
5. **CRITICAL ALERT**: Genset 01 health drops to 41.0%; critical operational alert broadcast.
6. **SIMULATE**: Genset 01 trips. What-if engine calculates 185 kW deficit, 3.8-hour freeze window, and potable water freeze risk.
7. **DECIDE**: System formulates explainable mitigation (Start Aux Genset 02 + shed East Wing Lab + deploy BESS).
8. **STABILIZE**: Operator authorizes mitigation. Digital twin stabilizes to 94.8% health, indoor temp recovers to $+21.5^\circ\text{C}$, audit log entry written.

---

## 9. Verification & Test Suite

The repository contains an automated unit and end-to-end integration test suite:

```bash
# 1. Physics Engine & Asset Graph Tests
python -m backend.tests.test_physics

# 2. AI Multivariate Anomaly & Predictive Maintenance Tests
python -m backend.tests.test_ai_anomaly

# 3. Edge Offline Buffer & Store-and-Forward Replay Tests
python -m backend.tests.test_edge_offline

# 4. Emergency What-If Scenarios Deterministic Tests
python -m backend.tests.test_simulation_scenarios

# 5. Full 14-Step Operational End-to-End Scenario Test
python -m backend.tests.test_e2e_scenario
```

---

## 10. Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- Supabase project credentials (configured in `.env`)

### 1. Database Setup
```bash
python apply_db.py
```

### 2. Backend Startup
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
Swagger API documentation available at `http://localhost:8000/docs`.

### 3. Frontend Startup
```bash
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Docker Containerized Startup
```bash
docker compose up --build
```
- Backend accessible at: `http://localhost:8000`
- Frontend accessible at: `http://localhost:5173`

---

## 11. Geospatial GIS Architecture (PostGIS EPSG:3031)

POLAR-TWIN incorporates real geospatial coordinates and spatial boundaries in PostgreSQL 17.6 with PostGIS:
- **Bharati Station**: Larsemann Hills, Princess Elizabeth Land ($-69.4072^\circ\text{S}, 76.1950^\circ\text{E}$, Elev 35m)
- **Maitri Station**: Schirmacher Oasis, Queen Maud Land ($-70.7670^\circ\text{S}, 11.7330^\circ\text{E}$, Elev 117m)
- **Dakshin Gangotri**: Historic First Station / Storage Depot ($-70.0900^\circ\text{S}, 12.0000^\circ\text{E}$, Elev 15m)
- **Maritime Supply Corridors**: Modeled transit tracks from Cape Town, South Africa through the Southern Ocean into Prydz Bay and India Bay.
- **Atmospheric Overlays**: Katabatic wind streamlines, sea-ice maximum/minimum extent contours, and isotherm bands.

---

## 12. Adversarial Evaluator Defense (SIH 26060 Architectural FAQ)

| Evaluator Question | POLAR-TWIN Architectural Answer |
| :--- | :--- |
| **"Where does your data come from?"** | Public meteorological observations are ingested in real-time from NCPOR / Open-Meteo Antarctic Grid (`REAL_PUBLIC`). Machinery telemetry is generated using first-principles thermodynamic and electrical differential equations (`PHYSICS_SYNTHETIC`). Every metric carries explicit provenance. |
| **"Is this really a Digital Twin or just a 3D dashboard?"** | It is a stateful domain twin. If the 3D viewer is completely removed, all physics equations, multivariate anomaly detection, energy forecasting, dependency cascade graphs, and what-if simulations continue running uninterrupted in the backend and database. |
| **"What happens if the satellite link fails?"** | The station does not stop. The on-station rugged edge computer switches to **Edge Offline Mode**, continues local rules and alerts, buffers telemetry in a FIFO queue with CRC32 checksums, and replays idempotently upon carrier recovery. |
| **"How does the AI work?"** | Multivariate Mahalanobis distance metric ($D_M > 3.0$) computed over a 5D machinery feature vector ($\text{vibration}, T_{\text{exhaust}}, \text{load}\%, P_{\text{oil}}, F_{\text{fuel}}$) with exact feature attribution z-scores. No black-box or fabricated LLM claims. |
| **"Can you reproduce your simulations?"** | Yes. All simulations operate on immutable cloned state snapshots with deterministic initial boundary conditions, preserving exact step-by-step audit records. |
| **"Are you controlling real physical equipment?"** | No. POLAR-TWIN is a human-in-the-loop decision support system. Operator approvals mutate the *simulated digital twin state* and record audit logs; it never claims autonomous physical actuation over real life-safety station machinery. |

---

## 13. Prototype Limitations Disclaimer

> **Official Notice**: This system is a high-fidelity operational prototype designed for evaluation under SIH 26060. Meteorological observations use public scientific feeds (NCPOR / Open-Meteo Antarctic Grid). Machinery telemetry, internal SCADA states, and satellite link carrier losses are simulated using calibrated Antarctic thermodynamic and electrical models. This prototype does not claim access to classified or restricted Indian Antarctic infrastructure.

