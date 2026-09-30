from fastapi import Depends, HTTPException, Header, status
from typing import Dict, Any, List, Optional, Set
from backend.security.auth_service import auth_service
from backend.security.audit_service import security_audit_logger

# ============================================================================
# POLAR-TWIN: International-Grade Operational Role & Authority Matrix
# System: Antarctic Operational Digital Twin & Remote Command Platform
# Standard: Zero-Trust Defense-in-Depth, Operational Authority != Platform Admin
# ============================================================================

CANONICAL_ROLES = [
    "DUTY_OPERATOR",
    "BASE_ENGINEER",
    "EXPEDITION_CMDR",
    "MISSION_CONTROL",
    "ADMIN"
]

# Legacy and semantic role normalization
ROLE_ALIASES: Dict[str, str] = {
    "OPERATOR": "DUTY_OPERATOR",
    "DUTY_OPERATOR": "DUTY_OPERATOR",
    "STATION_OPERATOR": "DUTY_OPERATOR",
    "ENGINEER": "BASE_ENGINEER",
    "BASE_ENGINEER": "BASE_ENGINEER",
    "COMMANDER": "EXPEDITION_CMDR",
    "SUPERVISOR": "EXPEDITION_CMDR",
    "EXPEDITION_CMDR": "EXPEDITION_CMDR",
    "STATION_COMMANDER": "EXPEDITION_CMDR",
    "MISSION_CONTROL": "MISSION_CONTROL",
    "FLIGHT_CONTROLLER": "MISSION_CONTROL",
    "ADMIN": "ADMIN",
    "ROOT": "ADMIN",
    "ANALYST": "ANALYST",
    "VIEWER": "VIEWER",
}

def normalize_role(role_name: Optional[str]) -> str:
    """Normalize input role string to canonical operational role."""
    if not role_name:
        return "VIEWER"
    upper = role_name.upper().strip()
    return ROLE_ALIASES.get(upper, upper)

# Operational Authority Classification
OPERATIONAL_AUTHORITIES = {
    "DUTY_OPERATOR": "STATION_OPS",
    "BASE_ENGINEER": "TECHNICAL_OPS",
    "EXPEDITION_CMDR": "MISSION_OPS",
    "MISSION_CONTROL": "CROSS_STATION_OPS",
    "ADMIN": "PLATFORM_GOVERNANCE",
    "ANALYST": "SCIENCE_OPS",
    "VIEWER": "OBSERVATION_ONLY"
}

# Domain Scopes
DOMAIN_SCOPES = {
    "DUTY_OPERATOR": [
        "INFRASTRUCTURE", "ENERGY", "LOGISTICS", "ENVIRONMENT", "TELEMETRY", "MAINTENANCE", "SIMULATION"
    ],
    "BASE_ENGINEER": [
        "INFRASTRUCTURE", "ENERGY", "LOGISTICS", "ENVIRONMENT", "TELEMETRY", "MAINTENANCE", "SIMULATION"
    ],
    "EXPEDITION_CMDR": [
        "INFRASTRUCTURE", "ENERGY", "LOGISTICS", "ENVIRONMENT", "TELEMETRY", "MAINTENANCE", "SIMULATION", "MISSION", "PERSONNEL"
    ],
    "MISSION_CONTROL": [
        "INFRASTRUCTURE", "ENERGY", "LOGISTICS", "ENVIRONMENT", "TELEMETRY", "MAINTENANCE", "SIMULATION", "AUTOMATION", "MISSION", "AUDIT"
    ],
    "ADMIN": [
        "INFRASTRUCTURE", "ENERGY", "LOGISTICS", "ENVIRONMENT", "TELEMETRY", "MAINTENANCE", "SIMULATION", "AUTOMATION", "MISSION", "PERSONNEL", "AUDIT", "SYSTEM", "SECURITY"
    ],
    "ANALYST": [
        "INFRASTRUCTURE", "ENERGY", "ENVIRONMENT", "TELEMETRY", "SIMULATION"
    ],
    "VIEWER": [
        "INFRASTRUCTURE", "ENVIRONMENT", "TELEMETRY"
    ]
}

