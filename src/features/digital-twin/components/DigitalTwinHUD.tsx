import React from 'react';
import { MeasurementResult, VisualMode } from '../types';
import { 
  Layers, 
  Compass, 
  Zap, 
  Thermometer, 
  Droplet, 
  Radio, 
  Ruler, 
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon
} from 'lucide-react';
import { ProvenanceBadge } from '../../../components/common/ProvenanceBadge';
import polarTwinIcon from '../../../assets/polar-twin-icon.png';
import { useTheme } from '../../../context/ThemeContext';

interface Props {
  stationId: string;
  visualMode: VisualMode;
  measurementResult?: MeasurementResult | null;
  measuringActive: boolean;
  onClearMeasurement?: () => void;
  activeSimulationTitle?: string | null;
  activeSimulationTimeLabel?: string | null;
  onResetSimulation?: () => void;
  healthScore?: number;
  generationKw?: number;
}

export const DigitalTwinHUD: React.FC<Props> = ({
  stationId,
  visualMode,
  measurementResult,
  measuringActive,
  onClearMeasurement,
  activeSimulationTitle,
  activeSimulationTimeLabel,
  onResetSimulation,
  healthScore = 96.5,
  generationKw = 185.0,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const isBharati = stationId === 'station_bharati';

  return (
    <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none font-mono select-none">
      {/* Primary Station Telemetry Banner */}
      <div className="bg-polar-surface/95 border border-polar-border p-3 rounded-xl shadow-2xl pointer-events-auto backdrop-blur-md max-w-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold tracking-wider">
            <Layers className="w-4 h-4 text-polar-cyan" />
            <span>3D PHYSICAL DIGITAL TWIN</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch 3D Model to Polar Daylight (Light Mode)" : "Switch 3D Model to Polar Night (Dark Mode)"}
              className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-polar-card hover:bg-polar-hover text-polar-text-secondary hover:text-polar-text-primary border border-polar-border transition-colors cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-3 h-3 text-amber-500" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3 h-3 text-polar-cyan" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-polar-card text-polar-text-secondary border border-polar-border">
              {visualMode} MODE
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-polar-border">
          <div className="flex items-center gap-3">
            <img 
              src={polarTwinIcon} 
              alt="POLAR-TWIN" 
              className="w-11 h-11 rounded-full object-contain border border-polar-cyan/60 shadow-md ring-2 ring-polar-cyan/20 shrink-0" 
            />
            <div>
              <h1 className="text-sm font-bold text-polar-text-primary tracking-wide">
                {isBharati ? 'BHARATI ANTARCTIC STATION' : 'MAITRI ANTARCTIC STATION'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-polar-text-secondary mt-0.5">
                <span className="flex items-center gap-1 font-mono">
                  <Compass className="w-3 h-3 text-polar-cyan" />
                  {isBharati ? '69° 24.41′ S, 76° 11.72′ E' : '70° 45′ 52″ S, 11° 44′ 03″ E'}
                </span>
                <span>•</span>
                <span>{isBharati ? 'Larsemann Hills (35m ASL)' : 'Schirmacher Oasis (50m ASL)'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-polar-elevated text-polar-cyan border border-polar-border font-mono">
                  EPSG:3031
                </span>
                <ProvenanceBadge 
                  type={isBharati ? 'DOCUMENTED' : 'RECONSTRUCTED'} 
                  size="sm"
                  className="py-0 text-[9px]"
                />
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-polar-text-muted uppercase block">Twin Health</span>
            <span className={`text-sm font-bold ${
              healthScore > 80 ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'
            }`}>
              {healthScore}%
            </span>
            <span className="text-[9px] text-polar-text-muted block mt-0.5 font-mono">
              PROV: REAL_PUBLIC
            </span>
          </div>
        </div>

        {/* Real-Time Facility Summary KPIs */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-polar-border text-[11px]">
          <div className="bg-polar-card p-1.5 rounded border border-polar-border">
            <span className="text-[9px] text-polar-text-muted uppercase block">Grid Power</span>
            <span className="font-bold text-polar-cyan">{generationKw} kW</span>
          </div>
          <div className="bg-polar-card p-1.5 rounded border border-polar-border">
            <span className="text-[9px] text-polar-text-muted uppercase block">Envelope</span>
            <span className="font-bold text-emerald-500 dark:text-emerald-400">+21.2°C</span>
          </div>
          <div className="bg-polar-card p-1.5 rounded border border-polar-border">
            <span className="text-[9px] text-polar-text-muted uppercase block">Sat Uplink</span>
            <span className="font-bold text-emerald-500 dark:text-emerald-400">14.8 dB</span>
          </div>
        </div>

        {/* Restrained Operational Status Legend */}
        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-polar-border text-[10px] text-polar-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> NORMAL
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> WARNING
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> CRITICAL
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" /> OFFLINE
          </span>
        </div>
      </div>

      {/* Active What-If Failure Simulation Banner */}
      {activeSimulationTitle && (
        <div className="bg-rose-950/90 border border-rose-500/50 p-3 rounded-xl shadow-2xl pointer-events-auto backdrop-blur-md max-w-md animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>WHAT-IF FAILURE MODE ACTIVE</span>
            </div>
            <span className="text-[10px] font-bold text-rose-200 bg-rose-900/60 px-2 py-0.5 rounded border border-rose-500/40">
              {activeSimulationTimeLabel}
            </span>
          </div>
          <p className="text-xs text-rose-200 mt-1 font-sans">
            {activeSimulationTitle}
          </p>
          <div className="mt-2 pt-2 border-t border-rose-500/30 flex items-center justify-between">
            <span className="text-[10px] text-rose-300/80">3D twin displaying cascaded starvation</span>
            {onResetSimulation && (
              <button
                onClick={onResetSimulation}
                className="px-2 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore Normal</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Measurement Tool Active Readout */}
      {measuringActive && (
        <div className="bg-amber-950/90 border border-amber-500/50 p-3 rounded-xl shadow-2xl pointer-events-auto backdrop-blur-md max-w-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>3D ENGINEERING MEASUREMENT</span>
            </div>
            {onClearMeasurement && (
              <button
                onClick={onClearMeasurement}
                className="text-[10px] text-amber-400 hover:text-white underline"
              >
                Clear
              </button>
            )}
          </div>

          {measurementResult ? (
            <div className="mt-2 space-y-1 text-xs">
              <div className="text-white font-bold text-sm">
                Distance: <span className="text-cyan-400">{measurementResult.distanceMeters} m</span>
              </div>
              <div className="text-[10px] text-slate-300 flex items-center gap-3">
                <span>ΔX: {measurementResult.deltaX}m</span>
                <span>ΔY: {measurementResult.deltaY}m</span>
                <span>ΔZ: {measurementResult.deltaZ}m</span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-amber-200/90 mt-1 font-sans">
              Click any 2 physical equipment objects or ground coordinates to calculate real distance.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
