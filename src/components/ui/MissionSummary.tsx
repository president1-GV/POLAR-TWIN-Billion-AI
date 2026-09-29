import React from 'react';
import { ShieldCheck, Zap, Droplet, Fuel, Radio, CloudSnow } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface Props {
  activeStationsCount?: number;
  totalStationsCount?: number;
  microgridStatus?: string;
  waterStatus?: string;
  fuelStatus?: string;
  connectivityStatus?: string;
  weatherStatus?: string;
  className?: string;
}

export const MissionSummary: React.FC<Props> = ({
  activeStationsCount = 2,
  totalStationsCount = 2,
  microgridStatus = 'NOMINAL (395 kW)',
  waterStatus = 'OPTIMAL (3,200 L/d)',
  fuelStatus = 'HEALTHY (186.3 d)',
  connectivityStatus = 'ONLINE (GSAT-11)',
  weatherStatus = '-24.2°C • 18.4 m/s KATABATIC',
  className = '',
}) => {
  return (
    <div className={`bg-[#07111D] border border-[#1E293B] rounded-md p-4 font-mono shadow-sm ${className}`}>
      {/* Top Strip: High-Value Station Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1E293B] pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              ANTARCTIC OPERATIONS OVERVIEW
            </div>
            <div className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>{activeStationsCount} / {totalStationsCount} STATIONS OPERATIONAL</span>
              <StatusBadge status="OPERATIONAL" size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="text-[10px] text-slate-500">BHARATI:</span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-500">MAITRI:</span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
      </div>

      {/* Compositional Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 text-xs">
        {/* Microgrid */}
        <div className="flex items-center gap-2.5 p-2 bg-[#0A1422] rounded border border-[#1E293B]/60">
          <Zap className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Microgrid</div>
            <div className="text-slate-200 font-medium truncate">{microgridStatus}</div>
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center gap-2.5 p-2 bg-[#0A1422] rounded border border-[#1E293B]/60">
          <Droplet className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Water RO</div>
            <div className="text-slate-200 font-medium truncate">{waterStatus}</div>
          </div>
        </div>

        {/* Fuel */}
        <div className="flex items-center gap-2.5 p-2 bg-[#0A1422] rounded border border-[#1E293B]/60">
          <Fuel className="w-4 h-4 text-emerald-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Fuel Reserve</div>
            <div className="text-slate-200 font-medium truncate">{fuelStatus}</div>
          </div>
        </div>

        {/* Connectivity */}
        <div className="flex items-center gap-2.5 p-2 bg-[#0A1422] rounded border border-[#1E293B]/60">
          <Radio className="w-4 h-4 text-cyan-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Satellite</div>
            <div className="text-slate-200 font-medium truncate">{connectivityStatus}</div>
          </div>
        </div>

        {/* Weather */}
        <div className="col-span-2 md:col-span-1 flex items-center gap-2.5 p-2 bg-[#0A1422] rounded border border-[#1E293B]/60">
          <CloudSnow className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Weather</div>
            <div className="text-slate-200 font-medium truncate">{weatherStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
