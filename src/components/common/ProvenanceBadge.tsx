import React from 'react';
import { Globe, Cpu, Radio, ShieldCheck, Database, Server, AlertCircle } from 'lucide-react';

export type ProvenanceTier = 
  | 'REAL_OBSERVED'
  | 'PUBLIC_BENCHMARK'
  | 'DERIVED_PHYSICS'
  | 'ESTIMATED_STRUCTURAL'
  | 'SYNTHETIC_TELEMETRY'
  | 'DOCUMENTED'
  | 'RECONSTRUCTED'
  | 'ESTIMATED'
  | 'LIVE_NCPOR'
  | 'REAL_NCPOR'
  | 'PHYSICS_MODEL'
  | 'PHYSICS_SYNTHETIC'
  | 'SYNTHETIC_SIMULATION'
  | 'SIMULATED'
  | 'PUBLIC_EXTERNAL'
  | 'REAL_PUBLIC'
  | 'EDGE_CACHE'
  | 'EDGE_SIMULATED'
  | 'EXTERNAL_ANTARCTIC_BENCHMARK'
  | 'DERIVED'
  | 'OFFLINE'
  | 'MOCK'
  | string;

interface Props {
  type: ProvenanceTier;
  provider?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const ProvenanceBadge: React.FC<Props> = ({ 
  type, 
  provider, 
  size = 'sm', 
  className = '' 
}) => {
  const norm = (type || 'MOCK').toUpperCase().trim();

  let label = 'PROVENANCE UNKNOWN';
  let Icon = Database;
  let color = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700';
  let tooltip = 'Data provenance unverified.';

  if (norm === 'REAL_OBSERVED' || norm === 'LIVE_NCPOR' || norm === 'REAL_NCPOR' || norm === 'LIVE') {
    label = 'REAL OBSERVED';
    Icon = ShieldCheck;
    color = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40';
    tooltip = 'Physical sensor, satellite, or human observation from Antarctica (NCPOR / MoES).';
  } else if (norm === 'PUBLIC_BENCHMARK' || norm === 'EXTERNAL_ANTARCTIC_BENCHMARK') {
    label = 'PUBLIC BENCHMARK';
    Icon = Server;
    color = 'bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-500/40';
    tooltip = 'Real-world public dataset (ERA5, NOAA, SCAR, IMD, USGS, AADC open polar databases).';
  } else if (norm === 'DERIVED_PHYSICS' || norm === 'PHYSICS_MODEL' || norm === 'PHYSICS_SYNTHETIC') {
    label = 'DERIVED PHYSICS';
    Icon = Cpu;
    color = 'bg-sky-50 text-sky-800 border-sky-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40';
    tooltip = 'First-principles physics simulation, thermodynamic differential model, or causal heat recovery calculation.';
  } else if (norm === 'ESTIMATED_STRUCTURAL') {
    label = 'ESTIMATED STRUCTURAL';
    Icon = Database;
    color = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40';
    tooltip = 'Architectural and structural estimate based on published station documentation & ISO container dimensions.';
  } else if (norm === 'SYNTHETIC_TELEMETRY' || norm === 'SYNTHETIC_SIMULATION' || norm === 'SIMULATED' || norm === 'SIMULATION') {
    label = 'SYNTHETIC TELEMETRY';
    Icon = Cpu;
    color = 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-500/40';
    tooltip = 'Generated test telemetry clearly marked as synthetic for simulation, contingency testing, and training.';
  } else if (norm === 'DOCUMENTED' || norm === 'VERIFIED') {
    label = 'DOCUMENTED GEOMETRY';
    Icon = ShieldCheck;
    color = 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40';
    tooltip = 'Built from published architectural, structural, and OEM engineering blueprints.';
  } else if (norm === 'RECONSTRUCTED') {
    label = 'RECONSTRUCTED GEOMETRY';
    Icon = Globe;
    color = 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-500/40';
    tooltip = 'Derived from satellite imagery, high-resolution photographs, and published technical specifications.';
  } else if (norm === 'ESTIMATED' || norm === 'APPROXIMATE') {
    label = 'ESTIMATED GEOMETRY';
    Icon = Database;
    color = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40';
    tooltip = 'Approximate dimensions based on standard polar modular construction and building sizes.';
  } else if (norm === 'PUBLIC_EXTERNAL' || norm === 'REAL_PUBLIC') {
    label = 'PUBLIC DATA';
    Icon = Globe;
    color = 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-500/40';
    tooltip = 'Public atmospheric and oceanographic satellite observation (CMEMS / Open-Meteo Antarctic Grid).';
  } else if (norm === 'EDGE_CACHE' || norm === 'EDGE_SIMULATED') {
    label = 'EDGE BUFFER';
    Icon = Radio;
    color = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40';
    tooltip = 'Rugged localized edge buffer. Synchronized via store-and-forward batch replay.';
  } else if (norm === 'DERIVED') {
    label = 'DERIVED METRIC';
    Icon = Database;
    color = 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-500/40';
    tooltip = 'Analytically aggregated or normalized feature from telemetry pipeline.';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border tracking-wider uppercase select-none transition-colors ${padding} ${color} ${className}`}
      title={provider ? `${tooltip} (Provider: ${provider})` : tooltip}
    >
      <Icon className={`${iconSize} flex-shrink-0`} />
      <span>{label}</span>
      {provider && (
        <span className="text-[9px] opacity-75 hidden sm:inline">
          • {provider}
        </span>
      )}
    </span>
  );
};
