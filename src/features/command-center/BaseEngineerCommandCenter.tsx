// ============================================================================
// POLAR-TWIN: Base Engineer Command Center
// Operational Authority: TECHNICAL_OPS (Level 3 Engineering Clearance)
// Header: POLAR-TWIN ENGINEERING OPERATIONS
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Flame, 
  Droplet, 
  Cpu, 
  Sliders, 
  Wrench, 
  ShieldCheck, 
  Box, 
  Play, 
  AlertTriangle, 
  Gauge, 
  TrendingUp, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { TelemetryMetric } from '../../components/ui/TelemetryMetric';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { CommandButton } from '../../components/ui/CommandButton';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

interface Props {
  currentStationId?: string;
  onNavigate: (screen: any) => void;
  onSelectStation: (stationId: string) => void;
}

export const BaseEngineerCommandCenter: React.FC<Props> = ({
  currentStationId = 'station_bharati',
  onNavigate,
  onSelectStation
}) => {
  const { user, operationalAuthority, stationScope } = useAuth();
  const [stationAssets, setStationAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [tuningGen, setTuningGen] = useState<string>('GEN-1');
  const [hvacSetpoint, setHvacSetpoint] = useState<number>(21.5);
  const [injectStatus, setInjectStatus] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [currentStationId]);

  const loadData = async () => {
    try {
      const assets = await api.getStationAssets(currentStationId);
      setStationAssets(assets);
      setLastSyncTime(new Date());
    } catch (e) {
      console.error('Failed to load engineering assets:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTuneMicrogrid = () => {
    setInjectStatus(`Microgrid dispatch tuned: ${tuningGen} prioritized at 120kW balance.`);
    setTimeout(() => setInjectStatus(null), 4000);
  };

  const isBharati = currentStationId === 'station_bharati';
  const stationName = isBharati ? 'Bharati Station' : 'Maitri Station';

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1720px] mx-auto font-sans select-none overflow-hidden">
      {/* 1. HERO BAR: POLAR-TWIN ENGINEERING OPERATIONS */}
      <section className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-16 h-16 rounded-full object-contain border-2 border-amber-500/60 shadow-xl ring-4 ring-amber-500/20 shrink-0 hidden sm:block bg-polar-bg/40 p-0.5" 
            />
            <div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-amber-400 font-bold uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>POLAR-TWIN • TECHNICAL INFRASTRUCTURE</span>
                <span className="text-polar-border">|</span>
                <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  AUTHORITY: {operationalAuthority}
                </span>
                <span className="text-polar-border">|</span>
                <span className="text-polar-text-muted">SCOPE: {stationScope.join(', ')}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-polar-text-primary tracking-tight font-mono">
                POLAR-TWIN ENGINEERING OPERATIONS
              </h1>
              <p className="text-xs text-polar-text-secondary mt-1 max-w-3xl leading-relaxed font-mono">
                Technical infrastructure supervision, microgrid power balance, HVAC telemetry, and asset maintenance diagnostics for {stationName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <CommandButton
              variant="secondary"
              icon={Zap}
              onClick={() => onNavigate('energy')}
            >
              Microgrid Dispatch
            </CommandButton>
            <CommandButton
              variant="primary"
              icon={Box}
              onClick={() => onNavigate('digital-twin')}
            >
              Asset Telemetry 3D
            </CommandButton>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-polar-border grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Data Freshness:</span>
            <DataFreshness lastUpdatedTimestamp={lastSyncTime} isLive={true} />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Chief Engineer:</span>
            <span className="text-amber-400 font-bold truncate">{user?.display_name || 'A. Deshmukh (Base Engineer)'}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Tracked Assets:</span>
            <span className="text-polar-text-primary font-semibold truncate">{stationAssets.length || 12} Registered Nodes</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="text-polar-text-muted uppercase text-[10px] shrink-0">Microgrid Status:</span>
            <span className="text-emerald-400 font-semibold truncate">3-Phase Balanced (50.1 Hz)</span>
          </div>
        </div>
      </section>

      {/* Feedback banner */}
      {injectStatus && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded text-amber-300 font-mono text-xs flex items-center justify-between">
          <span>{injectStatus}</span>
          <span className="text-[10px] uppercase font-bold text-amber-400">TELEMETRY CALIBRATED</span>
        </div>
      )}

      {/* 2. ENGINEERING TELEMETRY METRIC STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <TelemetryMetric
          label="Microgrid Active Load"
          value={isBharati ? "395.0" : "160.0"}
          unit="kW"
          status="NORMAL"
          trend="Balanced"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[390, 392, 394, 395, 395]}
          sparklineColor="#F59E0B"
          provenance="PHYSICS_MODEL"
          icon={Zap}
        />
        <TelemetryMetric
          label="Battery State of Charge"
          value="94.2"
          unit="%"
          status="NORMAL"
          trend="+1.2% (Solar)"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[91, 92, 93, 94, 94.2]}
          sparklineColor="#10B981"
          provenance="PHYSICS_MODEL"
          icon={Gauge}
        />
        <TelemetryMetric
          label="HVAC Glycol Loop Temp"
          value="+42.8"
          unit="°C"
          status="NORMAL"
          trend="Thermal Equilibrium"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[42.1, 42.4, 42.6, 42.8, 42.8]}
          sparklineColor="#EF4444"
          provenance="PHYSICS_MODEL"
          icon={Flame}
        />
        <TelemetryMetric
          label="Water Desalination Rate"
          value="3,200"
          unit="L/DAY"
          status="NORMAL"
          trend="Nominal"
          trendDirection="up"
          timestamp="Live"
          sparklineData={[3100, 3150, 3180, 3200, 3200]}
          sparklineColor="#06B6D4"
          provenance="PHYSICS_MODEL"
          icon={Droplet}
        />
      </section>

      {/* 3. ENGINEERING WORKBENCH: MICROGRID TUNING & THERMAL LOOPS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Microgrid Control Panel */}
        <div className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Microgrid Tuning & Load Balancing
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              AUTHORIZED
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-polar-text-muted text-[11px] block mb-1">PRIMARY DIESEL GENERATOR PRIORITY:</label>
              <div className="grid grid-cols-3 gap-2">
                {['GEN-1', 'GEN-2', 'GEN-3'].map(g => (
                  <button
                    key={g}
                    onClick={() => setTuningGen(g)}
                    className={`p-2 rounded border text-xs font-bold transition-all ${
                      tuningGen === g 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm' 
                        : 'bg-polar-base text-polar-text-secondary border-polar-border hover:bg-polar-elevated'
                    }`}
                  >
                    {g} ({g === 'GEN-1' ? '120kW' : g === 'GEN-2' ? '120kW' : 'STANDBY'})
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-polar-text-muted text-[11px]">HVAC TARGET TEMPERATURE:</span>
                <span className="text-polar-text-primary font-bold">{hvacSetpoint.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="18.0"
                max="24.0"
                step="0.5"
                value={hvacSetpoint}
                onChange={(e) => setHvacSetpoint(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-polar-text-muted mt-1">
                <span>18.0°C (Conservation)</span>
                <span>21.0°C (Nominal)</span>
                <span>24.0°C (Maximum)</span>
              </div>
            </div>

            <button
              onClick={handleTuneMicrogrid}
              className="w-full py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
            >
              APPLY MICROGRID ADJUSTMENT
            </button>
          </div>
        </div>

        {/* Critical Asset Health Table */}
        <div className="bg-polar-card border border-polar-border rounded-md p-4 sm:p-5 font-mono shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-polar-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-polar-text-primary uppercase tracking-wide">
                Asset Health & Diagnostics Registry
              </h2>
            </div>
            <button
              onClick={() => onNavigate('digital-twin')}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              VIEW 3D NODES
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {(stationAssets.length > 0 ? stationAssets.slice(0, 5) : [
              { name: 'Primary Diesel Gen 1', health: 98.2, status: 'NORMAL', subsystem: 'POWER' },
              { name: 'Backup Diesel Gen 2', health: 97.4, status: 'NORMAL', subsystem: 'POWER' },
              { name: 'Primary Glycol Heat Exchanger', health: 96.1, status: 'NORMAL', subsystem: 'HVAC' },
              { name: 'Reverse Osmosis Desal Unit A', health: 95.8, status: 'NORMAL', subsystem: 'WATER' },
              { name: 'GSAT-11 Tracking Antenna', health: 99.4, status: 'NORMAL', subsystem: 'COMMS' }
            ]).map((asset, i) => (
              <div key={i} className="p-2.5 rounded bg-polar-base border border-polar-border flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-polar-text-primary">{asset.name || asset.asset_id}</p>
                  <p className="text-[10px] text-polar-text-muted">Subsystem: {asset.subsystem || 'ENGINEERING'}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">{asset.health || 97.5}%</span>
                  <span className="block text-[9px] text-polar-text-muted">HEALTH</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
