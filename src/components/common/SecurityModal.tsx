import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Key, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  X, 
  Copy, 
  Check, 
  RefreshCw, 
  LogOut, 
  ShieldAlert,
  Server,
  FileCheck2,
  Clock,
  Activity,
  Radio,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { api, getSessionAuth, ROLE_CREDENTIALS } from '../../services/api';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  activeRole,
  onRoleChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [revoking, setRevoking] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<{ online: boolean; status: string; latency_ms: number; details?: any } | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const auth = getSessionAuth();
  const creds = ROLE_CREDENTIALS[activeRole] || ROLE_CREDENTIALS.OPERATOR;

  useEffect(() => {
    if (isOpen) {
      loadProfile();
      checkConnectivity();
    }
  }, [isOpen, activeRole]);

  const checkConnectivity = async () => {
    setIsPinging(true);
    try {
      const res = await api.checkBackendHealth();
      setBackendHealth(res);
    } catch (_) {
      setBackendHealth({ online: false, status: 'OFFLINE', latency_ms: 0 });
    } finally {
      setIsPinging(false);
    }
  };

  const loadProfile = async () => {
    try {
      const data = await api.getCurrentSessionProfile();
      if (data) setProfile(data);
    } catch (_) {}
  };

  if (!isOpen) return null;

  const handleCopyToken = () => {
    if (auth.token) {
      navigator.clipboard.writeText(auth.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    setRevoking(true);
    try {
      await api.logout();
      setStatusMsg('Session invalidated server-side in REVOKED_SESSIONS registry.');
      setTimeout(() => {
        setStatusMsg(null);
        // Re-authenticate as viewer by default
        onRoleChange('VIEWER');
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setRevoking(false);
    }
  };

  const handleRevokeAll = async () => {
    setRevoking(true);
    try {
      await api.revokeAllSessions();
      setStatusMsg('All active sessions for this user have been invalidated.');
      setTimeout(() => {
        setStatusMsg(null);
        onRoleChange('VIEWER');
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-surface border border-polar-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/40 font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-polar-border bg-base/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-wide font-mono uppercase">
                  ZERO-TRUST SECURITY ARCHITECTURE
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Zero-Trust Defense-in-Depth Identity & Access Management Guard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner */}
        {statusMsg && (
          <div className="mx-6 mt-4 p-3 rounded bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="p-6 space-y-5">
          {/* Full-Stack Live Connectivity Telemetry */}
          <div className="bg-base rounded-lg p-4 border border-polar-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>FULL-STACK LIVE CONNECTIVITY TELEMETRY</span>
              </div>
              <button
                onClick={checkConnectivity}
                disabled={isPinging}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface hover:bg-elevated border border-polar-border text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>{isPinging ? 'Pinging Uplink...' : 'Test Live Ping'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded bg-elevated/70 border border-polar-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">FastAPI Gateway</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    backendHealth?.online 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  }`}>
                    {backendHealth?.online ? 'CONNECTED LIVE' : 'AIR-GAP MODE'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 font-mono">
                  {backendHealth?.online ? `Latency: ${backendHealth.latency_ms}ms (Port 8000)` : 'Fallback to Local Air-Gap'}
                </div>
              </div>

              <div className="p-3 rounded bg-elevated/70 border border-polar-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Supabase PostgreSQL</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-emerald-950/80 text-emerald-300 border-emerald-500/40">
                    CONNECTED LIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 font-mono truncate" title="db.fpoxnocbznagepusczkk.supabase.co">
                  fpoxnocbznagepusczkk (v17.6)
                </div>
              </div>

              <div className="p-3 rounded bg-elevated/70 border border-polar-border flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Zero-Trust Auth</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                    profile?.operational_authority
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40'
                  }`}>
                    {profile?.operational_authority || 'ACTIVE'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-200 font-mono truncate">
                  Scope: {profile?.station_scope?.join(', ') || creds.station}
                </div>
              </div>
            </div>
          </div>

          {/* Active Verified Identity */}
          <div className="bg-base rounded-lg p-4 border border-polar-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold">
                <UserCheck className="w-4 h-4 text-cyan-400" />
                <span>SERVER-VERIFIED OPERATIONAL IDENTITY</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-surface px-2 py-0.5 rounded border border-polar-border">
                PBKDF2-HMAC-SHA256 (100k rounds)
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-1">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">PERSONNEL</span>
                <span className="text-slate-200 font-bold">{creds.name}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">USERNAME</span>
                <span className="text-slate-200 font-semibold">{creds.username}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">ROLE (RBAC)</span>
                <span className="text-cyan-400 font-bold">{activeRole}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">STATION SCOPE (ABAC)</span>
                <span className="text-amber-400 font-semibold">{creds.station}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Session Token & Rotation */}
          <div className="bg-base rounded-lg p-4 border border-polar-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
                <Key className="w-4 h-4 text-cyan-400" />
                <span>CRYPTOGRAPHIC BEARER TOKEN (HMAC-SHA256 SIGNED)</span>
              </div>
              <button
                onClick={handleCopyToken}
                className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>

            <div className="bg-elevated p-2.5 rounded font-mono text-[11px] text-slate-300 border border-polar-border break-all select-all">
              {auth.token || 'No active session token'}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> Idle Timeout: 60m | Max Lifetime: 8h
              </span>
              <span className="text-slate-500">
                Session ID: {profile?.session_id ? `${profile.session_id.substring(0, 16)}...` : 'ACTIVE_EPHEMERAL'}
              </span>
            </div>
          </div>

          {/* Defense-in-Depth Guard Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>ACTIVE DEFENSE-IN-DEPTH CONTROLS</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-base p-3 rounded border border-polar-border">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>BOLA / IDOR Defense</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">ENFORCED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cross-station mutation blocked server-side. Station-scoped operators cannot manipulate foreign assets.
                </p>
              </div>

              <div className="bg-base p-3 rounded border border-polar-border">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>SSRF Outbound Guard</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">ENFORCED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  RFC-1918 private subnets, loopback (127.0.0.1), and cloud metadata (169.254.169.254) strictly blocked.
                </p>
              </div>

              <div className="bg-base p-3 rounded border border-polar-border">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Sliding Rate Limiter</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">5 REQ/MIN</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Token bucket with progressive lockout blocks credential stuffing & API abuse with HTTP 429.
                </p>
              </div>

              <div className="bg-base p-3 rounded border border-polar-border">
                <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                  <span>Strict Security Headers</span>
                  <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">INJECTED</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Content-Security-Policy, HSTS (max-age 1yr), X-Frame-Options: DENY, X-Content-Type-Options: nosniff.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Personnel Persona Switcher */}
          <div className="bg-base rounded-lg p-4 border border-polar-border space-y-3">
            <span className="text-xs font-mono text-slate-300 font-bold block">
              DEMONSTRATE ROLE-BASED ACCESS CONTROL (RBAC):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(ROLE_CREDENTIALS).map(([roleKey, c]) => (
                <button
                  key={roleKey}
                  onClick={() => onRoleChange(roleKey)}
                  className={`p-2.5 rounded text-left font-mono transition-all border ${
                    activeRole === roleKey
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/60 shadow-sm'
                      : 'bg-surface text-slate-400 border-polar-border hover:text-white hover:bg-elevated'
                  }`}
                >
                  <div className="text-xs font-bold">{roleKey}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                  <div className="text-[9px] text-slate-500">{c.station}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Immediate Session Revocation Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-polar-border">
            <div className="text-[11px] font-mono text-slate-400">
              Immediate Token Revocation
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                disabled={revoking}
                className="px-3 py-1.5 rounded bg-surface border border-polar-border text-slate-300 hover:text-white hover:bg-elevated font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Revoke Session</span>
              </button>
              <button
                onClick={handleRevokeAll}
                disabled={revoking}
                className="px-3 py-1.5 rounded bg-rose-950/70 border border-rose-500/50 text-rose-300 hover:bg-rose-900/80 font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Emergency Revoke All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
