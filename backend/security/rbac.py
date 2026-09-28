from fastapi import Depends, HTTPException, Header, status
from typing import Dict, Any, List, Optional
from backend.security.auth_service import auth_service

PERMISSIONS_MAP = {
    "VIEWER": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory"
    ],
    "OPERATOR": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "acknowledge_alerts", "run_simulations", "review_mitigations", "approve_mitigations",
        "toggle_edge_link", "trigger_edge_sync"
    ],
    "ENGINEER": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "acknowledge_alerts", "run_simulations", "review_mitigations", "inject_telemetry",
        "diagnose_assets", "view_model_parameters", "toggle_edge_link", "trigger_edge_sync"
    ],
    "ANALYST": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "view_analytics", "view_forecasts", "run_simulations", "export_reports"
    ],
    "SUPERVISOR": [
        "*"
    ],
    "ADMIN": [
        "*"
    ]
}

def has_permission(user_role: str, permission: str) -> bool:
    """Check if role grants specific permission."""
    perms = PERMISSIONS_MAP.get(user_role, [])
    if "*" in perms:
        return True
    return permission in perms

def check_station_scope(user: Dict[str, Any], target_station_id: str) -> bool:
    """
    Attribute-Based Access Control (ABAC) / BOLA defense:
    Validates whether the user is authorized to operate on the target station.
    Admins, Supervisors, and users with station='GLOBAL' have cross-station scope.
    Station-scoped operators/engineers can only access their designated station.
    """
    user_role = user.get("role", "")
    if user_role in ["ADMIN", "SUPERVISOR"]:
        return True

    user_station = user.get("station", "")
    if user_station == "GLOBAL":
        return True

    return user_station == target_station_id

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency to extract, cryptographically verify, and validate session token.
    Raises 401 Unauthorized if missing, forged, expired, or revoked.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credential required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme; Bearer token required",
            headers={"WWW-Authenticate": "Bearer"}
        )

    session_payload = auth_service.validate_session(token)
    if not session_payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session invalid, expired, or revoked",
            headers={"WWW-Authenticate": "Bearer"}
        )

    return session_payload

def require_permission(perm: str):
    """
    Dependency factory checking role permissions server-side.
    """
    def _dependency(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        role = user.get("role", "VIEWER")
        if not has_permission(role, perm):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: permission '{perm}' required for role '{role}'"
            )
        return user
    return _dependency

def require_station_access(target_station_id: str, user: Dict[str, Any]):
    """
    BOLA/IDOR Guard: Raises 403 if user lacks access to the given station.
    """
    if not check_station_scope(user, target_station_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: user from '{user.get('station')}' not authorized for target station '{target_station_id}'"
        )
