import time
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status

class SlidingWindowRateLimiter:
    """
    In-memory sliding window rate limiter tracking request timestamps per key (IP or user).
    Prevents brute-force credential stuffing and API denial-of-service.
    """
    def __init__(self):
        # key -> list of timestamps
        self.requests: Dict[str, List[float]] = {}
        # Failed login counters: key -> (count, lockout_until)
        self.failed_logins: Dict[str, Tuple[int, float]] = {}

    def is_rate_limited(self, key: str, max_requests: int, window_seconds: int) -> Tuple[bool, int]:
        """
        Check if key has exceeded max_requests in window_seconds.
        Returns (is_limited, retry_after_seconds).
        """
        now = time.time()
        timestamps = self.requests.get(key, [])
        cutoff = now - window_seconds
        # Clean older entries
        timestamps = [t for t in timestamps if t > cutoff]
        self.requests[key] = timestamps

        if len(timestamps) >= max_requests:
            oldest = timestamps[0]
            retry_after = max(1, int(window_seconds - (now - oldest)))
            return True, retry_after

        timestamps.append(now)
        return False, 0

    def record_failed_login(self, key: str, max_failures: int = 5, lockout_seconds: int = 60) -> Tuple[bool, int]:
        """
        Record a failed login attempt for brute-force protection.
        """
        now = time.time()
        count, lockout_until = self.failed_logins.get(key, (0, 0.0))
        if now < lockout_until:
            return True, int(lockout_until - now)

        count += 1
        if count >= max_failures:
            lockout_until = now + lockout_seconds
            self.failed_logins[key] = (0, lockout_until)
            return True, lockout_seconds

        self.failed_logins[key] = (count, 0.0)
        return False, 0

    def record_successful_login(self, key: str):
        """Reset failed login count upon successful authentication."""
        self.failed_logins.pop(key, None)

rate_limiter = SlidingWindowRateLimiter()

def check_login_rate_limit(request: Request):
    """Rate limit dependency for login endpoint (5 requests / 60 seconds)."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    key = f"login:{client_ip}"
    is_limited, retry_after = rate_limiter.is_rate_limited(key, max_requests=5, window_seconds=60)
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please retry later.",
            headers={"Retry-After": str(retry_after)}
        )

def check_simulation_rate_limit(request: Request):
    """Rate limit dependency for heavy what-if simulation runs (15 requests / 60 seconds)."""
    client_ip = request.client.host if request.client else "127.0.0.1"
    key = f"sim:{client_ip}"
    is_limited, retry_after = rate_limiter.is_rate_limited(key, max_requests=15, window_seconds=60)
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Simulation capacity rate limit reached. Please throttle requests.",
            headers={"Retry-After": str(retry_after)}
        )
