import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  HardDrive, 
  Activity, 
  Send, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../../services/api';
import { EdgeStatus } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

export const EdgeMonitor: React.FC = () => {
  const [edgeStatus, setEdgeStatus] = useState<EdgeStatus | null>(null);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await api.getEdgeStatus();
      setEdgeStatus(data);
    } catch (e) {
      console.error('Failed to load edge status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLink = async (status: string) => {
    try {
      await api.toggleEdgeLink(status);
      loadStatus();
    } catch (e) {
      console.error('Failed to toggle link:', e);
    }
  };

  const handleInjectOfflineReading = async () => {
    try {
      await api.updateAssetTelemetry('bh_gen_01', {
        vibration_mms: 4.88,
        exhaust_temp_c: 462.0,
      });
      loadStatus();
    } catch (e) {
      console.error('Failed to inject reading:', e);
    }
  };

  const handleSync = async () => {
    try {
      const res = await api.triggerEdgeSync();
      setSyncResult(res);
      loadStatus();
    } catch (e) {
      console.error('Failed to sync edge buffer:', e);
    }
  };

  if (!edgeStatus) {
    return <div className="p-8 text-center font-mono text-slate-400">Loading Edge Gateway Telemetry...</div>;
  }

  const isOffline = edgeStatus.link_status === 'OFFLINE';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-polar-cyan" />
            <span>TWO-TIER ANTARCTIC EDGE ARCHITECTURE & STORE-AND-FORWARD ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            EDGE NODE RESILIENCE & INTERMITTENT SATELLITE LINK SIMULATOR
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Physical Hardware: <strong>{edgeStatus.hardware_specification}</strong>
          </p>
        </div>

        <ProvenanceBadge type="EDGE_SIMULATED" />
      </div>

      {/* Satellite Link Controls */}
      <div className="polar-panel p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-polar-800 pb-3">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${
              edgeStatus.link_status === 'ONLINE' ? 'bg-emerald-400' :
              edgeStatus.link_status === 'DEGRADED' ? 'bg-amber-400 animate-pulse' :
              edgeStatus.link_status === 'OFFLINE' ? 'bg-red-500 animate-ping' : 'bg-cyan-400 animate-spin'
            }`} />
            <h3 className="text-sm font-mono font-bold text-white">
              SATELLITE CARRIER LINK STATUS: <span className="text-polar-cyan">{edgeStatus.link_status}</span>
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => handleToggleLink('ONLINE')}
              className={`px-3 py-1.5 rounded font-bold border transition-all ${
                edgeStatus.link_status === 'ONLINE' ? 'bg-emerald-950 text-emerald-400 border-emerald-500' : 'bg-polar-950 text-slate-400 border-polar-750'
              }`}
            >
              SET ONLINE
            </button>
            <button
              onClick={() => handleToggleLink('DEGRADED')}
              className={`px-3 py-1.5 rounded font-bold border transition-all ${
                edgeStatus.link_status === 'DEGRADED' ? 'bg-amber-950 text-amber-400 border-amber-500' : 'bg-polar-950 text-slate-400 border-polar-750'
              }`}
            >
              SET DEGRADED
            </button>
            <button
              onClick={() => handleToggleLink('OFFLINE')}
              className={`px-3 py-1.5 rounded font-bold border transition-all ${
                edgeStatus.link_status === 'OFFLINE' ? 'bg-red-950 text-red-400 border-red-500' : 'bg-polar-950 text-slate-400 border-polar-750'
              }`}
            >
              DISCONNECT (OFFLINE)
            </button>
          </div>
        </div>

        {/* Workflow Explanation Banner */}
        <div className="bg-polar-950 p-4 rounded-lg border border-polar-800 text-xs font-mono text-slate-300 space-y-2">
          <div className="text-polar-cyan font-bold">MANDATORY OFFLINE REPLAY DEMONSTRATION WORKFLOW:</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] pt-1">
            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <strong className="text-white">1. Disconnect:</strong> Toggle to <em>OFFLINE</em> to simulate satellite blackout.
            </div>
            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <strong className="text-white">2. Ingest:</strong> Click <em>Inject Offline Reading</em>. Telemetry queues with CRC32 checksums.
            </div>
            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <strong className="text-white">3. Local Rules:</strong> Local edge rule engine issues alerts even without cloud connectivity.
            </div>
            <div className="p-2 rounded bg-polar-900 border border-polar-800">
              <strong className="text-white">4. Replay Sync:</strong> Click <em>Trigger Store-and-Forward Replay</em> to flush buffer to Supabase.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleInjectOfflineReading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-polar-700 hover:bg-polar-600 text-polar-cyan border border-polar-cyan/40 text-xs font-mono font-bold transition-all shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            Inject High-Vibration Reading into Edge Buffer
          </button>

          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Trigger Store-and-Forward Replay Sync ({edgeStatus.buffer_queue_size} Packets)
          </button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className="bg-emerald-950/80 border border-emerald-500/80 p-4 rounded-xl flex items-center justify-between text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{syncResult.message}</span>
          </div>
          <span>Duration: {syncResult.duration_ms} ms</span>
        </div>
      )}

      {/* Buffer & Local Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Queue */}
        <div className="polar-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-polar-800 pb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-polar-cyan" />
              <h4 className="text-xs font-mono font-bold text-white uppercase">
                Local On-Disk Store-and-Forward Buffer ({edgeStatus.buffer_queue_size})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-slate-500">CRC32 Verified</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto text-xs font-mono">
            {edgeStatus.local_buffer_sample.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Buffer queue empty. All telemetry synced to central Supabase.
              </div>
            ) : (
              edgeStatus.local_buffer_sample.map((pkt, idx) => (
                <div key={idx} className="bg-polar-950 p-2.5 rounded border border-polar-800 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-bold">Seq #{pkt.sequence_number}</span>
                    <span className="text-slate-500 ml-2">{pkt.metric}: <strong className="text-white">{pkt.value} {pkt.unit}</strong></span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">
                    CRC: {pkt.crc32 ? pkt.crc32.toString(16).toUpperCase() : 'OK'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Local Edge Rule Alerts */}
        <div className="polar-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-polar-800 pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold text-white uppercase">
                Edge Autonomous Rule Engine Alerts ({edgeStatus.local_alerts_count})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-amber-400">Local Processing</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto text-xs font-mono">
            {edgeStatus.local_alerts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No local edge threshold violations recorded.
              </div>
            ) : (
              edgeStatus.local_alerts.map((al, idx) => (
                <div key={idx} className="bg-polar-950 p-2.5 rounded border border-polar-800 flex items-center justify-between">
                  <div>
                    <div className="text-red-400 font-bold">{al.title}</div>
                    <div className="text-[10px] text-slate-500">Generated: {al.timestamp}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                    {al.severity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
