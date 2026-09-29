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
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

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

  if (loading && !edgeStatus) {
    return (
      <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
        <LoadingSkeleton label="CONNECTING TO STATION EDGE GATEWAY..." rows={4} />
      </div>
    );
  }

  if (!edgeStatus) return null;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-polar-card border border-polar-border p-4 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold uppercase tracking-wider">
            <Radio className="w-4 h-4 text-polar-cyan" />
            <span>TWO-TIER ANTARCTIC EDGE ARCHITECTURE & STORE-AND-FORWARD ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-polar-text-primary tracking-tight mt-1 font-sans">
            EDGE NODE RESILIENCE & INTERMITTENT SATELLITE LINK SIMULATOR
          </h2>
          <p className="text-xs text-polar-text-secondary mt-0.5">
            Hardware Controller: <strong>{edgeStatus.hardware_specification}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DataFreshness isLive={true} />
          <ProvenanceBadge type="EDGE_SIMULATED" />
        </div>
      </div>

      {/* Satellite Link Controls */}
      <div className="bg-polar-card border border-polar-border p-5 rounded-lg space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-polar-border pb-3 gap-3">
          <div className="flex items-center gap-2.5">
            <StatusBadge status={edgeStatus.link_status} size="md" />
            <h3 className="text-sm font-bold text-polar-text-primary">
              SATELLITE CARRIER LINK STATUS
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => handleToggleLink('ONLINE')}
              className={`px-3 py-1.5 rounded font-bold border transition-colors ${
                edgeStatus.link_status === 'ONLINE'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50'
                  : 'bg-polar-elevated text-polar-text-secondary border-polar-border hover:text-polar-text-primary'
              }`}
            >
              SET ONLINE
            </button>
            <button
              onClick={() => handleToggleLink('DEGRADED')}
              className={`px-3 py-1.5 rounded font-bold border transition-colors ${
                edgeStatus.link_status === 'DEGRADED'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50'
                  : 'bg-polar-elevated text-polar-text-secondary border-polar-border hover:text-polar-text-primary'
              }`}
            >
              SET DEGRADED
            </button>
            <button
              onClick={() => handleToggleLink('OFFLINE')}
              className={`px-3 py-1.5 rounded font-bold border transition-colors ${
                edgeStatus.link_status === 'OFFLINE'
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50'
                  : 'bg-polar-elevated text-polar-text-secondary border-polar-border hover:text-polar-text-primary'
              }`}
            >
              DISCONNECT (OFFLINE)
            </button>
          </div>
        </div>

        {/* Workflow Explanation Banner */}
        <div className="bg-polar-elevated p-4 rounded-lg border border-polar-border text-xs text-polar-text-secondary space-y-2">
          <div className="text-polar-cyan font-bold uppercase tracking-wider">
            Mandatory Offline Store-and-Forward Replay Workflow:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-[11px] pt-1 font-sans">
            <div className="p-2.5 rounded bg-polar-card border border-polar-border">
              <strong className="text-polar-text-primary block font-mono">1. Disconnect Carrier</strong>
              <span className="text-polar-text-muted">Toggle to OFFLINE to simulate orbital blackout.</span>
            </div>
            <div className="p-2.5 rounded bg-polar-card border border-polar-border">
              <strong className="text-polar-text-primary block font-mono">2. Ingest Local Telemetry</strong>
              <span className="text-polar-text-muted">Inject vibration readings. Packets buffer with CRC32 hashes.</span>
            </div>
            <div className="p-2.5 rounded bg-polar-card border border-polar-border">
              <strong className="text-polar-text-primary block font-mono">3. Local Edge Rules</strong>
              <span className="text-polar-text-muted">Autonomous edge rule engine alarms station without cloud.</span>
            </div>
            <div className="p-2.5 rounded bg-polar-card border border-polar-border">
              <strong className="text-polar-text-primary block font-mono">4. Replay Reconnect</strong>
              <span className="text-polar-text-muted">Trigger Replay Sync to flush queue to Supabase database.</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleInjectOfflineReading}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-polar-elevated hover:bg-polar-surface text-polar-cyan border border-polar-border text-xs font-semibold transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-polar-cyan" />
            <span>Inject Telemetry into Local Buffer</span>
          </button>

          <button
            onClick={handleSync}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 text-xs font-bold transition-colors shadow"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" />
            <span>Trigger Store-and-Forward Replay ({edgeStatus.buffer_queue_size} Packets)</span>
          </button>
        </div>
      </div>

      {/* Sync Result Banner */}
      {syncResult && (
        <div className="bg-emerald-500/10 border border-emerald-500/40 p-4 rounded-lg flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{syncResult.message}</span>
          </div>
          <span className="text-polar-text-muted">Duration: {syncResult.duration_ms} ms</span>
        </div>
      )}

      {/* Buffer & Local Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Local Queue */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-polar-border pb-2">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-polar-cyan" />
              <h4 className="text-xs font-bold text-polar-text-primary uppercase">
                Local On-Disk Buffer ({edgeStatus.buffer_queue_size} Packets)
              </h4>
            </div>
            <span className="text-[10px] text-polar-text-muted">CRC-32 Checksummed</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
            {edgeStatus.local_buffer_sample.length === 0 ? (
              <div className="text-center py-10 text-polar-text-muted">
                Buffer queue empty. All telemetry flushed and synchronized to Supabase Cloud.
              </div>
            ) : (
              edgeStatus.local_buffer_sample.map((pkt, idx) => (
                <div key={idx} className="bg-polar-elevated p-2.5 rounded border border-polar-border flex items-center justify-between">
                  <div>
                    <span className="text-polar-text-secondary font-bold">Seq #{pkt.sequence_number}</span>
                    <span className="text-polar-text-muted ml-2">{pkt.metric}: <strong className="text-polar-text-primary">{pkt.value} {pkt.unit}</strong></span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    CRC: {pkt.crc32 ? pkt.crc32.toString(16).toUpperCase() : 'OK'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Local Edge Rule Alerts */}
        <div className="bg-polar-card border border-polar-border rounded-lg p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-polar-border pb-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h4 className="text-xs font-bold text-polar-text-primary uppercase">
                Edge Autonomous Rule Engine Alerts ({edgeStatus.local_alerts_count})
              </h4>
            </div>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Offline Edge Loop</span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
            {edgeStatus.local_alerts.length === 0 ? (
              <div className="text-center py-10 text-polar-text-muted">
                No local edge threshold violations recorded.
              </div>
            ) : (
              edgeStatus.local_alerts.map((al, idx) => (
                <div key={idx} className="bg-polar-elevated p-2.5 rounded border border-polar-border flex items-center justify-between">
                  <div>
                    <div className="text-rose-600 dark:text-rose-400 font-bold">{al.title}</div>
                    <div className="text-[10px] text-polar-text-muted">Generated: {al.timestamp}</div>
                  </div>
                  <StatusBadge status={al.severity} size="sm" showIcon={false} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
