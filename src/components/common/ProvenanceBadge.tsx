import React from 'react';
import { ProvenanceType } from '../../types';
import { Globe, Cpu, Radio, PlugZap, ShieldAlert } from 'lucide-react';

interface Props {
  type: ProvenanceType;
  provider?: string;
  className?: string;
}

export const ProvenanceBadge: React.FC<Props> = ({ type, provider, className = '' }) => {
  const config = {
    REAL_PUBLIC: {
      label: 'REAL PUBLIC',
      icon: Globe,
      color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40',
      tooltip: 'Public real-world observation from NCPOR / Open-Meteo Antarctic Grid. Never claimed as classified station telemetry.'
    },
    PHYSICS_SYNTHETIC: {
      label: 'PHYSICS-SYNTHETIC',
      icon: Cpu,
      color: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40',
      tooltip: 'Physics-correlated thermodynamic differential simulation. Causal coupling of temperature, load, and fuel burn.'
    },
    EDGE_SIMULATED: {
      label: 'EDGE-SIMULATED',
      icon: Radio,
      color: 'bg-amber-950/80 text-amber-400 border-amber-500/40',
      tooltip: 'Station local edge node telemetry buffered with sequence and CRC32 payload checksum verification.'
    },
    FUTURE_IOT: {
      label: 'FUTURE IOT',
      icon: PlugZap,
      color: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
      tooltip: 'Planned industrial RS-485 / Modbus / OPC-UA interface. Not yet authorized for physical connection.'
    },
    MOCK: {
      label: 'MOCK DATA',
      icon: ShieldAlert,
      color: 'bg-slate-900 text-slate-400 border-slate-700',
      tooltip: 'Static fallback data.'
    }
  };

  const curr = config[type] || config.MOCK;
  const Icon = curr.icon;

  return (
    <div
      title={curr.tooltip}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase border shadow-sm cursor-help transition-all hover:scale-105 ${curr.color} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      <span className="font-semibold">{curr.label}</span>
      {provider && <span className="opacity-75 text-[9px] border-l border-current/30 pl-1.5">{provider}</span>}
    </div>
  );
};
