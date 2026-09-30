import React, { useState } from 'react';
import { Activity, Zap, Thermometer, Droplet, Fuel, Radio, CheckCircle2, AlertTriangle, Crosshair, ChevronRight } from 'lucide-react';
import { StationAsset } from '../../../types';
import { StatusBadge } from '../../../components/ui/StatusBadge';

interface Props {
  stationId: string;
  assets: StationAsset[];
  selectedAssetId?: string | null;
  onSelectAsset: (assetId: string) => void;
}

export const TelemetryModeHUD: React.FC<Props> = ({
  stationId,
  assets,
  selectedAssetId,
  onSelectAsset,
}) => {
  const isBharati = stationId === 'station_bharati';
  const [subsystemFilter, setSubsystemFilter] = useState<'ALL' | 'POWER' | 'THERMAL' | 'WATER' | 'FUEL' | 'COMMS'>('ALL');

  // Filter key monitored machinery
  const monitoredAssets = assets.filter(a => {
    if (a.id.includes('monolith') || a.id.includes('crest') || a.id.includes('emblem') || a.id.includes('ROUTES') || a.id.includes('CONTAINERS')) {
      return false;
    }
    if (subsystemFilter === 'ALL') return true;
    if (subsystemFilter === 'POWER') return a.id.includes('gen') || a.id.includes('pdb') || a.id.includes('solar') || a.id.includes('bess') || a.id.includes('wind');
    if (subsystemFilter === 'THERMAL') return a.id.includes('hvac') || a.id.includes('boiler') || a.id.includes('BLR');
    if (subsystemFilter === 'WATER') return a.id.includes('water') || a.id.includes('pump') || a.id.includes('res') || a.id.includes('RO');
    if (subsystemFilter === 'FUEL') return a.id.includes('fuel') || a.id.includes('tank') || a.id.includes('TK');
    if (subsystemFilter === 'COMMS') return a.id.includes('comms') || a.id.includes('sat') || a.id.includes('SAT');
    return true;
  });

  const getMetricDisplay = (asset: StationAsset) => {
    const s = asset.current_state || {};
    if (s.power_output_kw !== undefined) return `${s.power_output_kw} kW (${s.load_pct ?? 0}% Load)`;
    if (s.output_kw !== undefined) return `${s.output_kw} kW`;
    if (s.soc_pct !== undefined) return `${s.soc_pct}% SoC (${s.cell_temp_c ?? 21}°C)`;
    if (s.grid_freq_hz !== undefined) return `${s.grid_freq_hz} Hz (${s.voltage_v ?? 415}V)`;
    if (s.indoor_temp_c !== undefined) return `${s.indoor_temp_c}°C (${s.heat_output_kw ?? 0} kW)`;
    if (s.water_supply_temp_c !== undefined) return `${s.water_supply_temp_c}°C Supply`;
    if (s.daily_output_litres !== undefined) return `${s.daily_output_litres} L/d (${s.storage_level_pct ?? 80}%)`;
    if (s.flow_rate_lpm !== undefined) return `${s.flow_rate_lpm} L/min`;
    if (s.level_litres !== undefined) return `${Math.round(s.level_litres / 1000)} kL (${Math.round((s.level_litres / (s.capacity_litres || 100000)) * 100)}%)`;
    if (s.signal_quality_db !== undefined) return `${s.signal_quality_db} dB CNR`;
    return 'Telemetry Stream Active';
  };

  return (
    <div className="absolute top-4 right-4 z-20 w-84 max-w-[calc(100vw-2rem)] font-mono select-none space-y-2 pointer-events-none">
      <div className="bg-polar-surface/95 border border-emerald-500/40 p-3.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-polar-border pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
              Live Telemetry Mode
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            100 Hz BUS
          </span>
        </div>

        {/* Subsystem Quick Filter Pills */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 text-[9px]">
          {(['ALL', 'POWER', 'THERMAL', 'WATER', 'FUEL', 'COMMS'] as const).map(sub => (
            <button
              key={sub}
              onClick={() => setSubsystemFilter(sub)}
              className={`px-2 py-1 rounded font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                subsystemFilter === sub
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-sm'
                  : 'bg-polar-card text-polar-text-secondary hover:text-polar-text-primary border border-polar-border'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Monitored Machinery Telemetry List */}
        <div className="mt-2 space-y-1.5 max-h-[46vh] overflow-y-auto pr-1">
          {monitoredAssets.map(asset => {
            const isSelected = selectedAssetId === asset.id;
            const metric = getMetricDisplay(asset);
            const isWarning = asset.status === 'WARNING' || asset.status === 'WATCH';
            const isCritical = asset.status === 'CRITICAL' || asset.status === 'FAILED';

            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset.id)}
                className={`p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-md ring-1 ring-emerald-500/40'
                    : isCritical
                    ? 'bg-rose-500/10 border-rose-500/40 hover:bg-rose-500/20'
                    : isWarning
                    ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/20'
                    : 'bg-polar-card hover:bg-polar-hover border-polar-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-polar-text-primary text-[11px] truncate flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isCritical ? 'bg-rose-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    {asset.code}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {asset.health_score}%
                    </span>
                    <StatusBadge status={asset.status} size="sm" />
                  </div>
                </div>

                <div className="text-[11px] text-polar-text-secondary truncate mt-0.5">
                  {asset.name}
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-polar-border/60 text-[10px]">
                  <span className="font-mono text-cyan-400 font-semibold truncate">
                    {metric}
                  </span>
                  <span className="text-[9px] text-polar-text-muted flex items-center gap-0.5 hover:text-emerald-400">
                    <Crosshair className="w-2.5 h-2.5" />
                    <span>Focus</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Telemetry Operational Status Bar */}
        <div className="mt-2.5 pt-2 border-t border-polar-border flex items-center justify-between text-[10px] text-polar-text-secondary">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Equipment Status Shaded in 3D
          </span>
          <span className="text-polar-text-muted">
            {monitoredAssets.length} Nodes
          </span>
        </div>
      </div>
    </div>
  );
};
