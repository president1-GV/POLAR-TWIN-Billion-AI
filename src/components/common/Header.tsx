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
  Compass,
  LogIn,
  LogOut
} from 'lucide-react';
import { LinkStatus } from '../../types';
import { SecurityModal } from './SecurityModal';
import { ThemeSwitcher } from './ThemeSwitcher';
import { RoleSelector } from './RoleSelector';
import polarTwinIcon from '../../assets/polar-twin-icon.png';

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
  onOpenLogin?: () => void;
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
  onOpenLogin,
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
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/20', 
      dot: 'bg-emerald-500', 
      label: 'SAT-LINK ONLINE' 
    },
    DEGRADED: { 
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-300 hover:bg-amber-500/20', 
      dot: 'bg-amber-500 animate-pulse', 
      label: 'SAT-LINK DEGRADED' 
    },
    OFFLINE: { 
      bg: 'bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-300 hover:bg-rose-500/20', 
      dot: 'bg-rose-500 animate-ping', 
      label: 'EDGE OFFLINE MODE' 
    },
    SYNCING: { 
      bg: 'bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-300 hover:bg-sky-500/20', 
      dot: 'bg-sky-500 animate-spin', 
      label: 'STORE-AND-FORWARD SYNC' 
    },
  };

  const currLink = linkConfigs[linkStatus] || linkConfigs.ONLINE;
  const isBharati = currentStationId === 'station_bharati';

  return (
    <header className="h-16 bg-polar-surface border-b border-polar-border px-3 sm:px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40 select-none shadow-sm font-mono transition-colors overflow-hidden">
      {/* LEFT: Branding & First-Class Station Context */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Brand Identity */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-polar-elevated border border-polar-cyan/60 flex items-center justify-center p-0.5 shadow-md ring-1 ring-polar-cyan/30 shrink-0 overflow-hidden">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN Mission Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="flex flex-col justify-center shrink-0 min-w-0">
            <div className="flex items-center gap-1.5 whitespace-nowrap leading-tight">
              <span className="font-extrabold text-sm tracking-wider text-polar-text-primary whitespace-nowrap inline-block">
                POLAR<span className="text-polar-cyan">-TWIN</span>
              </span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-polar-elevated text-polar-text-muted border border-polar-border font-mono font-semibold shrink-0">
                SIH 26060
              </span>
            </div>
            <p className="text-[10px] text-polar-text-muted tracking-tight font-sans whitespace-nowrap mt-0.5 hidden sm:block">
              Indian Antarctic Operations <span className="text-polar-text-muted/60">•</span> NCPOR
            </p>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 border-l border-polar-border hidden sm:block" />

        {/* First-Class Station Selector */}
        <div className="hidden sm:flex items-center bg-polar-base rounded-lg p-0.5 border border-polar-border shrink-0">
          <button
            onClick={() => onStationChange('station_bharati')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isBharati
                ? 'bg-polar-elevated text-polar-cyan border border-polar-cyan/40 shadow-sm'
                : 'text-polar-text-muted hover:text-polar-text-primary'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isBharati ? 'bg-polar-cyan' : 'bg-slate-400 dark:bg-slate-600'}`} />
            <span>BHARATI</span>
            <span className="text-[10px] text-polar-text-muted hidden 2xl:inline">• Larsemann Hills</span>
          </button>
          <button
            onClick={() => onStationChange('station_maitri')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              !isBharati
                ? 'bg-polar-elevated text-polar-cyan border border-polar-cyan/40 shadow-sm'
                : 'text-polar-text-muted hover:text-polar-text-primary'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${!isBharati ? 'bg-polar-cyan' : 'bg-slate-400 dark:bg-slate-600'}`} />
            <span>MAITRI</span>
            <span className="text-[10px] text-polar-text-muted hidden 2xl:inline">• Schirmacher Oasis</span>
          </button>
        </div>
      </div>

      {/* CENTER: Primary Operational State (Shown on wide monitors) */}
      <div className="hidden 2xl:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-polar-base border border-polar-border text-xs whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-polar-text-secondary font-medium">OPERATIONAL STATE:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            {unreadAlertsCount > 0 ? `${unreadAlertsCount} ACTIVE ADVISORIES` : 'ALL SYSTEMS NOMINAL'}
          </span>
          <span className="text-polar-text-muted">|</span>
          <span className="text-polar-text-muted text-[11px]">
            {isBharati ? '69.408° S, 76.187° E' : '70.766° S, 11.740° E'}
          </span>
        </div>
      </div>

      {/* RIGHT: System Health, Satellite Link, Alerts, Theme, RBAC, Clock */}
      <div className="flex items-center gap-2 shrink-0">
        {/* System Health / Zero-Trust Security */}
        <button
          onClick={() => setIsSecurityOpen(true)}
          title="System Health & Zero-Trust Access Controls"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-polar-base border border-polar-border hover:border-polar-border-active text-polar-text-secondary text-xs transition-colors shrink-0"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="hidden xl:inline text-polar-text-muted">HEALTH:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">98.4%</span>
        </button>

        {/* Satellite Link Toggle */}
        <button
          onClick={onLinkToggle}
          title="Toggle Satellite Link state to test Edge Offline Buffering and Replay Sync"
          className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs transition-colors shrink-0 ${currLink.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${currLink.dot}`} />
          <Radio className="w-3.5 h-3.5" />
          <span className="font-semibold hidden lg:inline">{currLink.label}</span>
        </button>

        {/* Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          title="Open Operational Alerts Drawer"
          className="relative p-1.5 rounded-md bg-polar-base border border-polar-border text-polar-text-secondary hover:text-polar-text-primary hover:border-polar-border-active transition-colors shrink-0"
        >
          <Bell className="w-4 h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Global Light / Dark / System Theme Switcher */}
        <ThemeSwitcher />

        {/* RBAC Operator Role Switcher Dropdown */}
        <RoleSelector activeRole={activeRole} onRoleChange={onRoleChange} />

        {/* Authentication Login / Station Gateway Trigger */}
        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            title="Station Authentication & Identity Verification Portal"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-polar-base hover:bg-polar-surface border border-polar-border hover:border-polar-cyan/60 text-polar-text-secondary hover:text-polar-text-primary text-xs transition-colors shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 text-polar-cyan" />
            <span className="hidden xl:inline text-[11px] font-semibold">LOGIN</span>
          </button>
        )}

        {/* Scientific UTC Clock */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-polar-text-secondary bg-polar-base px-2 py-1 rounded-md border border-polar-border shrink-0">
          <Clock className="w-3.5 h-3.5 text-polar-text-muted" />
          <span className="font-semibold text-polar-text-primary">{utcTime || '12:00:00 UTC'}</span>
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
