import React from 'react';
import { ArrowRight, Zap, Droplet, Flame, Radio, ShieldAlert, Cpu } from 'lucide-react';

interface RelatedNode {
  id: string;
  name: string;
  type: string;
  status?: string;
}

interface Props {
  currentAssetId: string;
  currentAssetName: string;
  upstream: RelatedNode[];
  downstream: RelatedNode[];
  onSelectAsset?: (assetId: string) => void;
  className?: string;
}

export const DependencyGraph: React.FC<Props> = ({
  currentAssetId,
  currentAssetName,
  upstream = [],
  downstream = [],
  onSelectAsset,
  className = '',
}) => {
  const getTypeIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'POWER': return Zap;
      case 'WATER':
      case 'RAW_WATER':
      case 'POTABLE': return Droplet;
      case 'FUEL': return Flame;
      case 'COMMS':
      case 'TELEMETRY': return Radio;
      case 'HEATING': return Flame;
      default: return Cpu;
    }
  };

  return (
    <div className={`p-4 bg-[#0A1422] border border-[#1E293B] rounded-md font-mono text-xs space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#38BDF8]" />
          Coupled Dependency Topology
        </span>
        <span className="text-[10px] text-slate-500">
          {upstream.length} Inflow | {downstream.length} Outflow
        </span>
      </div>

      <div className="space-y-3">
        {/* Upstream Dependencies (Inflows) */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
            Upstream Pre-requisites (Inflows):
          </span>
          {upstream.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 bg-[#07111D] rounded border border-[#1E293B]">
              No upstream dependencies (Primary Station Source)
            </div>
          ) : (
            <div className="space-y-1.5">
              {upstream.map((up) => {
                const Icon = getTypeIcon(up.type);
                return (
                  <button
                    key={up.id}
                    onClick={() => onSelectAsset && onSelectAsset(up.id)}
                    className="w-full flex items-center justify-between p-2 rounded bg-[#07111D] border border-[#1E293B] hover:border-[#38BDF8]/50 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
                      <span className="text-slate-200 group-hover:text-white truncate">{up.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase shrink-0">{up.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Active Node Centerpiece */}
        <div className="p-2.5 rounded bg-[#0D1726] border border-[#38BDF8]/40 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] animate-pulse" />
            <span className="font-bold text-white text-xs">{currentAssetName}</span>
          </div>
          <span className="text-[10px] font-semibold text-[#38BDF8] uppercase tracking-wider">
            FOCUSED
          </span>
        </div>

        {/* Downstream Effects (Outflows / Impact) */}
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">
            Downstream Impact If Failed (Outflows):
          </span>
          {downstream.length === 0 ? (
            <div className="text-[11px] text-slate-500 italic p-2 bg-[#07111D] rounded border border-[#1E293B]">
              Terminal consumer node (No downstream critical loads)
            </div>
          ) : (
            <div className="space-y-1.5">
              {downstream.map((down) => {
                const Icon = getTypeIcon(down.type);
                return (
                  <button
                    key={down.id}
                    onClick={() => onSelectAsset && onSelectAsset(down.id)}
                    className="w-full flex items-center justify-between p-2 rounded bg-[#07111D] border border-[#1E293B] hover:border-amber-500/50 text-left transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-200 group-hover:text-white truncate">{down.name}</span>
                    </div>
                    <span className="text-[10px] text-amber-400/80 uppercase shrink-0">IMPACTED</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
