from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware injecting strict defense-in-depth security headers
    into every response across the POLAR-TWIN platform.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # 1. Content Security Policy (CSP)
        # Prevents XSS, code injection, and restricts outbound connections
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: https:",
            "connect-src 'self' https://fpoxnocbznagepusczkk.supabase.co https://api.open-meteo.com",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "base-uri 'self'"
        ]
        response.headers["Content-Security-Policy"] = "; ".join(csp_directives)

        # 2. Clickjacking Defense
        response.headers["X-Frame-Options"] = "DENY"

        # 3. MIME Sniffing Prevention
        response.headers["X-Content-Type-Options"] = "nosniff"

        # 4. Strict Transport Security (HSTS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # 5. Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # 6. Feature / Permissions Policy
        response.headers["Permissions-Policy"] = "geolocation=(), camera=(), microphone=(), payment=(), usb=()"

        # 7. Modern XSS Protection Header
        response.headers["X-XSS-Protection"] = "0"

        # 8. Prevent caching of sensitive operational and API responses
        if request.url.path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"

        return response
