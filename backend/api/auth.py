from fastapi import APIRouter, HTTPException, Depends, Request, Header, status
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field, ConfigDict
from backend.security.auth_service import auth_service, USER_DATABASE, ACTIVE_SESSIONS
from backend.security.rbac import (
    get_current_user,
    require_permission,
    PERMISSIONS_MAP
)
from backend.security.rate_limiter import check_login_rate_limit, rate_limiter
from backend.security.audit_service import security_audit_logger

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])

class LoginPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    username: str = Field(..., min_length=3, max_length=64)
    password: Optional[str] = Field(None, max_length=128)
    mfa_code: Optional[str] = Field(None, max_length=16)

class SessionRevocationPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    session_id: str

class ImpersonatePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")
    target_username: str = Field(..., min_length=3, max_length=64)

@router.get("/roles")
def get_roles():
    """Retrieve RBAC role capabilities and hierarchy."""
    return {
        role: {
            "title": role.capitalize(),
            "permissions": perms
        }
        for role, perms in PERMISSIONS_MAP.items()
    }

@router.get("/users")
def list_available_demo_users():
    """List preset duty personnel for operator reference (passwords redacted)."""
    return [
        {
            "username": u["username"],
            "name": u["name"],
            "role": u["role"],
            "station": u["station"],
            "mfa_enabled": u.get("mfa_enabled", False)
        }
        for u in USER_DATABASE.values()
    ]

@router.post("/login", dependencies=[Depends(check_login_rate_limit)])
def login(payload: LoginPayload, request: Request):
    """
    Authenticate user and issue cryptographically signed session token.
    Protected by sliding-window rate limiting against brute-force credential stuffing.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "unknown")

    user = auth_service.authenticate(
        username=payload.username,
        password=payload.password,
        mfa_code=payload.mfa_code
    )

    if not user:
        # Rate limit failure counter
        is_locked, lockout_sec = rate_limiter.record_failed_login(client_ip)
        security_audit_logger.log_event(
            action="LOGIN_FAILURE",
            actor_id=payload.username,
            client_ip=client_ip,
            status="FAILURE",
            details={"reason": "Invalid credentials", "lockout_sec": lockout_sec}
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Reset failure counters
    rate_limiter.record_successful_login(client_ip)

    # Issue session & signed token
    session_ctx = auth_service.create_session(
        user=user,
        client_ip=client_ip,
        user_agent=user_agent
    )

    security_audit_logger.log_event(
        action="LOGIN_SUCCESS",
        actor_id=user["username"],
        role=user["role"],
        station_id=user["station"],
        client_ip=client_ip,
        status="SUCCESS",
        details={"session_id": session_ctx["session_id"]}
    )

    return {
        "authenticated": True,
        "token": session_ctx["token"],
        "session_id": session_ctx["session_id"],
        "expires_at": session_ctx["expires_at"],
        "user": session_ctx["user"],
        "role_definition": {
            "role": user["role"],
            "permissions": PERMISSIONS_MAP.get(user["role"], [])
        }
    }

@router.get("/me")
def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve verified profile of the active session with operational authority and scopes."""
    from backend.security.rbac import normalize_role
    return {
        "user_id": current_user.get("sub"),
        "username": current_user.get("username"),
        "role": current_user.get("role"),
        "canonical_role": current_user.get("canonical_role", normalize_role(current_user.get("role"))),
        "station": current_user.get("station"),
        "station_scope": current_user.get("station_scope", [current_user.get("station", "station_bharati")]),
        "domain_scope": current_user.get("domain_scope", []),
        "operational_authority": current_user.get("operational_authority", "OBSERVATION_ONLY"),
        "is_impersonating": current_user.get("is_impersonating", False),
        "impersonated_by": current_user.get("impersonated_by"),
        "session_id": current_user.get("sid"),
        "expires_at": current_user.get("exp")
    }

@router.post("/logout")
def logout(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Invalidate active session server-side.
    Revokes token immediately from future requests.
    """
    sid = current_user.get("sid")
    if sid:
        auth_service.revoke_session(sid)
        security_audit_logger.log_event(
            action="LOGOUT",
            actor_id=current_user.get("username", "unknown"),
            role=current_user.get("role", "UNKNOWN"),
            station_id=current_user.get("station"),
            details={"session_id": sid}
        )

    return {"status": "REVOKED", "message": "Session invalidated successfully"}

@router.post("/revoke-all")
def revoke_all_sessions(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Emergency session revocation: invalidates all active sessions for the current user.
    """
    username = current_user.get("username", "")
    revoked_count = auth_service.revoke_all_user_sessions(username)

    security_audit_logger.log_event(
        action="ALL_SESSIONS_REVOKED",
        actor_id=username,
        role=current_user.get("role", "UNKNOWN"),
        details={"revoked_count": revoked_count}
    )

    return {
        "status": "ALL_REVOKED",
        "revoked_count": revoked_count,
        "message": f"All active sessions for {username} have been invalidated."
    }

@router.get("/active-sessions")
def list_active_sessions(current_user: Dict[str, Any] = Depends(require_permission("security_admin"))):
    """
    Administrative inspection of all active server-managed sessions.
    Strictly requires ADMIN role (platform governance).
    """
    return [
        {
            "session_id": sid,
            "username": s.get("username"),
            "role": s.get("role"),
            "station": s.get("station"),
            "client_ip": s.get("client_ip"),
            "created_at": s.get("created_at"),
            "last_active": s.get("last_active"),
            "is_active": s.get("is_active"),
            "is_impersonating": s.get("is_impersonating", False),
            "impersonated_by": s.get("impersonated_by")
        }
        for sid, s in ACTIVE_SESSIONS.items()
        if s.get("is_active")
    ]

@router.post("/impersonate")
def impersonate(
    payload: ImpersonatePayload,
    request: Request,
    current_user: Dict[str, Any] = Depends(require_permission("impersonate_user"))
):
    """
    Administrative role impersonation (ADMIN ONLY).
    Allows an administrator to inspect and operate the platform through another role's lens
    with persistent audit logging and visible impersonation indicators.
    """
    admin_username = current_user.get("username", "admin.ncpor")
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "unknown")

    session_ctx = auth_service.impersonate_user(
        admin_username=admin_username,
        target_username=payload.target_username,
        client_ip=client_ip,
        user_agent=user_agent
    )
    if not session_ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target identity '{payload.target_username}' not found or cannot be impersonated."
        )
    return session_ctx

@router.post("/stop-impersonate")
def stop_impersonate(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Stop active impersonation and revert to authenticated administrator identity.
    """
    sid = current_user.get("sid")
    is_imp = current_user.get("is_impersonating", False)
    if not is_imp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current session is not an active impersonation session."
        )

    client_ip = request.client.host if request.client else "127.0.0.1"
    admin_session_ctx = auth_service.stop_impersonating(sid, client_ip=client_ip)
    if not admin_session_ctx:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restore administrator session."
        )
    return admin_session_ctx
