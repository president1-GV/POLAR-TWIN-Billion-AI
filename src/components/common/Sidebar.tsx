import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Zap, 
  Truck, 
  CloudSnow, 
  AlertOctagon, 
  Radio, 
  Activity, 
  PlayCircle,
  Database
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

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange }) => {
  const navItems: Array<{ id: ScreenId; label: string; icon: any; tag?: string }> = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'digital-twin', label: '3D Digital Twin', icon: Box, tag: 'Three.js' },
    { id: 'energy', label: 'Microgrid & Energy', icon: Zap },
    { id: 'logistics', label: 'Supply Chain', icon: Truck },
    { id: 'meteorology', label: 'NCPOR Weather', icon: CloudSnow, tag: 'Live' },
    { id: 'simulation', label: 'What-If Simulator', icon: AlertOctagon },
    { id: 'edge', label: 'Edge Resilience', icon: Radio, tag: 'Offline' },
    { id: 'analytics', label: 'Observability & Audit', icon: Activity },
    { id: 'data-catalog', label: 'Data Lineage & Registry', icon: Database, tag: 'NCPOR' },
    { id: 'demo', label: '1-Click Killer Demo', icon: PlayCircle, tag: 'DEMO' },
  ];

  return (
    <aside className="w-64 bg-polar-900 border-r border-polar-750/80 flex flex-col justify-between py-4 select-none shrink-0">
      <div className="space-y-1 px-3">
        <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">
          Operational Views
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all ${
                isActive
                  ? 'bg-polar-600/60 text-polar-cyan border border-polar-cyan/50 shadow-sm shadow-polar-cyan/10'
                  : 'text-slate-400 hover:text-white hover:bg-polar-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-polar-cyan' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.tag && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    item.tag === 'DEMO'
                      ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-polar-800 text-slate-300 border border-polar-700'
                  }`}
                >
                  {item.tag}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-4 pt-4 border-t border-polar-800/80 space-y-2">
        <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <span>Backend Provider</span>
          <span className="text-emerald-400 font-semibold">Supabase Cloud</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 break-all">
          Ref: <span className="text-slate-400">fpoxnocbznagepusczkk</span>
        </div>
      </div>
    </aside>
  );
};
