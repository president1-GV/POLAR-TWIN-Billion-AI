import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.stations import router as stations_router
from backend.api.assets import router as assets_router
from backend.api.environment import router as environment_router
from backend.api.energy import router as energy_router
from backend.api.logistics import router as logistics_router
from backend.api.alerts import router as alerts_router
from backend.api.simulation import router as simulation_router
from backend.api.edge import router as edge_router
from backend.api.demo import router as demo_router
from backend.api.audit import router as audit_router
from backend.api.analytics import router as analytics_router
from backend.api.auth import router as auth_router

app = FastAPI(
    title="POLAR-TWIN API",
    description="AI-Enabled Digital Twin for Remote Antarctic Station Operations (SIH 26060)",
    version="2.0.0"
)

# Enable CORS for local dev Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with /api prefix
app.include_router(stations_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(environment_router, prefix="/api")
app.include_router(energy_router, prefix="/api")
app.include_router(logistics_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(simulation_router, prefix="/api")
app.include_router(edge_router, prefix="/api")
app.include_router(demo_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(auth_router, prefix="/api")

@app.get("/")
def root():
    return {
        "product": "POLAR-TWIN",
        "description": "AI-Enabled Digital Twin for Remote Antarctic Station Operations",
        "sih_problem_code": "SIH 26060",
        "stations": ["Bharati", "Maitri"],
        "operating_model": "OBSERVE -> UNDERSTAND -> PREDICT -> SIMULATE -> DECIDE",
        "backend_provider": "Supabase (db.fpoxnocbznagepusczkk.supabase.co)",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {"status": "ONLINE", "service": "POLAR-TWIN FastAPI Gateway"}

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
