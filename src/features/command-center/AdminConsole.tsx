// ============================================================================
// POLAR-TWIN: Platform Administration Console
// Operational Authority: PLATFORM_GOVERNANCE (Level 5 Platform Admin Clearance)
// Header: POLAR-TWIN PLATFORM ADMINISTRATION
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  Unlock, 
  Activity, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  LogOut, 
  Search, 
  Eye, 
  Terminal,
  Database,
  Radio
} from 'lucide-react';
import { api, ROLE_CREDENTIALS } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { CommandButton } from '../../components/ui/CommandButton';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const AdminConsole: React.FC<Props> = ({
  currentStationId = 'station_bharati',
  onNavigate,
  onSelectStation
}) => {
  const { user, operationalAuthority, stationScope, impersonate, stopImpersonating, isImpersonating } = useAuth();
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [impersonateTarget, setImpersonateTarget] = useState<string>('operator.sharma');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'warn'; msg: string } | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [sessions, logs] = await Promise.all([
        api.getActiveSessions().catch(() => []),
        api.getAuditLogs().catch(() => [])
      ]);
      setActiveSessions(sessions);
      setAuditLogs(logs);
      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartImpersonation = async (targetUser: string) => {
    try {
      const ok = await impersonate(targetUser);
      if (ok) {
        setFeedback({ type: 'success', msg: `Active session now impersonating identity: ${targetUser}` });
      } else {
        setFeedback({ type: 'warn', msg: `Failed to impersonate ${targetUser}` });
      }
    } catch (e) {
      setFeedback({ type: 'warn', msg: `Impersonation error: ${e}` });
    }
  };

  const handleRevokeAllSessions = async () => {
    try {
      await api.revokeAllSessions();
      setFeedback({ type: 'success', msg: 'All active sessions across platform invalidated.' });
      await loadData();
    } catch (e) {
      setFeedback({ type: 'warn', msg: 'Failed to revoke sessions.' });
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* 1. HERO BAR: POLAR-TWIN PLATFORM ADMINISTRATION */}
      <section className="bg-polar-card border border-rose-500/40 rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-rose-500/60 shadow-xl ring-4 ring-rose-500/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-rose-400 font-bold uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span>POLAR-TWIN • PLATFORM GOVERNANCE & SECURITY</span>
                <span className="text-polar-border">|</span>
                <span className="bg-rose-500/10 text-rose-300 px-2 py-0.5 rounded border border-rose-500/30">
                  AUTHORITY: {operationalAuthority}
                </span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-muted">SCOPE: PLATFORM-WIDE (ALL STATIONS)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-polar-text-primary tracking-tight font-mono">
                POLAR-TWIN PLATFORM ADMINISTRATION
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Platform governance, identity & access control (RBAC), security audit registry, and authorized role impersonation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Activity}
              onClick={() => onNavigate('analytics')}
            >
              Security Telemetry
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={LogOut}
              onClick={handleRevokeAllSessions}
            >
              Emergency Revoke All
            </CommandButton>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Administrator:</span>
            <span className="text-rose-400 font-bold truncate">{user?.display_name || 'NCPOR Mission Control Admin'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Backend Host:</span>
            <span className="text-emerald-400 font-bold truncate">Supabase Cloud</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Security Posture:</span>
            <span className="text-emerald-400 font-bold truncate">Zero-Trust Active</span>
          </div>
        </div>
      </section>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-3 rounded font-mono text-xs flex items-center justify-between border ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' 
            : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
        }`}>
          <span>{feedback.msg}</span>
          <button onClick={() => setFeedback(null)} className="text-[10px] uppercase font-bold underline">Dismiss</button>
        </div>
      )}

      {/* 2. ADMIN IMPERSONATION & ROLE GOVERNANCE WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono">
        {/* Role Impersonation Control Panel */}
        <div className="bg-polar-card border border-rose-500/30 rounded-md p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Authorized Role Impersonation
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 font-bold">
              ADMIN-ONLY
            </span>
          </div>

          <p className="text-xs text-polar-text-secondary mb-4 leading-relaxed">
            Allows administrators to inspect and verify operational permissions through any assigned personnel identity with full immutable audit tracking.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-polar-text-muted text-[11px] block mb-1">TARGET IDENTITY TO IMPERSONATE:</label>
              <select
                value={impersonateTarget}
                onChange={(e) => setImpersonateTarget(e.target.value)}
                className="w-full bg-polar-base border border-polar-border rounded px-3 py-2 text-polar-text-primary focus:border-rose-400 outline-none"
              >
                <option value="operator.sharma">operator.sharma (Duty Operator • Bharati)</option>
                <option value="engineer.deshmukh">engineer.deshmukh (Base Engineer • Bharati)</option>
                <option value="commander.nair">commander.nair (Expedition Commander • Bharati)</option>
                <option value="controller.raman">controller.raman (Flight Controller • Global)</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleStartImpersonation(impersonateTarget)}
                className="flex-1 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
              >
                START IMPERSONATION
              </button>
              {isImpersonating && (
                <button
                  onClick={() => stopImpersonating()}
                  className="py-2.5 px-4 rounded bg-polar-elevated hover:bg-polar-base text-polar-text-primary font-bold text-xs uppercase tracking-wider border border-polar-border transition-all"
                >
                  STOP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Active Sessions Inspection */}
        <div className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Server-Managed Sessions Registry
              </h2>
            </div>
            <button onClick={loadData} className="text-[10px] text-cyan-400 hover:underline">
              REFRESH ({activeSessions.length})
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
            {activeSessions.length === 0 ? (
              <p className="text-polar-text-muted text-center py-6">No other active sessions detected.</p>
            ) : (
              activeSessions.map((s, idx) => (
                <div key={idx} className="p-2.5 rounded bg-polar-base border border-polar-border flex items-center justify-between">
                  <div>
                    <span className="font-bold text-polar-text-primary">{s.username}</span>
                    <span className="text-[10px] text-polar-text-muted ml-2">[{s.role}]</span>
                    {s.is_impersonating && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        IMPERSONATED
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-polar-text-muted font-mono">{s.client_ip || '127.0.0.1'}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. SECURITY & FORENSIC AUDIT STREAM */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 font-mono shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-border">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
              Forensic Security Audit Stream (Supabase audit_logs)
            </h2>
          </div>
          <button
            onClick={() => onNavigate('analytics')}
            className="text-xs text-cyan-400 hover:underline"
          >
            OPEN AUDIT EXPLORER
          </button>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 text-xs">
          {auditLogs.slice(0, 8).map((log, i) => (
            <div key={i} className="p-2 rounded bg-polar-base border border-polar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className="font-bold text-polar-text-primary">{log.action}</span>
                <span className="text-[10px] text-polar-text-muted">by {log.user_id || log.actor_id}</span>
              </div>
              <span className="text-[10px] text-polar-text-muted">{log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
