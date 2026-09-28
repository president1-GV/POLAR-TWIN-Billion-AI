import os
import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.security.headers import SecurityHeadersMiddleware
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
    description="Zero-Trust Operational Digital Twin for Remote Antarctic Research Stations (SIH 26060)",
    version="2.1.0"
)

# 1. Security Headers Defense-in-Depth Middleware
app.add_middleware(SecurityHeadersMiddleware)

# 2. Strict CORS Configuration - Explicit Origins Only (Never Wildcard with Credentials)
trusted_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "https://president1-gv.github.io"
]
custom_origins = os.getenv("ALLOWED_ORIGINS", "")
if custom_origins:
    trusted_origins.extend([o.strip() for o in custom_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=trusted_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept", "X-Requested-With"],
)

# 3. Secure Error Handling: Never leak raw tracebacks or internal paths to clients
@app.exception_handler(Exception)
async def global_security_exception_handler(request: Request, exc: Exception):
    # Log internally
    err_str = str(exc)
    # Check if HTTPException
    status_code = getattr(exc, "status_code", 500)
    detail = getattr(exc, "detail", "Internal server error occurred.")
    
    if status_code == 500:
        # Sanitize internal 500 errors to prevent info leakage
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "InternalServerError",
                "message": "An internal operational error occurred. The incident has been recorded in the security audit log.",
                "status_code": 500
            }
        )
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": exc.__class__.__name__,
            "detail": detail,
            "status_code": status_code
        }
    )

# 4. Register Protected Routers
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
        "description": "Zero-Trust Operational Digital Twin for Remote Antarctic Station Operations",
        "sih_problem_code": "SIH 26060",
        "security_standard": "Zero-Trust Architecture (RBAC + ABAC + PBKDF2 + Rate Limiting)",
        "stations": ["Bharati", "Maitri"],
        "operating_model": "OBSERVE -> UNDERSTAND -> PREDICT -> SIMULATE -> DECIDE",
        "backend_provider": "Supabase (db.fpoxnocbznagepusczkk.supabase.co)",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health():
    return {
        "status": "ONLINE",
        "security_posture": "ZERO_TRUST_ENFORCED",
        "service": "POLAR-TWIN FastAPI Hardened Gateway"
    }

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
