import React from 'react';
import { GitFork, Zap, Flame, Droplet, Radio, Fuel, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { StationAsset } from '../../../types';

interface Props {
  stationId: string;
  selectedAsset: StationAsset | null;
  onClearSelection?: () => void;
  onSelectAsset?: (assetId: string) => void;
}

export const DependencyFlowLegend: React.FC<Props> = ({
  stationId,
  selectedAsset,
  onClearSelection,
  onSelectAsset,
}) => {
  const isBharati = stationId === 'station_bharati';

  const flows = [
    {
      id: 'POWER',
      label: 'Microgrid Power Bus',
      desc: isBharati ? '415V 3-Phase AC (250 kVA Gensets + Solar + BESS)' : '415V 3-Phase AC (125 kVA Gensets + Micro-Wind)',
      color: '#22D3EE',
      textColor: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      icon: Zap,
      rate: isBharati ? '185.0 kW' : '160.0 kW',
    },
    {
      id: 'FUEL',
      label: 'Bulk Polar Fuel Supply',
      desc: isBharati ? 'Polar Diesel Transfer to Gensets 01-03' : 'Polar Diesel to Gensets & Hydronic Boiler',
      color: '#F59E0B',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: Fuel,
      rate: isBharati ? '38.5 L/h' : '44.5 L/h',
    },
    {
      id: 'HEATING',
      label: 'Space Heating Glycol Loop',
      desc: isBharati ? 'Dual-Loop Thermal Recovery to Aerodynamic Habitat' : 'Central Hydronic Boiler to Living Wings',
      color: '#FB923C',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      icon: Flame,
      rate: isBharati ? '95.0 kW Heat' : '110.0 kW Heat',
    },
    {
      id: 'WATER',
      label: 'Potable & Desalination Circuit',
      desc: isBharati ? 'Snow Melt RO Plant to Living & Lab Quarters' : 'Lake Priyadarshini Intake to Potable Reservoir',
      color: '#0EA5E9',
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      icon: Droplet,
      rate: isBharati ? '3,200 L/d' : '85 L/min',
    },
    {
      id: 'COMMS',
      label: 'Telemetry & SCADA Uplink',
      desc: isBharati ? 'GSAT-11 C-Band & Inmarsat Deep-Space Terminal' : 'Inmarsat BGAN & HF High-Latitude Link',
      color: '#A855F7',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      icon: Radio,
      rate: isBharati ? '14.8 dB CNR' : '13.9 dB CNR',
    },
  ];

  return (
    <div className="absolute top-4 right-4 z-20 w-80 max-w-[calc(100vw-2rem)] font-mono select-none space-y-2 pointer-events-none">
      <div className="bg-polar-surface/95 border border-polar-border p-3.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-polar-border pb-2">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-polar-cyan" />
            <span className="text-xs font-bold text-polar-cyan tracking-wider">
              DEPENDENCY NETWORK OVERLAY
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40 animate-pulse">
            ACTIVE FLOWS
          </span>
        </div>

        {/* Selected Asset Tracing Focus */}
        {selectedAsset ? (
          <div className="mt-2.5 p-2 bg-polar-card rounded-lg border border-polar-cyan/40 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-polar-cyan font-bold uppercase tracking-wider">
                Tracing Active Node
              </span>
              {onClearSelection && (
                <button
                  onClick={onClearSelection}
                  className="text-polar-text-muted hover:text-polar-text-primary p-0.5"
                  title="Clear Tracing Selection"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="font-semibold text-polar-text-primary truncate mt-0.5">
              {selectedAsset.name}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[10px] text-polar-text-secondary">
              <span className="px-1 py-0.2 rounded bg-polar-elevated text-polar-cyan font-mono">
                {selectedAsset.code}
              </span>
              <span className="text-emerald-400 font-medium">
                Flow Conduit Focused
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-2 text-[11px] text-polar-text-secondary bg-polar-card/60 p-2 rounded-lg border border-polar-border flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-polar-cyan shrink-0" />
            <span>Click any machinery in the 3D scene to trace upstream supplies & downstream loads.</span>
          </div>
        )}

        {/* Flow Networks List */}
        <div className="mt-2.5 space-y-1.5">
          {flows.map(flow => {
            const Icon = flow.icon;
            return (
              <div
                key={flow.id}
                className={`p-2 rounded-lg border ${flow.bgColor} ${flow.borderColor} flex items-center justify-between transition-all`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0 animate-ping"
                    style={{ backgroundColor: flow.color, animationDuration: '2s' }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${flow.textColor}`} />
                      <span className={`text-[11px] font-bold ${flow.textColor} truncate`}>
                        {flow.label}
                      </span>
                    </div>
                    <div className="text-[9px] text-polar-text-secondary truncate mt-0.5">
                      {flow.desc}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 pl-2">
                  <span className={`text-[10px] font-mono font-bold ${flow.textColor}`}>
                    {flow.rate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Ray / Transparency Note */}
        <div className="mt-2.5 pt-2 border-t border-polar-border flex items-center justify-between text-[9px] text-polar-text-muted">
          <span>Structural envelope: Translucent X-Ray</span>
          <span className="text-polar-cyan font-bold">5 Active Circuits</span>
        </div>
      </div>
    </div>
  );
};
