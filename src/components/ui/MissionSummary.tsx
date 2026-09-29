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
    <div className={`bg-polar-card border border-polar-border rounded-md p-4 font-mono shadow-sm overflow-hidden ${className}`}>
      {/* Top Strip: High-Value Station Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-polar-border pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-polar-text-muted font-bold">
              ANTARCTIC OPERATIONS OVERVIEW
            </div>
            <div className="text-base font-bold text-polar-text-primary tracking-tight flex items-center gap-2 mt-0.5">
              <span>{activeStationsCount} / {totalStationsCount} STATIONS OPERATIONAL</span>
              <StatusBadge status="OPERATIONAL" size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-polar-text-secondary">
          <span className="text-[10px] text-polar-text-muted">BHARATI:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ONLINE</span>
          <span className="text-polar-border">|</span>
          <span className="text-[10px] text-polar-text-muted">MAITRI:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">ONLINE</span>
        </div>
      </div>

      {/* Compositional Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 sm:gap-3 pt-3 text-xs">
        {/* Microgrid */}
        <div className="flex items-center gap-2 p-2 bg-polar-elevated rounded border border-polar-border overflow-hidden min-w-0" title={microgridStatus}>
          <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-polar-text-muted uppercase font-semibold">Microgrid</div>
            <div className="text-polar-text-primary font-medium truncate">{microgridStatus}</div>
          </div>
        </div>

        {/* Water */}
        <div className="flex items-center gap-2 p-2 bg-polar-elevated rounded border border-polar-border overflow-hidden min-w-0" title={waterStatus}>
          <Droplet className="w-4 h-4 text-sky-500 dark:text-sky-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-polar-text-muted uppercase font-semibold">Water RO</div>
            <div className="text-polar-text-primary font-medium truncate">{waterStatus}</div>
          </div>
        </div>

        {/* Fuel */}
        <div className="flex items-center gap-2 p-2 bg-polar-elevated rounded border border-polar-border overflow-hidden min-w-0" title={fuelStatus}>
          <Fuel className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-polar-text-muted uppercase font-semibold">Fuel Reserve</div>
            <div className="text-polar-text-primary font-medium truncate">{fuelStatus}</div>
          </div>
        </div>

        {/* Connectivity */}
        <div className="flex items-center gap-2 p-2 bg-polar-elevated rounded border border-polar-border overflow-hidden min-w-0" title={connectivityStatus}>
          <Radio className="w-4 h-4 text-cyan-500 dark:text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-polar-text-muted uppercase font-semibold">Satellite</div>
            <div className="text-polar-text-primary font-medium truncate">{connectivityStatus}</div>
          </div>
        </div>

        {/* Weather */}
        <div className="col-span-2 md:col-span-1 xl:col-span-1 flex items-center gap-2 p-2 bg-polar-elevated rounded border border-polar-border overflow-hidden min-w-0" title={weatherStatus}>
          <CloudSnow className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-polar-text-muted uppercase font-semibold">Weather</div>
            <div className="text-polar-text-primary font-medium truncate">{weatherStatus}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
