import React, { useState } from 'react';
import { VisualMode, CameraPresetId } from '../types';
import { 
  Eye, 
  Layers, 
  Activity, 
  GitFork, 
  Flame, 
  Camera, 
  Grid, 
  CloudSnow, 
  User, 
  Ruler, 
  RotateCcw, 
  AlertTriangle,
  ChevronDown,
  Maximize2
} from 'lucide-react';

interface Props {
  visualMode: VisualMode;
  onVisualModeChange: (mode: VisualMode) => void;
  onCameraPreset: (preset: CameraPresetId) => void;
  gridVisible: boolean;
  onToggleGrid: () => void;
  snowVisible: boolean;
  onToggleSnow: () => void;
  flowVisible: boolean;
  onToggleFlow: () => void;
  humanScaleVisible: boolean;
  onToggleHumanScale: () => void;
  measuringActive: boolean;
  onToggleMeasuring: () => void;
  onOpenWhatIf: () => void;
  onResetCamera: () => void;
}

export const DigitalTwinToolbar: React.FC<Props> = ({
  visualMode,
  onVisualModeChange,
  onCameraPreset,
  gridVisible,
  onToggleGrid,
  snowVisible,
  onToggleSnow,
  flowVisible,
  onToggleFlow,
  humanScaleVisible,
  onToggleHumanScale,
  measuringActive,
  onToggleMeasuring,
  onOpenWhatIf,
  onResetCamera,
}) => {
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);

  const presets: Array<{ id: CameraPresetId; label: string }> = [
    { id: 'OVERVIEW', label: 'Station Overview' },
    { id: 'MAIN_BUILDING', label: 'Main Research Habitat' },
    { id: 'ENERGY', label: 'Energy Hub & Microgrid' },
    { id: 'WATER', label: 'Water Purification & RO' },
    { id: 'COMMS', label: 'Satellite Earth Terminal' },
    { id: 'FUEL', label: 'Bulk Fuel Storage Farm' },
    { id: 'LOGISTICS', label: 'Logistics, Snowcat & Helipad' },
    { id: 'SCIENCE', label: 'Atmospheric Science Lab' },
    { id: 'RESET', label: 'Reset Camera Position' },
  ];

  const modes: Array<{ id: VisualMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'REALISTIC', label: 'Realistic PBR', icon: Eye },
    { id: 'ENGINEERING', label: 'Engineering', icon: Layers },
    { id: 'TELEMETRY', label: 'Telemetry', icon: Activity },
    { id: 'DEPENDENCY', label: 'Dependencies', icon: GitFork },
    { id: 'THERMAL', label: 'Thermal IR', icon: Flame },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-[#0B1220]/90 border border-[#1E293B] rounded-xl shadow-2xl backdrop-blur-md font-mono select-none text-xs">
      {/* Mode Switcher Group */}
      <div className="flex items-center gap-1 bg-[#111827]/80 p-1 rounded-lg border border-[#1E293B]">
        {modes.map(m => {
          const Icon = m.icon;
          const isActive = visualMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onVisualModeChange(m.id)}
              title={`Switch to ${m.label} Mode`}
              className={`px-2.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all text-[11px] font-semibold ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#1E293B]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-6 bg-[#1E293B] mx-1" />

      {/* Camera Presets Flyout */}
      <div className="relative">
        <button
          onClick={() => setIsPresetsOpen(!isPresetsOpen)}
          className="px-2.5 py-1.5 bg-[#111827] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] rounded-lg flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Camera</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {isPresetsOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-52 bg-[#0B1220] border border-[#1E293B] rounded-lg shadow-2xl py-1 z-40 backdrop-blur-md">
            <div className="px-3 py-1.5 border-b border-[#1E293B] text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Camera Presets
            </div>
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  onCameraPreset(p.id);
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-slate-300 hover:bg-cyan-950/40 hover:text-cyan-300 flex items-center justify-between transition-colors"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Feature Toggles */}
      <button
        onClick={onToggleGrid}
        title="Toggle Ground Coordinate Grid"
        className={`p-2 rounded-lg border transition-all ${
          gridVisible
            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
            : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleSnow}
        title="Toggle Atmospheric Snow Particles"
        className={`p-2 rounded-lg border transition-all ${
          snowVisible
            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
            : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
      >
        <CloudSnow className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleFlow}
        title="Toggle Energy & Fluid Flow Paths"
        className={`p-2 rounded-lg border transition-all ${
          flowVisible
            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
            : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
      >
        <GitFork className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleHumanScale}
        title="Toggle 1.8m Human Scale Reference"
        className={`p-2 rounded-lg border transition-all ${
          humanScaleVisible
            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
            : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
      >
        <User className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleMeasuring}
        title="Toggle Distance Measurement Tool (Click 2 Points)"
        className={`p-2 rounded-lg border transition-all ${
          measuringActive
            ? 'bg-amber-950/60 text-amber-300 border-amber-500 ring-1 ring-amber-500/40 animate-pulse'
            : 'bg-[#111827] text-slate-400 border-[#1E293B] hover:text-slate-200'
        }`}
      >
        <Ruler className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onResetCamera}
        title="Reset Camera View"
        className="p-2 bg-[#111827] hover:bg-[#1E293B] text-slate-400 hover:text-white border border-[#1E293B] rounded-lg transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-6 bg-[#1E293B] mx-1" />

      {/* Emergency Simulation Trigger */}
      <button
        onClick={onOpenWhatIf}
        title="Open What-If Failure Cascade Simulator"
        className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg flex items-center gap-1.5 text-[11px] font-bold shadow-lg shadow-rose-900/30 transition-all"
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>What-If</span>
      </button>
    </div>
  );
};