# Action Risk Classification
ACTION_RISK_LEVELS: Dict[str, str] = {
    "view_stations": "LOW",
    "view_telemetry": "LOW",
    "view_3d": "LOW",
    "view_weather": "LOW",
    "view_inventory": "LOW",
    "view_analytics": "LOW",
    "view_forecasts": "LOW",
    "export_reports": "LOW",
    "acknowledge_alerts": "LOW",
    "create_maintenance": "MEDIUM",
    "inject_telemetry": "MEDIUM",
    "diagnose_assets": "MEDIUM",
    "run_simulations": "MEDIUM",
    "toggle_edge_link": "MEDIUM",
    "trigger_edge_sync": "MEDIUM",
    "review_mitigations": "MEDIUM",
    "approve_mitigations": "HIGH",
    "approve_logistics_rationing": "HIGH",
    "escalate_incidents": "HIGH",
    "emergency_protocols": "CRITICAL",
    "execute_critical_automation": "CRITICAL",
    "tune_microgrid": "HIGH",
    "resolve_engineering_alerts": "MEDIUM",
    "user_admin": "CRITICAL",
    "security_admin": "CRITICAL",
    "role_admin": "CRITICAL",
    "impersonate_user": "CRITICAL",
    "platform_config": "CRITICAL"
}

# Explicit Granular Permissions Matrix
PERMISSIONS_MAP: Dict[str, List[str]] = {
    "VIEWER": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory"
    ],
    "ANALYST": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "view_analytics", "view_forecasts", "run_simulations", "export_reports"
    ],
    "DUTY_OPERATOR": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "acknowledge_alerts", "run_simulations", "review_mitigations", "approve_mitigations",
        "toggle_edge_link", "trigger_edge_sync", "submit_operational_report"
    ],
    "BASE_ENGINEER": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "acknowledge_alerts", "run_simulations", "review_mitigations", "inject_telemetry",
        "diagnose_assets", "view_model_parameters", "toggle_edge_link", "trigger_edge_sync",
        "create_maintenance", "tune_microgrid", "resolve_engineering_alerts"
    ],
    "EXPEDITION_CMDR": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "acknowledge_alerts", "resolve_alerts", "escalate_incidents", "run_simulations",
        "review_mitigations", "approve_mitigations", "emergency_protocols",
        "approve_logistics_rationing", "view_mission_roster", "view_personnel",
        "toggle_edge_link", "trigger_edge_sync"
    ],
    "MISSION_CONTROL": [
        "view_stations", "view_telemetry", "view_3d", "view_weather", "view_inventory",
        "view_cross_station", "cross_station_compare", "acknowledge_alerts", "resolve_alerts",
        "coordinate_incidents", "run_simulations", "review_mitigations", "approve_mitigations",
        "toggle_edge_link", "trigger_edge_sync", "view_operational_audit", "view_security_events",
        "view_analytics", "view_forecasts", "export_reports"
    ],
    "ADMIN": [
        "*"
    ]
}

# Cross-reference legacy alias mapping for seamless compatibility
PERMISSIONS_MAP["OPERATOR"] = PERMISSIONS_MAP["DUTY_OPERATOR"]
PERMISSIONS_MAP["ENGINEER"] = PERMISSIONS_MAP["BASE_ENGINEER"]
PERMISSIONS_MAP["COMMANDER"] = PERMISSIONS_MAP["EXPEDITION_CMDR"]
PERMISSIONS_MAP["SUPERVISOR"] = PERMISSIONS_MAP["EXPEDITION_CMDR"]

def has_permission(user_role: str, permission: str) -> bool:
    """
    Check if role grants specific permission.
    Strictly denies platform administration permissions (user_admin, security_admin, role_admin, platform_config)
    to non-ADMIN roles, ensuring operational commanders cannot modify platform governance.
    """
    canonical = normalize_role(user_role)
    perms = PERMISSIONS_MAP.get(canonical, PERMISSIONS_MAP.get(user_role, []))
    
    # Platform governance actions are strictly reserved for ADMIN
    admin_only_permissions = {"user_admin", "security_admin", "role_admin", "platform_config", "impersonate_user"}
    if permission in admin_only_permissions:
        return canonical == "ADMIN" or user_role == "ADMIN"

    if "*" in perms:
        return True
    return permission in perms

def has_domain_access(user_role: str, domain: str) -> bool:
    """Check if role grants access to specific operational domain."""
    canonical = normalize_role(user_role)
    allowed = DOMAIN_SCOPES.get(canonical, [])
    return domain.upper() in allowed

