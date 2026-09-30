// ============================================================================
// POLAR-TWIN: High-Precision Accessible Mission Control Role Selector
// POLAR-TWIN — Indian Antarctic Research Stations (Bharati & Maitri)
// Robust Multi-Role Switcher & Zero-Trust Operator Identity Selector
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Shield, 
  ChevronDown, 
  Check, 
  Lock, 
  User, 
  ShieldAlert, 
  Radio, 
  Globe, 
  Compass, 
  Info,
  LogIn,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { PolarRole, CANONICAL_ROLES, getRoleMeta } from '../../services/rbac';
import { ROLE_CREDENTIALS } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ScreenId } from './Sidebar';

interface RoleSelectorProps {
  activeRole: string;
  onRoleChange: (newRole: string) => void;
  onNavigate?: (screen: ScreenId, officerId?: string) => void;
  onOpenLogin?: () => void;
  className?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  activeRole,
  onRoleChange,
  onNavigate,
  onOpenLogin,
  className = '',
}) => {
  const { user, allowedRoles, switchRole, impersonate, stopImpersonating, isImpersonating } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const activeMeta = getRoleMeta(activeRole);

  // Close dropdown on outside click with delayed listener to avoid synthetic race conditions
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Attach on the next tick so the click that opened the dropdown does not immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isOpen]);

  // Keyboard navigation inside dropdown
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
          const currentIndex = CANONICAL_ROLES.findIndex((r) => r === activeMeta.canonicalId);
          setFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % CANONICAL_ROLES.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + CANONICAL_ROLES.length) % CANONICAL_ROLES.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < CANONICAL_ROLES.length) {
            const selectedRole = CANONICAL_ROLES[focusedIndex];
            handleSelect(selectedRole);
          }
          break;
        case 'Tab':
          setIsOpen(false);
          break;
        default:
          break;
      }
    },
    [isOpen, focusedIndex, activeMeta.canonicalId]
  );

  const handleSelect = async (selectedRole: PolarRole) => {
    try {
      const isCurrentlyAdmin = user?.role === 'ADMIN' || activeMeta.canonicalId === 'ADMIN' || isImpersonating;
      if (isCurrentlyAdmin) {
        if (selectedRole === 'ADMIN') {
          await stopImpersonating();
          onRoleChange('ADMIN');
        } else {
          const creds = ROLE_CREDENTIALS[selectedRole];
          if (creds) {
            await impersonate(creds.username);
            onRoleChange(selectedRole);
          } else {
            await switchRole(selectedRole);
            onRoleChange(selectedRole);
          }
        }
      } else {
        await switchRole(selectedRole);
        onRoleChange(selectedRole);
      }
      if (onNavigate) {
        if (selectedRole === 'ADMIN') {
          onNavigate('admin');
        } else {
          onNavigate('officers', selectedRole.toLowerCase());
        }
      }
    } catch (err) {
      console.error('Error switching operational role:', err);
    } finally {
      setIsOpen(false);
    }
  };

  const handleOpenCurrentConsole = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onNavigate) {
      if (activeMeta.id === 'ADMIN' || activeMeta.canonicalId === 'ADMIN') {
        onNavigate('admin');
      } else {
        onNavigate('officers', activeMeta.canonicalId.toLowerCase());
      }
    } else {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative inline-block text-left select-none ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger Button with 1-Click Page Navigate + Menu Chevron */}
      <div
        className={`inline-flex items-center rounded-md border text-xs font-medium transition-all duration-150 shrink-0 whitespace-nowrap select-none shadow-sm ${
          isOpen
            ? 'bg-polar-surface border-polar-cyan/60 ring-1 ring-cyan-500/30'
            : 'bg-polar-base hover:bg-polar-surface border-polar-border hover:border-polar-border-active'
        }`}
      >
        {/* Direct Click to Admin / Officer Console */}
        <button
          type="button"
          onClick={handleOpenCurrentConsole}
          aria-label={`Open ${activeMeta.label} page`}
          title={`Click to open ${activeMeta.label} page & workspace (or click arrow to switch role)`}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 hover:bg-polar-elevated/80 transition-colors cursor-pointer"
        >
          <span 
            className="w-2 h-2 rounded-full animate-pulse shrink-0" 
            style={{ backgroundColor: activeMeta.accentColor }} 
          />
          <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: activeMeta.accentColor }} />
          
          <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
            <span className="font-semibold text-polar-text-primary tracking-wide whitespace-nowrap">
              {activeMeta.shortLabel}
            </span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono whitespace-nowrap ${activeMeta.badgeClass}`}>
              {activeMeta.clearanceBadge}
            </span>
          </div>
        </button>

        {/* Dropdown Chevron Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          title="Switch operational identity or select station officer"
          className="px-1.5 py-1 sm:py-1.5 border-l border-polar-border/60 hover:bg-polar-elevated/80 text-polar-text-muted hover:text-polar-cyan transition-colors cursor-pointer"
        >
          <ChevronDown 
            className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-polar-cyan' : ''
            }`} 
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1.5 w-80 rounded-lg bg-polar-card/98 backdrop-blur-md border border-polar-border shadow-2xl z-50 overflow-hidden"
        >
          {/* Quick Launch Console Action Banner */}
          <div className="p-2 border-b border-polar-border bg-cyan-950/40">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onNavigate) {
                  if (activeMeta.id === 'ADMIN' || activeMeta.canonicalId === 'ADMIN') {
                    onNavigate('admin');
                  } else {
                    onNavigate('officers', activeMeta.canonicalId.toLowerCase());
                  }
                }
              }}
              className="w-full py-2 px-3 rounded-md bg-polar-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all uppercase tracking-wide cursor-pointer active:scale-98"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>LAUNCH {activeMeta.label.toUpperCase()} CONSOLE</span>
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          </div>
          {/* Header Panel */}
          <div className="p-3 border-b border-polar-border bg-polar-base/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-wider text-polar-text-muted uppercase">
                Zero-Trust Operational Identity
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                STATION-RBAC
              </span>
            </div>
            
            {user && (
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-700/50 flex items-center justify-center text-xs font-bold text-cyan-300 shrink-0">
                    {user.display_name ? user.display_name.charAt(0) : 'O'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-polar-text-primary truncate">
                      {user.display_name || 'Station Duty Officer'}
                    </p>
                    <p className="text-[10px] text-polar-text-muted truncate">
                      {user.station_id === 'station_bharati' ? 'Bharati Station (Larsemann Hills)' : user.station_id === 'station_maitri' ? 'Maitri Station (Schirmacher)' : 'NCPOR Headquarters (Global)'}
                    </p>
                  </div>
                </div>

                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      onOpenLogin();
                    }}
                    title="Open Full Station Authentication Portal"
                    className="px-2 py-1 rounded bg-polar-surface hover:bg-polar-elevated border border-polar-border hover:border-polar-cyan/60 text-polar-text-secondary hover:text-polar-text-primary text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <LogIn className="w-3 h-3 text-polar-cyan" />
                    <span>LOGIN</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Role Selection Note */}
          <div className="px-3 py-1.5 bg-polar-base/40 border-b border-polar-border/50 flex items-center justify-between text-[10px] text-polar-text-muted font-mono">
            <span>SWITCH OPERATIONAL IDENTITY:</span>
            <span className="text-polar-cyan font-semibold">CLICK TO ACTIVATE</span>
          </div>

          {/* Role Options Listbox */}
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={`role-option-${focusedIndex}`}
            className="py-1 max-h-72 overflow-y-auto divide-y divide-polar-border/30"
          >
            {CANONICAL_ROLES.map((roleKey, idx) => {
              const meta = getRoleMeta(roleKey);
              const isActive = meta.canonicalId === activeMeta.canonicalId;
              const isAllowed = true;
              const isFocused = idx === focusedIndex;

              return (
                <li
                  key={roleKey}
                  id={`role-option-${idx}`}
                  role="option"
                  aria-selected={isActive}
                  aria-disabled={!isAllowed}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelect(roleKey);
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`px-3 py-2.5 transition-colors cursor-pointer flex flex-col gap-1 ${
                    isActive
                      ? 'bg-polar-surface/90 border-l-2'
                      : isFocused
                      ? 'bg-polar-surface/50'
                      : 'hover:bg-polar-surface/30'
                  }`}
                  style={{
                    borderLeftColor: isActive ? meta.accentColor : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-5 h-5 rounded flex items-center justify-center text-xs"
                        style={{ 
                          backgroundColor: `${meta.accentColor}20`, 
                          color: meta.accentColor 
                        }}
                      >
                        <Shield className="w-3 h-3" />
                      </div>
                      <span className={`text-xs font-bold ${isActive ? 'text-polar-text-primary' : 'text-polar-text-secondary'}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold border ${meta.badgeClass}`}>
                        {meta.clearanceBadge}
                      </span>
                      {isActive ? (
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                      ) : null}
                    </div>
                  </div>

                  <p className="text-[11px] text-polar-text-muted leading-relaxed pl-7">
                    {meta.description}
                  </p>

                  <div className="flex items-center gap-2 pl-7 mt-0.5 text-[10px] text-polar-text-muted font-mono">
                    <span className="flex items-center gap-1">
                      {meta.primaryStationScope === 'ALL_STATIONS' ? (
                        <>
                          <Globe className="w-3 h-3 text-purple-400" />
                          <span>Scope: All Antarctic Stations</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3 h-3 text-cyan-400" />
                          <span>Scope: Station-Designated Only</span>
                        </>
                      )}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Footer Notice & Login Link */}
          <div className="p-2.5 border-t border-polar-border bg-polar-base/80 text-[10px] text-polar-text-muted flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Info className="w-3 h-3 text-polar-cyan" />
              RBAC/ABAC Zero-Trust
            </span>
            {onOpenLogin ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenLogin();
                }}
                className="font-mono text-[9px] text-polar-cyan hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-2.5 h-2.5" />
                <span>SESSION PORTAL</span>
              </button>
            ) : (
              <span className="font-mono text-[9px] text-emerald-400">
                SUPABASE SESSION ENFORCED
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
