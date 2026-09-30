// ============================================================================
// POLAR-TWIN: Duty Operator Command Center
// Operational Authority: STATION_OPS (Level 2 Duty Clearance)
// Header: POLAR-TWIN DUTY OPERATIONS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Wind, 
  AlertTriangle, 
  ShieldCheck, 
  Radio, 
  Box, 
  Play,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Flame,
  Droplet,
  Fuel,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { Station3DViewer } from '../digital-twin/Station3DViewer';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { MissionSummary } from '../../components/ui/MissionSummary';
import { CommandButton } from '../../components/ui/CommandButton';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const DutyOperatorCommandCenter: React.FC<Props> = ({
  currentStationId = 'station_bharati',
  onNavigate,
  onSelectStation
}) => {
  const { user, role, operationalAuthority, stationScope } = useAuth();
  const [stations, setStations] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [ackInProgress, setAckInProgress] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentStationId]);

  const loadData = async () => {
    try {
      const [stationList, alerts] = await Promise.all([
        api.getStations(),
        api.getAlerts(currentStationId)
      ]);
      setStations(stationList);
      setActiveAlerts(alerts.filter(a => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED'));
      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Duty Operator telemetry error:', err);
    } finally {
      setLoading(false);
    }
  };

  const [resolveInProgress, setResolveInProgress] = useState<string | null>(null);

  const handleAcknowledgeAlert = async (alertId: string) => {
    setAckInProgress(alertId);
    try {
      await api.acknowledgeAlert(alertId);
      await loadData();
    } catch (e) {
      console.error('Failed to acknowledge alert:', e);
    } finally {
      setAckInProgress(null);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    setResolveInProgress(alertId);
    try {
      await api.resolveAlert(alertId, 'Resolved via Duty Operations Center');
      await loadData();
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    } finally {
      setResolveInProgress(null);
    }
  };


  const isBharati = currentStationId === 'station_bharati';
  const stationName = isBharati ? 'Bharati Station' : 'Maitri Station';

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* 1. HERO BAR: POLAR-TWIN DUTY OPERATIONS */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-cyan-500/60 shadow-xl ring-4 ring-cyan-500/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>POLAR-TWIN • OPERATIONAL COMMAND</span>
                <span className="text-polar-border">|</span>
                <span className="bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  AUTHORITY: {operationalAuthority}
                </span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-muted">SCOPE: {stationScope.join(', ')}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-polar-text-primary tracking-tight font-mono">
                POLAR-TWIN DUTY OPERATIONS
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Real-time station monitoring, active alarms, environmental observations, and immediate procedural response for {stationName}.
              </p>
            </div>
          </div>

          {/* Quick Duty Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Box}
              onClick={() => onNavigate('digital-twin')}
            >
              Inspect 3D Twin
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={Play}
              onClick={() => onNavigate('simulation')}
            >
              Duty Simulation
            </CommandButton>
          </div>
        </div>

        {/* Global Operational Status Sub-Strip */}
        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Assigned Officer:</span>
            <span className="text-cyan-400 font-bold truncate">{user?.display_name || 'V. Sharma (Duty Operator)'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Active Advisories:</span>
            <span className={`font-semibold ${activeAlerts.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeAlerts.length} Active Alarms
            </span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Sat Link:</span>
            <span className="text-emerald-400 font-semibold truncate">GSAT-11 Nominal</span>
          </div>
        </div>
      </section>

      {/* 2. MISSION SUMMARY */}
      <MissionSummary
        activeStationsCount={1}
        totalStationsCount={1}
        microgridStatus={isBharati ? "NOMINAL • 395 kW" : "NOMINAL • 160 kW"}
        waterStatus={isBharati ? "OPTIMAL • 3,200 L/d" : "STABLE • 2,150 L/d"}
        fuelStatus={isBharati ? "HEALTHY • 186.3 DAYS" : "STABLE • 142.8 DAYS"}
        connectivityStatus="ONLINE • GSAT-11 (640ms)"
        weatherStatus={isBharati ? "-24.2°C • 18.4 m/s KATABATIC" : "-28.5°C • 21.0 m/s BLIZZARD"}
      />

      {/* 3. DUTY OPERATOR TELEMETRY METRICS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <TelemetryMetric
          label="Station Microgrid Load"
          value={isBharati ? "395.0" : "160.0"}
          unit="kW"
          status="NORMAL"
          trend="+3.2% (24h)"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[380, 385, 390, 392, 395]}
          sparklineColor="#38BDF8"
          provenance="PHYSICS_MODEL"
          icon={Zap}
        />
        <TelemetryMetric
          label="Internal Ambient Temp"
          value="+21.4"
          unit="°C"
          status="NORMAL"
          trend="Nominal"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[21.2, 21.3, 21.4, 21.4, 21.4]}
          sparklineColor="#10B981"
          provenance="PHYSICS_MODEL"
          icon={Flame}
        />
        <TelemetryMetric
          label="Potable Water Storage"
          value={isBharati ? "3,200" : "2,150"}
          unit="L"
          status="NORMAL"
          trend="Stable"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[3100, 3150, 3200, 3200, 3200]}
          sparklineColor="#06B6D4"
          provenance="PHYSICS_MODEL"
          icon={Droplet}
        />
        <TelemetryMetric
          label="External Wind Speed"
          value={isBharati ? "18.4" : "21.0"}
          unit="m/s"
          status="ELEVATED"
          trend="Katabatic Surge"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[12, 14, 16, 17, 18.4]}
          sparklineColor="#F59E0B"
          provenance="REAL_PUBLIC"
          icon={Wind}
        />
      </section>

      {/* 4. ACTIVE INCIDENTS & IMMEDIATE OPERATIONAL RESPONSE */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-polar-text-primary font-mono uppercase tracking-wide">
              Immediate Duty Response & Active Advisories
            </h2>
          </div>
          <button
            onClick={() => loadData()}
            className="text-xs text-polar-text-muted hover:text-cyan-400 flex items-center gap-1 font-mono transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>REFRESH</span>
          </button>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 text-center bg-polar-base/40 rounded border border-dashed border-polar-border/60">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-polar-text-primary font-mono">ALL STATION SYSTEMS NOMINAL</p>
            <p className="text-xs text-polar-text-muted font-mono mt-1">No unacknowledged operational alarms or telemetry threshold violations.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeAlerts.map(alert => (
              <div 
                key={alert.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded bg-polar-base border border-polar-border hover:border-polar-border-active transition-colors font-mono"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alert.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                      alert.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-bold text-polar-text-primary truncate">{alert.title}</span>
                    <span className="text-[10px] text-polar-text-muted">[{alert.subsystem}]</span>
                  </div>
                  <p className="text-xs text-polar-text-secondary mt-1">{alert.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {alert.status === 'ACTIVE' ? (
                    <button
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                      disabled={ackInProgress === alert.id}
                      className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {ackInProgress === alert.id ? 'Acknowledging...' : 'Acknowledge'}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold px-2.5 py-1 rounded bg-amber-950/40 border border-amber-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ACKNOWLEDGED
                    </span>
                  )}

                  {alert.status !== 'RESOLVED' ? (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      disabled={resolveInProgress === alert.id}
                      className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {resolveInProgress === alert.id ? 'Resolving...' : 'Resolve'}
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-800/40">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. 3D DIGITAL TWIN PREVIEW */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-polar-border">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-polar-text-primary font-mono uppercase tracking-wide">
              Live Station 3D Telemetry Spatial View
            </h2>
          </div>
          <button
            onClick={() => onNavigate('digital-twin')}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
          >
            <span>FULL 3D EXPLORER</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="h-96 rounded overflow-hidden border border-polar-border">
          <Station3DViewer 
            key={currentStationId}
            stationId={currentStationId}
            onSelectStation={onSelectStation}
            onNavigateToSimulation={() => onNavigate('simulation')}
          />
        </div>
      </section>
    </div>
  );
};
