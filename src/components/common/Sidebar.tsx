import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Zap, 
  Truck, 
  CloudSnow, 
  AlertOctagon, 
  Radio, 
  Activity, 
  Play, 
  Database,
  ChevronLeft,
  ChevronRight,
  Lock,
  ShieldAlert,
  Users,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ScreenId = 
  | 'landing'
  | 'command-center'
  | 'digital-twin'
  | 'energy'
  | 'logistics'
  | 'meteorology'
  | 'simulation'
  | 'automation'
  | 'edge'
  | 'analytics'
  | 'data-catalog'
  | 'demo'
  | 'admin'
  | 'officers'
  | 'login';

interface SidebarProps {
  currentScreen: ScreenId;
  onScreenChange: (screen: ScreenId) => void;
}

interface NavGroup {
  title: string;
  items: Array<{
    id: ScreenId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Grouped Navigation per Phase 5 Specification
  const groups: NavGroup[] = [
    {
      title: 'COMMAND & PERSONNEL',
      items: [
        { 
          id: 'admin', 
          label: 'Admin Mission Control', 
          icon: ShieldAlert, 
          badge: 'LVL-5', 
          badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/40' 
        },
        { 
          id: 'officers', 
          label: 'Station Officers Portal', 
          icon: Users, 
          badge: 'ROSTER', 
          badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40' 
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'digital-twin', label: '3D Digital Twin', icon: Box },
        { id: 'energy', label: 'Microgrid & Energy', icon: Zap },
        { id: 'logistics', label: 'Supply Chain', icon: Truck },
      ],
    },
    {
      title: 'ENVIRONMENT',
      items: [
        { id: 'meteorology', label: 'NCPOR Weather & Climate', icon: CloudSnow },
      ],
    },
    {
      title: 'SIMULATION',
      items: [
        { id: 'simulation', label: 'What-If Simulator', icon: AlertOctagon },
      ],
    },
    {
      title: 'SMART AUTOMATION',
      items: [
        { 
          id: 'automation', 
          label: 'Smart Automation', 
          icon: Cpu, 
          badge: 'CLOSED-LOOP', 
          badgeColor: 'bg-polar-cyan/15 text-polar-cyan border-polar-cyan/40' 
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { id: 'edge', label: 'Edge Resilience', icon: Radio },
        { id: 'data-catalog', label: 'Data Lineage', icon: Database },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'analytics', label: 'Observability & Audit', icon: Activity },
      ],
    },
    {
      title: 'DEMO / VALIDATION',
      items: [
        { 
          id: 'demo', 
          label: 'System Demonstration', 
          icon: Play, 
          badge: 'DEMO', 
          badgeColor: 'bg-polar-cyan/15 text-polar-cyan border-polar-cyan/40' 
        },
      ],
    },
  ];

  const { canAccessScreen } = useAuth();

  return (
    <aside
      className={`bg-polar-surface border-r border-polar-border flex flex-col justify-between py-3 select-none shrink-0 transition-all duration-200 font-mono z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Collapsible Toggle */}
      <div>
        <div className="px-3 pb-3 border-b border-polar-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-polar-cyan" />
              <span className="text-[10px] font-bold text-polar-text-muted tracking-widest uppercase">
                MISSION SYSTEMS
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-elevated transition-colors ml-auto focus:outline-none"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-3.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {groups.map((grp) => (
            <div key={grp.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-polar-text-muted uppercase">
                  {grp.title}
                </div>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                const isAllowed = canAccessScreen(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => onScreenChange(item.id)}
                    title={isCollapsed ? (isAllowed ? item.label : `${item.label} (Clearance Restricted)`) : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-polar-elevated text-polar-cyan border border-polar-cyan/40 shadow-sm'
                        : isAllowed
                        ? 'text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-elevated/60 border border-transparent'
                        : 'text-polar-text-muted/60 hover:text-polar-text-secondary hover:bg-polar-elevated/30 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-polar-cyan' : isAllowed ? 'text-polar-text-muted group-hover:text-polar-text-secondary' : 'text-polar-text-muted/40'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className={`truncate text-left ${!isAllowed ? 'line-through text-polar-text-muted/60' : ''}`}>
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center gap-1 shrink-0">
                        {!isAllowed && (
                          <Lock className="w-3 h-3 text-amber-500/70" />
                        )}
                        {item.badge && (
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border tracking-wider ${
                              item.badgeColor || 'bg-polar-elevated text-polar-text-muted border-polar-border'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info: Backend Connection Status */}
      <div className="px-3 pt-3 border-t border-polar-border">
        {!isCollapsed ? (
          <div className="p-2.5 rounded bg-polar-elevated border border-polar-border text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-polar-text-muted font-semibold uppercase tracking-wider">BACKEND</span>
              <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                CONNECTED
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Backend Connected">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
