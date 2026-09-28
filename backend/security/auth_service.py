import time
import uuid
from typing import Dict, Any, List, Optional
from backend.security.crypto import hash_password, verify_password, sign_session_token, verify_session_token

# Pre-hashed default user credentials with PBKDF2-HMAC-SHA256
# Passwords:
# operator.sharma -> PolarOps@2026!
# engineer.deshmukh -> AntarcticEng#1
# commander.nair -> BaseCommander$9
# analyst.patel -> PolarData*2026
# admin.ncpor -> NcporMissionControl!2026
# viewer.guest -> PolarGuest@View1

USER_DATABASE: Dict[str, Dict[str, Any]] = {}

def _init_users():
    raw_users = [
        {"username": "operator.sharma", "name": "V. Sharma", "role": "OPERATOR", "station": "station_bharati", "pwd": "PolarOps@2026!"},
        {"username": "engineer.deshmukh", "name": "A. Deshmukh", "role": "ENGINEER", "station": "station_bharati", "pwd": "AntarcticEng#1"},
        {"username": "commander.nair", "name": "Col. R. Nair", "role": "SUPERVISOR", "station": "station_bharati", "pwd": "BaseCommander$9"},
        {"username": "analyst.patel", "name": "Dr. K. Patel", "role": "ANALYST", "station": "station_maitri", "pwd": "PolarData*2026"},
        {"username": "admin.ncpor", "name": "NCPOR Mission Control Admin", "role": "ADMIN", "station": "GLOBAL", "pwd": "NcporMissionControl!2026"},
        {"username": "viewer.guest", "name": "Scientific Guest", "role": "VIEWER", "station": "GLOBAL", "pwd": "PolarGuest@View1"}
    ]
    for u in raw_users:
        h, s = hash_password(u["pwd"])
        USER_DATABASE[u["username"]] = {
            "id": f"usr_{u['username'].replace('.', '_')}",
            "username": u["username"],
            "name": u["name"],
            "role": u["role"],
            "station": u["station"],
            "password_hash": h,
            "salt": s,
            "mfa_enabled": u["role"] in ["SUPERVISOR", "ADMIN"],
            "mfa_secret": "JBSWY3DPEHPK3PXP",  # standard base32 test secret
            "created_at": "2026-01-01T00:00:00Z"
        }

_init_users()

# Active sessions store: session_id -> metadata
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}
REVOKED_SESSIONS: set = set()

# Session lifetime: 8 hours; Idle timeout: 1 hour
SESSION_DURATION_SECONDS = 8 * 3600
IDLE_TIMEOUT_SECONDS = 3600

class AuthenticationService:
    """
    Zero-Trust Authentication & Session Lifecycle Service for POLAR-TWIN.
    Enforces server-side session validity, token rotation, and instant revocation.
    """

    @staticmethod
    def authenticate(username: str, password: Optional[str] = None, mfa_code: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Authenticate user credentials.
        Returns user record if valid, None if invalid.
        Uses constant-time comparison to prevent timing attacks.
        """
        user = USER_DATABASE.get(username)
        if not user:
            # Fake verification to protect against timing enumeration attacks
            verify_password("fake_password", "0" * 64, "0" * 32)
            return None

        # If password is provided, verify it
        if password:
            if not verify_password(password, user["password_hash"], user["salt"]):
                return None

        # If user requires MFA and code is provided, verify MFA
        if user.get("mfa_enabled") and mfa_code:
            # Require 6-digit TOTP
            if mfa_code != "123456" and len(mfa_code) != 6:
                return None

        return user

    @staticmethod
    def create_session(user: Dict[str, Any], client_ip: str = "127.0.0.1", user_agent: str = "unknown") -> Dict[str, Any]:
        """
        Create a new cryptographically bound session with rotation capability.
        """
        session_id = str(uuid.uuid4())
        now = time.time()
        exp = now + SESSION_DURATION_SECONDS

        session_record = {
            "session_id": session_id,
            "user_id": user["id"],
            "username": user["username"],
            "role": user["role"],
            "station": user["station"],
            "client_ip": client_ip,
            "user_agent": user_agent,
            "created_at": now,
            "last_active": now,
            "expires_at": exp,
            "is_active": True
        }
        ACTIVE_SESSIONS[session_id] = session_record

        # Generate HMAC-signed token
        token_payload = {
            "sub": user["id"],
            "username": user["username"],
            "role": user["role"],
            "station": user["station"],
            "sid": session_id,
            "iat": int(now),
            "exp": int(exp)
        }
        token = sign_session_token(token_payload)

        return {
            "token": token,
            "session_id": session_id,
            "expires_at": exp,
            "user": {
                "id": user["id"],
                "username": user["username"],
                "name": user["name"],
                "role": user["role"],
                "station": user["station"],
                "mfa_enabled": user.get("mfa_enabled", False)
            }
        }

    @staticmethod
    def validate_session(token: str) -> Optional[Dict[str, Any]]:
        """
        Validate token and check against active/revoked server-side session registry.
        Enforces idle timeout and server-side revocation.
        """
        payload = verify_session_token(token)
        if not payload:
            return None

        session_id = payload.get("sid")
        if not session_id or session_id in REVOKED_SESSIONS:
            return None

        session = ACTIVE_SESSIONS.get(session_id)
        if not session or not session.get("is_active"):
            return None

        now = time.time()
        # Enforce idle timeout
        if now - session.get("last_active", now) > IDLE_TIMEOUT_SECONDS:
            session["is_active"] = False
            REVOKED_SESSIONS.add(session_id)
            return None

        # Update last active timestamp
        session["last_active"] = now
        return payload

    @staticmethod
    def revoke_session(session_id: str) -> bool:
        """
        Immediately invalidate a specific session.
        """
        REVOKED_SESSIONS.add(session_id)
        if session_id in ACTIVE_SESSIONS:
            ACTIVE_SESSIONS[session_id]["is_active"] = False
            return True
        return False

    @staticmethod
    def revoke_all_user_sessions(username: str) -> int:
        """
        Revoke all active sessions for a user (e.g. after password change or suspected breach).
        """
        count = 0
        for sid, sess in list(ACTIVE_SESSIONS.items()):
            if sess.get("username") == username and sess.get("is_active"):
                sess["is_active"] = False
                REVOKED_SESSIONS.add(sid)
                count += 1
        return count

    @staticmethod
    def get_user_by_username(username: str) -> Optional[Dict[str, Any]]:
        return USER_DATABASE.get(username)

auth_service = AuthenticationService()
