import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Radio, 
  Bell, 
  User, 
  Clock, 
  ShieldCheck, 
  Activity, 
  ChevronDown,
  Compass
} from 'lucide-react';
import { LinkStatus } from '../../types';
import { SecurityModal } from './SecurityModal';

interface HeaderProps {
  currentStationId: string;
  onStationChange: (stationId: string) => void;
  linkStatus: LinkStatus;
  onLinkToggle: () => void;
  unreadAlertsCount: number;
  onOpenAlerts: () => void;
  activeRole: string;
  onRoleChange: (role: string) => void;
  onOpenStationDrawer?: (stationId: string) => void;
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
  onOpenStationDrawer,
}) => {
  const [utcTime, setUtcTime] = useState('');
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setUtcTime(
        d.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 6).join(' ')
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const linkConfigs: Record<LinkStatus, { bg: string; dot: string; label: string }> = {
    ONLINE: { 
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40', 
      dot: 'bg-emerald-400', 
      label: 'SAT-LINK ONLINE' 
    },
    DEGRADED: { 
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/40', 
      dot: 'bg-amber-400 animate-pulse', 
      label: 'SAT-LINK DEGRADED' 
    },
    OFFLINE: { 
      bg: 'bg-rose-950/40 border-rose-500/40 text-rose-300 hover:bg-rose-900/40', 
      dot: 'bg-rose-400 animate-ping', 
      label: 'EDGE OFFLINE MODE' 
    },
    SYNCING: { 
      bg: 'bg-sky-950/40 border-sky-500/30 text-sky-300 hover:bg-sky-900/40', 
      dot: 'bg-sky-400 animate-spin', 
      label: 'STORE-AND-FORWARD SYNC' 
    },
  };

  const currLink = linkConfigs[linkStatus] || linkConfigs.ONLINE;
  const isBharati = currentStationId === 'station_bharati';

  return (
    <header className="h-16 bg-[#0B1220] border-b border-[#1E293B] px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm font-mono">
      {/* LEFT: Branding & First-Class Station Context */}
      <div className="flex items-center gap-4">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#111827] border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-wider text-white">POLAR-TWIN</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-[#111827] text-slate-400 border border-[#1E293B]">
                SIH 26060
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight font-sans">
              Indian Antarctic Research Operations • NCPOR
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-7 border-l border-[#1E293B] hidden sm:block" />

        {/* First-Class Station Selector */}
        <div className="hidden sm:flex items-center bg-[#030712] rounded-lg p-1 border border-[#1E293B]">
          <button
            onClick={() => onStationChange('station_bharati')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              isBharati
                ? 'bg-[#1E293B] text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBharati ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            <span>BHARATI</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">• Larsemann Hills</span>
          </button>
          <button
            onClick={() => onStationChange('station_maitri')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              !isBharati
                ? 'bg-[#1E293B] text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isBharati ? 'bg-cyan-400' : 'bg-slate-600'}`} />
            <span>MAITRI</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">• Schirmacher Oasis</span>
          </button>
        </div>
      </div>

      {/* CENTER: Primary Operational State */}
      <div className="hidden xl:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#030712] border border-[#1E293B] text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">OPERATIONAL STATE:</span>
          <span className="text-emerald-400 font-semibold">
            {unreadAlertsCount > 0 ? `${unreadAlertsCount} ACTIVE ADVISORIES` : 'ALL SYSTEMS NOMINAL'}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 text-[11px]">
            {isBharati ? '69.408° S, 76.187° E' : '70.766° S, 11.740° E'}
          </span>
        </div>
      </div>

      {/* RIGHT: System Health, Satellite Link, Alerts, RBAC, Clock */}
      <div className="flex items-center gap-3">
        {/* System Health / Zero-Trust Security */}
        <button
          onClick={() => setIsSecurityOpen(true)}
          title="System Health & Zero-Trust Access Controls"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#030712] border border-[#1E293B] hover:border-slate-700 text-slate-300 text-xs transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden lg:inline text-slate-400">HEALTH:</span>
          <span className="text-emerald-400 font-semibold">98.4%</span>
        </button>

        {/* Satellite Link Toggle */}
        <button
          onClick={onLinkToggle}
          title="Toggle Satellite Link state to test Edge Offline Buffering and Replay Sync"
          className={`flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs transition-colors ${currLink.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${currLink.dot}`} />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-semibold hidden md:inline">{currLink.label}</span>
        </button>

        {/* Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          title="Open Operational Alerts Drawer"
          className="relative p-2 rounded-md bg-[#030712] border border-[#1E293B] text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* RBAC Operator Role Switcher */}
        <div className="flex items-center gap-1.5 bg-[#030712] border border-[#1E293B] px-2.5 py-1 rounded-md">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={activeRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer pr-1"
          >
            <option value="OPERATOR" className="bg-[#0B1220]">OPERATOR (Duty)</option>
            <option value="ENGINEER" className="bg-[#0B1220]">ENGINEER (Base)</option>
            <option value="SUPERVISOR" className="bg-[#0B1220]">COMMANDER (NCPOR)</option>
            <option value="ANALYST" className="bg-[#0B1220]">ANALYST (Science)</option>
            <option value="VIEWER" className="bg-[#0B1220]">VIEWER (Read-Only)</option>
            <option value="ADMIN" className="bg-[#0B1220]">ADMIN (Mission Ctrl)</option>
          </select>
        </div>

        {/* Scientific UTC Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 bg-[#030712] px-2.5 py-1 rounded-md border border-[#1E293B]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-white">{utcTime || '12:00:00 UTC'}</span>
        </div>
      </div>

      {/* Security & Access Inspection Modal */}
      <SecurityModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
        activeRole={activeRole}
        onRoleChange={onRoleChange}
      />
    </header>
  );
};
