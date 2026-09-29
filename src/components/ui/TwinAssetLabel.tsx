import React from 'react';
import { StatusBadge } from './StatusBadge';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

interface Props {
  name: string;
  code: string;
  status: string;
  health: number;
  screenX: number;
  screenY: number;
  subsystem?: string;
  onSelect?: () => void;
}

export const TwinAssetLabel: React.FC<Props> = ({
  name,
  code,
  status,
  health,
  screenX,
  screenY,
  subsystem,
  onSelect,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${screenX}px`,
        top: `${screenY}px`,
        transform: 'translate(-50%, -100%) translateY(-12px)',
        pointerEvents: 'none',
      }}
      className="z-30 transition-transform duration-75 select-none"
    >
      <div className="bg-[#07111D]/95 border border-[#38BDF8]/60 backdrop-blur-md rounded-md p-2.5 shadow-xl font-mono text-xs space-y-1.5 w-52 pointer-events-auto">
        {/* Header: Code + Status */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-1">
          <span className="font-bold text-[#38BDF8] tracking-wider text-[11px] uppercase">
            {code}
          </span>
          <StatusBadge status={status} size="sm" />
        </div>

        {/* Name */}
        <div className="font-medium text-slate-100 text-xs truncate">
          {name}
        </div>

        {/* Health + Subsystem */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
          <span>HEALTH: <strong className="text-emerald-400 font-semibold">{health}%</strong></span>
          {subsystem && <span className="text-slate-500 uppercase">{subsystem}</span>}
        </div>

        {/* Provenance */}
        <div className="pt-1 border-t border-[#1E293B] flex items-center justify-between">
          <span className="text-[9px] text-slate-500">DIGITAL TWIN NODE</span>
          <ProvenanceBadge type="PHYSICS_SYNTHETIC" size="sm" />
        </div>
      </div>

      {/* Pointer anchor triangle */}
      <div 
        className="w-2.5 h-2.5 bg-[#07111D] border-r border-b border-[#38BDF8]/60 rotate-45 mx-auto -mt-1.5"
      />
    </div>
  );
};
