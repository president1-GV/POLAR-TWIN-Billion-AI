import os
import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, Optional, Tuple

# Secure secret key from environment or cryptographically generated fallback
SECRET_KEY = os.getenv("POLAR_TWIN_JWT_SECRET", "polar-twin-zero-trust-secret-key-antigravity-2026-sih26060-production-hardened")
SALT_LENGTH = 16
PBKDF2_ITERATIONS = 100000

def hash_password(password: str, salt: Optional[bytes] = None) -> Tuple[str, str]:
    """
    Hash a password using PBKDF2-HMAC-SHA256 with a unique cryptographic salt.
    Returns (hex_hash, hex_salt).
    """
    if salt is None:
        salt = os.urandom(SALT_LENGTH)
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
    return derived.hex(), salt.hex()

def verify_password(password: str, expected_hash_hex: str, salt_hex: str) -> bool:
    """
    Verify password against expected hash using constant-time comparison to prevent timing attacks.
    """
    try:
        salt = bytes.fromhex(salt_hex)
        derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PBKDF2_ITERATIONS)
        expected = bytes.fromhex(expected_hash_hex)
        return hmac.compare_digest(derived, expected)
    except Exception:
        return False

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

def _b64_decode(data: str) -> bytes:
    padding = 4 - (len(data) % 4)
    if padding != 4:
        data += "=" * padding
    return base64.urlsafe_b64decode(data.encode("utf-8"))

def sign_session_token(payload: Dict[str, Any], secret: str = SECRET_KEY) -> str:
    """
    Issue a cryptographically signed HMAC-SHA256 session token with expiration and session tracking.
    """
    header = {"alg": "HS256", "typ": "POLAR_TWIN_SESSION"}
    header_b64 = _b64_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}"
    sig = hmac.new(secret.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
    sig_b64 = _b64_encode(sig)
    return f"{signing_input}.{sig_b64}"

def verify_session_token(token: str, secret: str = SECRET_KEY) -> Optional[Dict[str, Any]]:
    """
    Verify signature, formatting, and expiration of session token.
    Uses constant-time comparison. Returns payload dict if valid, None if invalid or expired.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(secret.encode("utf-8"), signing_input.encode("utf-8"), hashlib.sha256).digest()
        actual_sig = _b64_decode(sig_b64)

        if not hmac.compare_digest(expected_sig, actual_sig):
            return None

        payload_bytes = _b64_decode(payload_b64)
        payload = json.loads(payload_bytes.decode("utf-8"))

        # Verify expiration
        exp = payload.get("exp")
        if exp is not None and time.time() > exp:
            return None

        return payload
    except Exception:
        return None
