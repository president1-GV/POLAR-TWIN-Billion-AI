import React, { useState, useEffect } from 'react';
import { Shield, Radio, Bell, User, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { LinkStatus } from '../../types';
import { api } from '../../services/api';

interface HeaderProps {
  currentStationId: string;
  onStationChange: (stationId: string) => void;
  linkStatus: LinkStatus;
  onLinkToggle: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStationId,
  onStationChange,
  linkStatus,
  onLinkToggle,
  unreadAlertsCount,
  onOpenAlerts,
  activeRole,
  onRoleChange,
}) => {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setUtcTime(d.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const linkColors: Record<LinkStatus, { bg: string; text: string; dot: string; label: string }> = {
    ONLINE: { bg: 'bg-emerald-950/70 border-emerald-500/40', text: 'text-emerald-400', dot: 'bg-emerald-400', label: 'SAT-LINK ONLINE' },
    DEGRADED: { bg: 'bg-amber-950/70 border-amber-500/40', text: 'text-amber-400', dot: 'bg-amber-400 animate-pulse', label: 'SAT-LINK DEGRADED' },
    OFFLINE: { bg: 'bg-red-950/70 border-red-500/40', text: 'text-red-400', dot: 'bg-red-500 animate-ping', label: 'EDGE OFFLINE' },
    SYNCING: { bg: 'bg-cyan-950/70 border-cyan-500/40', text: 'text-cyan-400', dot: 'bg-cyan-400 animate-spin', label: 'REPLAY SYNCING' },
  };

  const currLink = linkColors[linkStatus] || linkColors.ONLINE;

  return (
    <header className="h-16 bg-polar-900 border-b border-polar-750/80 px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-polar-cyan/30 to-polar-600/30 border border-polar-cyan/50 flex items-center justify-center text-polar-cyan shadow-sm shadow-polar-cyan/20">
            <Shield className="w-5 h-5 text-polar-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold tracking-widest text-white">POLAR-TWIN</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-polar-cyan/15 text-polar-cyan border border-polar-cyan/30">SIH 26060</span>
            </div>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              ANTARCTIC RESEARCH STATIONS DIGITAL PLATFORM
            </p>
          </div>
        </div>

        {/* Station Switcher */}
        <div className="h-8 border-l border-polar-750/80 mx-2" />
        <div className="flex items-center bg-polar-950 rounded-lg p-1 border border-polar-750">
          <button
            onClick={() => onStationChange('station_bharati')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              currentStationId === 'station_bharati'
                ? 'bg-polar-600 text-polar-cyan border border-polar-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BHARATI (-69.4°S)
          </button>
          <button
            onClick={() => onStationChange('station_maitri')}
            className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-all ${
              currentStationId === 'station_maitri'
                ? 'bg-polar-600 text-polar-cyan border border-polar-cyan/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            MAITRI (-70.7°S)
          </button>
        </div>
      </div>

      {/* Center Mission Model */}
      <div className="hidden xl:flex items-center gap-2 text-[11px] font-mono text-slate-400 border border-polar-800/80 bg-polar-950/60 px-3 py-1 rounded-full">
        <span className="text-polar-cyan font-semibold">OBSERVE</span>
        <span>→</span>
        <span className="text-polar-cyan font-semibold">UNDERSTAND</span>
        <span>→</span>
        <span className="text-polar-cyan font-semibold">PREDICT</span>
        <span>→</span>
        <span className="text-polar-cyan font-semibold">SIMULATE</span>
        <span>→</span>
        <span className="text-polar-cyan font-semibold">DECIDE</span>
      </div>

      {/* Right Controls: Link status toggle, Alerts, RBAC, Clock */}
      <div className="flex items-center gap-4">
        {/* Link Status Pill with interactive toggle */}
        <button
          onClick={onLinkToggle}
          title="Click to simulate Satellite Connection Loss or Restore Reconnect Sync"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono transition-all hover:brightness-125 ${currLink.bg} ${currLink.text}`}
        >
          <span className={`w-2 h-2 rounded-full ${currLink.dot}`} />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-semibold">{currLink.label}</span>
        </button>

        {/* Alerts Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-polar-950 border border-polar-750 text-slate-300 hover:text-polar-cyan hover:border-polar-cyan/40 transition-all"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* RBAC Role Switcher */}
        <div className="flex items-center gap-2 bg-polar-950 border border-polar-750 px-2.5 py-1 rounded-lg">
          <User className="w-3.5 h-3.5 text-polar-cyan" />
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
          >
            <option value="OPERATOR" className="bg-polar-900">OPERATOR (Duty)</option>
            <option value="ENGINEER" className="bg-polar-900">ENGINEER (Mech/Elec)</option>
            <option value="SUPERVISOR" className="bg-polar-900">SUPERVISOR (Cmdr)</option>
            <option value="ANALYST" className="bg-polar-900">ANALYST (Sci)</option>
            <option value="VIEWER" className="bg-polar-900">VIEWER (Read-Only)</option>
            <option value="ADMIN" className="bg-polar-900">ADMIN (Mission Ctrl)</option>
          </select>
        </div>

        {/* UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-polar-950/80 px-2.5 py-1 rounded border border-polar-800">
          <Clock className="w-3.5 h-3.5 text-polar-cyan" />
          <span>{utcTime}</span>
        </div>
      </div>
    </header>
  );
};
