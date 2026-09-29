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
  Server
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

  const groups: NavGroup[] = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
        { id: 'digital-twin', label: 'Digital Twin (3D)', icon: Box },
        { id: 'energy', label: 'Microgrid & Energy', icon: Zap },
        { id: 'logistics', label: 'Supply Chain', icon: Truck },
        { id: 'meteorology', label: 'Weather & Climate', icon: CloudSnow },
        { id: 'simulation', label: 'What-If Simulator', icon: AlertOctagon },
      ],
    },
    {
      title: 'RESILIENCE',
      items: [
        { id: 'edge', label: 'Edge Resilience', icon: Radio },
        { id: 'analytics', label: 'Observability & Audit', icon: Activity },
        { id: 'data-catalog', label: 'Data Lineage', icon: Database },
      ],
    },
    {
      title: 'SYSTEM',
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
      className={`bg-[#0B1220] border-r border-[#1E293B] flex flex-col justify-between py-3 select-none shrink-0 transition-all duration-200 font-mono ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header / Collapsible Toggle */}
      <div>
        <div className="px-3 pb-3 border-b border-[#1E293B] flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-bold text-slate-300 tracking-wider">
                NAVIGATION
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors ml-auto"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="p-2 space-y-4 overflow-y-auto">
          {groups.map((grp) => (
            <div key={grp.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
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
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-[#111827] text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="truncate text-left">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase border tracking-wider ${
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
      <div className="p-3 border-t border-[#1E293B]">
        {!isCollapsed ? (
          <div className="space-y-1 text-[10px]">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3 h-3 text-emerald-400" />
                Backend
              </span>
              <span className="text-emerald-400 font-semibold">Supabase Cloud</span>
            </div>
            <div className="text-slate-500 truncate">
              Ref: <span className="text-slate-400">fpoxnocbznagepusczkk</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title="Backend: Supabase Cloud (fpoxnocbznagepusczkk)">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
};
