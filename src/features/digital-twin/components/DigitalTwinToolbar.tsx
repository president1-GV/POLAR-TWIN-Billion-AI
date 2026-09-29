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
  Maximize2,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

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
  const { isDark, setTheme } = useTheme();
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-polar-surface/90 border border-polar-border rounded-xl shadow-2xl backdrop-blur-md font-mono select-none text-xs">
      {/* Mode Switcher Group */}
      <div className="flex items-center gap-1 bg-polar-card/80 p-1 rounded-lg border border-polar-border">
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
                  ? 'bg-polar-cyan/20 text-polar-cyan border border-polar-cyan/40 shadow-sm'
                  : 'text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-hover'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="w-[1px] h-6 bg-polar-border mx-1" />

      {/* Camera Presets Flyout */}
      <div className="relative">
        <button
          onClick={() => setIsPresetsOpen(!isPresetsOpen)}
          className="px-2.5 py-1.5 bg-polar-card hover:bg-polar-hover text-polar-text-secondary hover:text-polar-text-primary border border-polar-border rounded-lg flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
        >
          <Camera className="w-3.5 h-3.5 text-polar-cyan" />
          <span className="hidden sm:inline">Camera</span>
          <ChevronDown className="w-3 h-3 text-polar-text-muted" />
        </button>

        {isPresetsOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-52 bg-polar-surface border border-polar-border rounded-lg shadow-2xl py-1 z-40 backdrop-blur-md">
            <div className="px-3 py-1.5 border-b border-polar-border text-[10px] text-polar-text-muted font-bold uppercase tracking-wider">
              Camera Presets
            </div>
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  onCameraPreset(p.id);
                  setIsPresetsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-[11px] text-polar-text-secondary hover:bg-polar-hover hover:text-polar-cyan flex items-center justify-between transition-colors"
              >
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-6 bg-polar-border mx-1" />

      {/* Polar Lighting / Light Mode Control */}
      <div className="flex items-center gap-0.5 bg-polar-card/90 p-0.5 rounded-lg border border-polar-border">
        <button
          onClick={() => setTheme('light')}
          title="Switch 3D Model to Polar Daylight (Light Mode)"
          className={`px-2 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-semibold transition-all ${
            !isDark
              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-sm'
              : 'text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-hover'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Light</span>
        </button>
        <button
          onClick={() => setTheme('dark')}
          title="Switch 3D Model to Polar Night (Dark Mode)"
          className={`px-2 py-1.5 rounded-md flex items-center gap-1.5 text-[11px] font-semibold transition-all ${
            isDark
              ? 'bg-polar-cyan/20 text-polar-cyan border border-polar-cyan/40 shadow-sm'
              : 'text-polar-text-secondary hover:text-polar-text-primary hover:bg-polar-hover'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-polar-cyan" />
          <span className="hidden sm:inline">Dark</span>
        </button>
      </div>

      {/* Feature Toggles */}
      <button
        onClick={onToggleGrid}
        title="Toggle Ground Coordinate Grid"
        className={`p-2 rounded-lg border transition-all ${
          gridVisible
            ? 'bg-polar-cyan/20 text-polar-cyan border-polar-cyan/40'
            : 'bg-polar-card text-polar-text-secondary border-polar-border hover:text-polar-text-primary hover:bg-polar-hover'
        }`}
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleSnow}
        title="Toggle Atmospheric Snow Particles"
        className={`p-2 rounded-lg border transition-all ${
          snowVisible
            ? 'bg-polar-cyan/20 text-polar-cyan border-polar-cyan/40'
            : 'bg-polar-card text-polar-text-secondary border-polar-border hover:text-polar-text-primary hover:bg-polar-hover'
        }`}
      >
        <CloudSnow className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleFlow}
        title="Toggle Energy & Fluid Flow Paths"
        className={`p-2 rounded-lg border transition-all ${
          flowVisible
            ? 'bg-polar-cyan/20 text-polar-cyan border-polar-cyan/40'
            : 'bg-polar-card text-polar-text-secondary border-polar-border hover:text-polar-text-primary hover:bg-polar-hover'
        }`}
      >
        <GitFork className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleHumanScale}
        title="Toggle 1.8m Human Scale Reference"
        className={`p-2 rounded-lg border transition-all ${
          humanScaleVisible
            ? 'bg-polar-cyan/20 text-polar-cyan border-polar-cyan/40'
            : 'bg-polar-card text-polar-text-secondary border-polar-border hover:text-polar-text-primary hover:bg-polar-hover'
        }`}
      >
        <User className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onToggleMeasuring}
        title="Toggle Distance Measurement Tool (Click 2 Points)"
        className={`p-2 rounded-lg border transition-all ${
          measuringActive
            ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500 ring-1 ring-amber-500/40 animate-pulse'
            : 'bg-polar-card text-polar-text-secondary border-polar-border hover:text-polar-text-primary hover:bg-polar-hover'
        }`}
      >
        <Ruler className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onResetCamera}
        title="Reset Camera View"
        className="p-2 bg-polar-card hover:bg-polar-hover text-polar-text-secondary hover:text-polar-text-primary border border-polar-border rounded-lg transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-6 bg-polar-border mx-1" />

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
