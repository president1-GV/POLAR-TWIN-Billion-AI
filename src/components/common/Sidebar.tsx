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
  Server,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export type ScreenId = 
  | 'command-center'
  | 'digital-twin'
  | 'energy'
  | 'logistics'
  | 'meteorology'
  | 'simulation'
  | 'edge'
  | 'analytics'
  | 'data-catalog'
  | 'demo';

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
          badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40' 
        },
      ],
    },
  ];

  return (
    <aside
      className={`bg-[#07111D] border-r border-[#1E293B] flex flex-col justify-between py-3 select-none shrink-0 transition-all duration-200 font-mono z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Header / Collapsible Toggle */}
      <div>
        <div className="px-3 pb-3 border-b border-[#1E293B] flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                MISSION SYSTEMS
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#0A1422] transition-colors ml-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-3.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {groups.map((grp) => (
            <div key={grp.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-0.5 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                  {grp.title}
                </div>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onScreenChange(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#0A1422] text-[#38BDF8] border border-[#38BDF8]/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-[#0A1422]/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-[#38BDF8]' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-left">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border tracking-wider shrink-0 ${
                          item.badgeColor || 'bg-[#1E293B] text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info: Backend Provider */}
      <div className="px-3 pt-3 border-t border-[#1E293B]">
        {!isCollapsed ? (
          <div className="p-2.5 rounded bg-[#0A1422] border border-[#1E293B] space-y-1.5 text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-semibold uppercase tracking-wider">BACKEND</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SUPABASE
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[9px] truncate">
              ref: fpoxnocbznagepusczkk
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Supabase Backend Connected">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
};
