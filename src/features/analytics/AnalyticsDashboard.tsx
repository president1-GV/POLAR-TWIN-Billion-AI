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
  RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

export const AnalyticsDashboard: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [provenanceData, setProvenanceData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
            <Activity className="w-4 h-4 text-polar-cyan" />
            <span>MISSION CONTROL OBSERVABILITY, AUDITABILITY & DATA PROVENANCE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            SYSTEM HEALTH & OPERATIONAL AUDIT REGISTRY
          </h2>
        </div>
        <button
          onClick={loadAll}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-polar-800 hover:bg-polar-750 text-slate-300 text-xs font-mono transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Subsystems Health Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Live Subsystem Telemetry & Observability Matrix
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(healthData?.subsystems || []).map((sub: any, idx: number) => {
            const isOnline = sub.status === 'ONLINE' || sub.status === 'SYNCING';
            return (
              <div key={idx} className="polar-panel p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{sub.subsystem}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isOnline ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-red-950 text-red-400 border border-red-500/40'
                  }`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">{sub.notes}</p>
                <div className="pt-2 border-t border-polar-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  {sub.latency_ms !== undefined && <span>Latency: <strong className="text-polar-cyan">{sub.latency_ms} ms</strong></span>}
                  {sub.buffer_size !== undefined && <span>Buffer: <strong className="text-amber-400">{sub.buffer_size} pkts</strong></span>}
                  {sub.model_version && <span>Version: <strong className="text-slate-300">{sub.model_version}</strong></span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Provenance Registry */}
      <div className="polar-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-polar-800 pb-3">
          <div>
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Data Source & Provenance Registry
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              Absolute Rule: Synthetic data is never represented as live sensor feeds.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
            AUDITABLE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-polar-800 text-slate-400 text-[10px] uppercase">
                <th className="pb-2">Data Source</th>
                <th className="pb-2">Provenance Type</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Reliability</th>
                <th className="pb-2">Endpoint</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-850">
              {(provenanceData?.sources || []).map((src: any) => (
                <tr key={src.id} className="hover:bg-polar-850/50">
                  <td className="py-2.5 font-bold text-white">{src.name}</td>
                  <td className="py-2.5">
                    <ProvenanceBadge type={src.provenance_type} />
                  </td>
                  <td className="py-2.5">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      src.status === 'CONNECTED' ? 'text-emerald-400 bg-emerald-950' : 'text-slate-400 bg-polar-800'
                    }`}>
                      {src.status}
                    </span>
                  </td>
                  <td className="py-2.5 text-polar-cyan">{Math.round((src.reliability_score || 0) * 100)}%</td>
                  <td className="py-2.5 text-slate-400 text-[10px] truncate max-w-xs">{src.endpoint_url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Trail */}
      <div className="polar-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-polar-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-polar-cyan" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Operational Audit Trail ({auditLogs.length} Records)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Immutable Event Log</span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto text-xs font-mono">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">No operational audit records logged yet.</div>
          ) : (
            auditLogs.map((log: any) => (
              <div key={log.id} className="bg-polar-950 p-3 rounded border border-polar-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-polar-cyan font-bold">{log.action}</span>
                    <span className="text-[10px] text-slate-400 bg-polar-900 px-1.5 py-0.5 rounded border border-polar-750">
                      User: {log.user_id} ({log.role})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Details: {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
