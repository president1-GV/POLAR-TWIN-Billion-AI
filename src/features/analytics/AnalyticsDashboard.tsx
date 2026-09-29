import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  Cpu, 
  Radio, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Search,
  Filter,
  Server,
  Layers,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const AnalyticsDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [provenanceData, setProvenanceData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLog, setSearchLog] = useState('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    try {
      const [h, p, a] = await Promise.all([
        api.getSystemHealth(),
        api.getProvenanceRegistry(),
        api.getAuditLogs(),
      ]);
      setHealthData(h);
      setProvenanceData(p);
      setAuditLogs(a);
    } catch (e) {
      console.error('Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (!searchLog) return true;
    const term = searchLog.toLowerCase();
    const actionMatch = log.action?.toLowerCase().includes(term);
    const userMatch = log.user_id?.toLowerCase().includes(term);
    const roleMatch = log.role?.toLowerCase().includes(term);
    const detailsMatch = JSON.stringify(log.details || '').toLowerCase().includes(term);
    return actionMatch || userMatch || roleMatch || detailsMatch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Aerospace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-polar-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-polar-cyan font-bold uppercase tracking-widest">
            <Activity className="w-4 h-4 text-polar-cyan" />
            <span>MISSION CONTROL OBSERVABILITY, AUDITABILITY & DATA PROVENANCE</span>
          </div>
          <h1 className="text-xl font-bold font-mono text-polar-text-primary tracking-tight mt-1 flex items-center gap-3">
            SYSTEM HEALTH & OPERATIONAL AUDIT REGISTRY
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30">
              ZERO-FABRICATION VERIFIED
            </span>
          </h1>
          <p className="text-xs text-polar-text-secondary font-mono mt-1">
            NCPOR • MoES • Indian Antarctic Stations Telemetry Pipeline & SHA-256 Ledger
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-primary text-xs font-mono border border-polar-border transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-polar-cyan ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {loading && !healthData ? (
        <LoadingSkeleton label="FETCHING SUBSYSTEM OBSERVABILITY METRICS..." rows={5} />
      ) : (
        <>
          {/* Subsystems Health Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-polar-text-primary uppercase tracking-wider flex items-center gap-2">
                <Server className="w-3.5 h-3.5 text-polar-cyan" />
                Live Subsystem Telemetry & Observability Matrix
              </h3>
              <span className="text-[10px] font-mono text-polar-text-muted">
                {(healthData?.subsystems || []).length} Subsystems Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(healthData?.subsystems || []).map((sub: any, idx: number) => {
                return (
                  <div key={idx} className="polar-panel p-4 space-y-3 hover:border-polar-cyan/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-polar-cyan" />
                        <span className="text-xs font-mono font-bold text-polar-text-primary">{sub.subsystem}</span>
                      </div>
                      <StatusBadge status={sub.status} size="sm" />
                    </div>
                    
                    <p className="text-xs font-mono text-polar-text-secondary leading-relaxed min-h-[32px]">
                      {sub.notes}
                    </p>
                    
                    <div className="pt-2.5 border-t border-polar-border flex items-center justify-between text-[11px] font-mono text-polar-text-muted">
                      {sub.latency_ms !== undefined && (
                        <span>Latency: <strong className="text-polar-cyan font-semibold">{sub.latency_ms} ms</strong></span>
                      )}
                      {sub.buffer_size !== undefined && (
                        <span>Buffer: <strong className="text-amber-500 dark:text-amber-400 font-semibold">{sub.buffer_size} pkts</strong></span>
                      )}
                      {sub.model_version && (
                        <span>Version: <strong className="text-polar-text-primary font-semibold">{sub.model_version}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Data Provenance Registry */}
          <div className="polar-panel p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-polar-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-polar-cyan" />
                  <h3 className="text-xs font-mono font-bold text-polar-text-primary uppercase tracking-wider">
                    Data Source & Provenance Registry
                  </h3>
                </div>
                <p className="text-xs font-mono text-polar-text-secondary mt-1">
                  Absolute Standard: Synthetic data is tagged distinctly and never masquerades as live physical sensor feeds.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                AUDITABLE PROVENANCE
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-polar-border text-polar-text-muted text-[10px] uppercase">
                    <th className="pb-2.5">Data Source</th>
                    <th className="pb-2.5">Provenance Tier</th>
                    <th className="pb-2.5">Operational Status</th>
                    <th className="pb-2.5">Reliability Score</th>
                    <th className="pb-2.5">Target Ingestion Endpoint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-polar-border/60">
                  {(provenanceData?.sources || []).map((src: any) => (
                    <tr key={src.id} className="hover:bg-polar-elevated/60 transition-colors">
                      <td className="py-3 font-bold text-polar-text-primary">{src.name}</td>
                      <td className="py-3">
                        <ProvenanceBadge type={src.provenance_type} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={src.status} size="sm" />
                      </td>
                      <td className="py-3 text-polar-cyan font-semibold">
                        {Math.round((src.reliability_score || 0) * 100)}%
                      </td>
                      <td className="py-3 text-polar-text-muted text-[11px] truncate max-w-xs font-mono">
                        {src.endpoint_url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Log Trail */}
          <div className="polar-panel p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-polar-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-polar-cyan" />
                <h3 className="text-xs font-mono font-bold text-polar-text-primary uppercase tracking-wider">
                  Operational Audit Trail ({filteredLogs.length} Records)
                </h3>
                <span className="text-[10px] font-mono text-polar-text-muted bg-polar-elevated px-2 py-0.5 rounded border border-polar-border">
                  Immutable Cryptographic Ledger
                </span>
              </div>

              {/* Search Log Input */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-polar-text-muted" />
                  <input
                    type="text"
                    value={searchLog}
                    onChange={(e) => setSearchLog(e.target.value)}
                    placeholder="Search logs (action, user, role)..."
                    className="pl-8 pr-3 py-1 bg-polar-card border border-polar-border rounded text-xs font-mono text-polar-text-primary placeholder-polar-text-muted focus:outline-none focus:border-polar-cyan w-64"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto text-xs font-mono pr-1">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-10 text-polar-text-muted font-mono">
                  No matching operational audit records found.
                </div>
              ) : (
                filteredLogs.map((log: any) => (
                  <div 
                    key={log.id} 
                    className="bg-polar-card p-3 rounded border border-polar-border flex flex-col md:flex-row md:items-center justify-between gap-2 hover:border-polar-cyan/40 transition-all shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-polar-cyan font-bold tracking-wide">{log.action}</span>
                        <span className="text-[10px] text-polar-text-secondary bg-polar-elevated px-2 py-0.5 rounded border border-polar-border">
                          User: <strong className="text-polar-text-primary">{log.user_id}</strong> ({log.role})
                        </span>
                        {log.details?.station_id && (
                          <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                            {log.details.station_id}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-polar-text-secondary font-mono">
                        Details: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </div>
                    </div>
                    <div className="text-[10px] text-polar-text-muted font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-polar-text-muted" />
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
