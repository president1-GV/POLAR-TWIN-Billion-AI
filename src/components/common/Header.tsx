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
import { ScreenId } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
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
  onNavigate?: (screen: ScreenId, officerId?: string) => void;
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
  onNavigate,
  onOpenStationDrawer,
  onOpenLogin,
}) => {
  const { user, role, isImpersonating, impersonatedBy, stopImpersonating, isStationAllowed } = useAuth();
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
    <div className="sticky top-0 z-40 w-full select-none font-mono">
      {/* Persistent Red Impersonation Alert Banner */}
      {isImpersonating && (
        <div className="bg-rose-600 text-white text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between shadow-lg border-b border-rose-500/80">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-2.5 h-2.5 rounded-full bg-white shrink-0 animate-ping" />
            <span className="font-extrabold tracking-wider whitespace-nowrap">⚠️ SECURITY AUDIT ACTIVE:</span>
            <span className="bg-black/30 px-2 py-0.5 rounded font-mono font-bold text-rose-100 truncate">
              IMPERSONATING: {user?.display_name || user?.username} [{role}]
            </span>
            <span className="text-[11px] text-rose-200 hidden md:inline truncate">
              (Station: {user?.station_id} | Initiator: {impersonatedBy || 'admin.ncpor'})
            </span>
          </div>
          <button
            onClick={() => stopImpersonating()}
            className="ml-3 bg-white hover:bg-rose-100 text-rose-800 text-[11px] font-black px-3 py-1 rounded shadow-sm transition-colors cursor-pointer shrink-0 uppercase tracking-wider active:scale-95"
          >
            STOP IMPERSONATION
          </button>
        </div>
      )}

      <header className="h-16 bg-polar-surface border-b border-polar-border px-2 sm:px-3 lg:px-4 xl:px-6 flex items-center justify-between shadow-sm transition-colors w-full max-w-full relative z-30">
        {/* LEFT: Branding & First-Class Station Context */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Brand Identity arranged cleanly inside dedicated professional border */}
          <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-polar-base/90 border border-polar-border hover:border-polar-border-active transition-colors shadow-sm shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-polar-elevated border border-polar-cyan/60 flex items-center justify-center p-0.5 shadow-sm ring-1 ring-polar-cyan/25 shrink-0 overflow-hidden">
              <img 
                src={polarTwinIcon} 
                alt="POLAR-TWIN Mission Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col justify-center shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 whitespace-nowrap leading-none">
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-polar-text-primary whitespace-nowrap inline-flex items-center">
                  POLAR<span className="text-polar-cyan">&#8209;TWIN</span>
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold tracking-wider uppercase shrink-0">
                  NCPOR
                </span>
              </div>
              <p className="text-[10px] text-polar-text-muted tracking-tight font-sans whitespace-nowrap mt-1 hidden sm:block">
                Indian Antarctic Operations
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 border-l border-polar-border hidden sm:block shrink-0" />

          {/* First-Class Station Selector */}
          <div className="flex items-center bg-polar-base rounded-lg p-0.5 border border-polar-border shrink-0 shadow-inner">
            <button
              onClick={() => onStationChange('station_bharati')}
              title="Switch to Bharati Station • Larsemann Hills (69.408° S, 76.187° E)"
              className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
                isBharati
                  ? 'bg-polar-elevated text-polar-cyan border border-polar-cyan/50 shadow-sm ring-1 ring-polar-cyan/25'
                  : 'text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-elevated/60'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isBharati ? 'bg-polar-cyan animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-500'}`} />
              <span className="whitespace-nowrap tracking-wide">BHARATI</span>
            </button>
            <button
              onClick={() => onStationChange('station_maitri')}
              title="Switch to Maitri Station • Schirmacher Oasis (70.766° S, 11.740° E)"
              className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap cursor-pointer ${
                !isBharati
                  ? 'bg-polar-elevated text-polar-cyan border border-polar-cyan/50 shadow-sm ring-1 ring-polar-cyan/25'
                  : 'text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-elevated/60'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!isBharati ? 'bg-polar-cyan animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-500'}`} />
              <span className="whitespace-nowrap tracking-wide">MAITRI</span>
            </button>
          </div>
        </div>

      {/* CENTER: Compact Operational State Indicator */}
      <div className="hidden 2xl:flex items-center shrink-0">
        <div 
          title={`Operational State: ${unreadAlertsCount > 0 ? `${unreadAlertsCount} Active ${unreadAlertsCount === 1 ? 'Advisory' : 'Advisories'}` : 'All Systems Nominal'} • Coordinates: ${isBharati ? '69.408° S, 76.187° E' : '70.766° S, 11.740° E'}`}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-polar-base border border-polar-border hover:border-polar-border-strong text-xs whitespace-nowrap shadow-sm transition-colors cursor-default"
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${unreadAlertsCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
          <span className="text-polar-text-muted text-[11px] font-semibold">STATE:</span>
          <span className={`font-semibold text-xs ${unreadAlertsCount > 0 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {unreadAlertsCount > 0 ? `${unreadAlertsCount} ${unreadAlertsCount === 1 ? 'ADVISORY' : 'ADVISORIES'}` : 'NOMINAL'}
          </span>
        </div>
      </div>

      {/* RIGHT: System Health, Satellite Link, Alerts, Theme, RBAC, Clock */}
      <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
        {/* System Health / Zero-Trust Security */}
        <button
          onClick={() => setIsSecurityOpen(true)}
          title="System Health & Zero-Trust Access Controls"
          className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md bg-polar-base hover:bg-polar-elevated border border-polar-border hover:border-polar-border-strong text-polar-text-secondary text-xs transition-colors shrink-0 whitespace-nowrap"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="hidden xl:inline text-polar-text-muted font-medium whitespace-nowrap">HEALTH:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">98.4%</span>
        </button>

        {/* Satellite Link Toggle */}
        <button
          onClick={onLinkToggle}
          title="Toggle Satellite Link state to test Edge Offline Buffering and Replay Sync"
          className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-md border text-xs transition-colors shrink-0 whitespace-nowrap ${currLink.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currLink.dot}`} />
          <Radio className="w-3.5 h-3.5 shrink-0" />
          <span className="font-bold hidden xl:inline whitespace-nowrap">{currLink.label}</span>
          <span className="font-bold inline xl:hidden whitespace-nowrap">{linkStatus === 'ONLINE' ? 'ONLINE' : 'LINK'}</span>
        </button>

        {/* Alerts Trigger */}
        <button
          onClick={onOpenAlerts}
          title="Open Operational Alerts Drawer"
          aria-label={`Operational Alerts: ${unreadAlertsCount} active`}
          className="relative p-1.5 rounded-md bg-polar-base hover:bg-polar-elevated border border-polar-border text-polar-text-secondary hover:text-polar-text-primary transition-colors shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {unreadAlertsCount}
            </span>
          )}
        </button>

        {/* Global Light / Dark / System Theme Switcher */}
        <div className="shrink-0">
          <ThemeSwitcher />
        </div>

        {/* RBAC Operator Role Switcher Dropdown */}
        <div className="shrink-0">
          <RoleSelector 
            activeRole={activeRole} 
            onRoleChange={onRoleChange} 
            onNavigate={onNavigate}
            onOpenLogin={onOpenLogin} 
          />
        </div>

        {/* Authentication Login / Station Gateway Trigger - Guaranteed Visible & Fully Clickable */}
        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            title="Station Authentication & Identity Verification Portal"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 font-bold text-xs transition-all shadow-sm shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5 text-polar-cyan shrink-0" />
            <span className="text-[11px] font-bold whitespace-nowrap">LOGIN</span>
          </button>
        )}

        {/* Scientific UTC Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-polar-text-secondary bg-polar-base px-2 py-1 rounded-md border border-polar-border shrink-0 whitespace-nowrap min-w-[95px]">
          <Clock className="w-3.5 h-3.5 text-polar-text-muted shrink-0" />
          <span className="font-bold text-polar-text-primary font-mono whitespace-nowrap">{utcTime || '12:00:00 UTC'}</span>
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
  </div>
  );
};