def check_station_scope(user: Dict[str, Any], target_station_id: str) -> bool:
    """
    Attribute-Based Access Control (ABAC) / BOLA defense:
    Validates whether the authenticated user is authorized to operate on the target station.
    - ADMIN and MISSION_CONTROL have cross-station scope (Maitri + Bharati).
    - Station-scoped operators/engineers/commanders can only access their designated station.
    """
    canonical_role = normalize_role(user.get("role", ""))
    
    # Platform Admin and Mission Control have cross-station authority
    if canonical_role in ["ADMIN", "MISSION_CONTROL"]:
        return True

    # Check explicit station_scope list if present on session
    user_scope = user.get("station_scope")
    if isinstance(user_scope, list) and target_station_id in user_scope:
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

def get_current_user_optional(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and verify session token if present.
    If no authorization header is provided, returns a default read-only VIEWER context.
    If an authorization header is provided, it must be valid or 401 is raised.
    """
    if not authorization:
        return {
            "sub": "usr_viewer_guest",
            "username": "viewer.guest",
            "role": "VIEWER",
            "canonical_role": "VIEWER",
            "station": "GLOBAL",
            "station_scope": ["station_bharati", "station_maitri"],
            "domain_scope": DOMAIN_SCOPES.get("VIEWER", []),
            "operational_authority": "OBSERVATION_ONLY",
            "is_impersonating": False
        }
    return get_current_user(authorization)

def require_permission(perm: str):
    """
    Dependency factory checking role permissions server-side.
    Audits unauthorized attempts and raises 403 Forbidden.
    """
    def _dependency(user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        role = user.get("role", "VIEWER")
        if not has_permission(role, perm):
            security_audit_logger.log_event(
                action="PERMISSION_DENIED",
                actor_id=user.get("username", "unknown"),
                role=role,
                station_id=user.get("station", "GLOBAL"),
                status="DENIED",
                details={"requested_permission": perm, "assigned_role": role}
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: permission '{perm}' required for role '{role}'"
            )
        return user
    return _dependency

def require_station_access(target_station_id: str, user: Dict[str, Any]):
    """
    BOLA/IDOR Guard: Raises 403 and records security audit event if user lacks access to target station.
    """
    if not check_station_scope(user, target_station_id):
        security_audit_logger.log_event(
            action="BOLA_STATION_SCOPE_VIOLATION",
            actor_id=user.get("username", "unknown"),
            role=user.get("role", "UNKNOWN"),
            station_id=user.get("station", "GLOBAL"),
            status="BLOCKED",
            details={
                "attempted_station_id": target_station_id,
                "assigned_station": user.get("station"),
                "reason": "Cross-station unauthorized manipulation attempted"
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: user from '{user.get('station')}' not authorized for target station '{target_station_id}'"
        )

def verify_two_person_control(
    initiator_username: str,
    approver_username: str,
    action_name: str,
    station_id: str = "GLOBAL"
) -> bool:
    """
    Enforce Two-Person Control (4-Eyes Principle) for CRITICAL operational actions.
    Initiator and Approver must be distinct verified identities.
    Approver must possess EXPEDITION_CMDR, MISSION_CONTROL, or ADMIN authority.
    """
    if not initiator_username or not approver_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Two-person control requires distinct initiator and approver identities."
        )

    if initiator_username.lower().strip() == approver_username.lower().strip():
        security_audit_logger.log_event(
            action="TWO_PERSON_RULE_SELF_APPROVAL_BLOCKED",
            actor_id=initiator_username,
            station_id=station_id,
            status="BLOCKED",
            details={"action": action_name, "error": "Initiator cannot self-approve critical action"}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Two-person control violation: Initiator cannot self-approve safety-critical action."
        )

    approver = auth_service.get_user_by_username(approver_username)
    if not approver:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approving officer '{approver_username}' not found in personnel registry."
        )

    approver_canonical = normalize_role(approver.get("role"))
    if approver_canonical not in ["EXPEDITION_CMDR", "MISSION_CONTROL", "ADMIN"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Approver '{approver_username}' lacks required authority level (requires EXPEDITION_CMDR, MISSION_CONTROL, or ADMIN)."
        )

    # Validated two-person control
    security_audit_logger.log_event(
        action="TWO_PERSON_CONTROL_VERIFIED",
        actor_id=initiator_username,
        role="VERIFIED",
        station_id=station_id,
        status="APPROVED",
        details={
            "action": action_name,
            "initiator": initiator_username,
            "approver": approver_username,
            "approver_role": approver_canonical
        }
    )
    return True
