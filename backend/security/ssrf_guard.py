import ipaddress
import socket
import urllib.parse
from typing import Tuple

BLOCKED_NETWORKS = [
    ipaddress.ip_network("127.0.0.0/8"),       # Loopback
    ipaddress.ip_network("10.0.0.0/8"),        # Private RFC1918
    ipaddress.ip_network("172.16.0.0/12"),     # Private RFC1918
    ipaddress.ip_network("192.168.0.0/16"),    # Private RFC1918
    ipaddress.ip_network("169.254.0.0/16"),    # Link-local / Cloud Metadata (169.254.169.254)
    ipaddress.ip_network("224.0.0.0/4"),       # Multicast
    ipaddress.ip_network("240.0.0.0/4"),       # Reserved
    ipaddress.ip_network("::1/128"),           # IPv6 Loopback
    ipaddress.ip_network("fc00::/7"),          # IPv6 Unique Local
    ipaddress.ip_network("fe80::/10"),         # IPv6 Link Local
]

class SSRFSecurityError(ValueError):
    pass

def validate_outbound_url(url: str) -> Tuple[bool, str]:
    """
    Validate that a URL is safe to fetch and does not target internal infrastructure,
    loopback addresses, or cloud metadata endpoints.
    Returns (is_safe, error_reason).
    """
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme.lower() not in ["http", "https"]:
            return False, f"Prohibited URL scheme '{parsed.scheme}'. Only http and https allowed."

        hostname = parsed.hostname
        if not hostname:
            return False, "Missing hostname in URL."

        # Reject direct metadata or localhost names
        lower_host = hostname.lower()
        if lower_host in ["localhost", "127.0.0.1", "::1", "metadata.google.internal"]:
            return False, f"Host '{hostname}' resolves to restricted internal loopback or metadata."

        # Resolve IP addresses
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
        for family, socktype, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)

            for net in BLOCKED_NETWORKS:
                if ip_obj in net:
                    return False, f"Destination IP {ip_str} falls within prohibited internal network {net}."

        return True, ""
    except Exception as e:
        return False, f"SSRF resolution failed: {e}"

def assert_safe_url(url: str):
    """Raise SSRFSecurityError if URL is unsafe."""
    is_safe, reason = validate_outbound_url(url)
    if not is_safe:
        raise SSRFSecurityError(f"SSRF Protection blocked request to {url}: {reason}")
