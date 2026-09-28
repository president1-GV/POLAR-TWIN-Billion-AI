from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

ROLES_DEFINITION = {
    "VIEWER": {
        "title": "Operational Viewer",
        "permissions": ["view_stations", "view_telemetry", "view_3d", "view_weather"]
    },
    "OPERATOR": {
        "title": "Station Duty Operator",
        "permissions": ["view_stations", "view_telemetry", "view_3d", "view_weather", "acknowledge_alerts", "run_simulations", "review_mitigations", "approve_mitigations"]
    },
    "ENGINEER": {
        "title": "Electrical & Mechanical Engineer",
        "permissions": ["view_stations", "view_telemetry", "view_3d", "view_weather", "acknowledge_alerts", "run_simulations", "review_mitigations", "inject_telemetry", "diagnose_assets", "view_model_parameters"]
    },
    "ANALYST": {
        "title": "Scientific & Energy Analyst",
        "permissions": ["view_stations", "view_telemetry", "view_3d", "view_weather", "view_analytics", "view_forecasts", "run_simulations", "export_reports"]
    },
    "SUPERVISOR": {
        "title": "Antarctic Base Commander / Supervisor",
        "permissions": ["*"]
    },
    "ADMIN": {
        "title": "System Administrator",
        "permissions": ["*"]
    }
}

DEFAULT_USERS = [
    {"username": "operator.sharma", "name": "V. Sharma", "role": "OPERATOR", "station": "station_bharati"},
    {"username": "engineer.deshmukh", "name": "A. Deshmukh", "role": "ENGINEER", "station": "station_bharati"},
    {"username": "commander.nair", "name": "Col. R. Nair", "role": "SUPERVISOR", "station": "station_bharati"},
    {"username": "analyst.patel", "name": "Dr. K. Patel", "role": "ANALYST", "station": "station_maitri"},
    {"username": "admin.ncpor", "name": "NCPOR Mission Control Admin", "role": "ADMIN", "station": "GLOBAL"}
]

class LoginPayload(BaseModel):
    username: str
    password: Optional[str] = None

@router.get("/roles")
def get_roles():
    """Retrieve RBAC role capabilities and hierarchy."""
    return ROLES_DEFINITION

@router.get("/users")
def list_available_demo_users():
    """List preset duty personnel for instant role switching."""
    return DEFAULT_USERS

@router.post("/login")
def login(payload: LoginPayload):
    """Authenticate and issue session context."""
    user = next((u for u in DEFAULT_USERS if u["username"] == payload.username), None)
    if not user:
        # Default to Operator role for unknown demo usernames
        user = {"username": payload.username, "name": payload.username.capitalize(), "role": "OPERATOR", "station": "station_bharati"}

    role_info = ROLES_DEFINITION.get(user["role"], ROLES_DEFINITION["OPERATOR"])
    return {
        "authenticated": True,
        "token": f"polar_twin_token_{user['username']}",
        "user": user,
        "role_definition": role_info
    }
