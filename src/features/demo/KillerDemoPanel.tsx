import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  ChevronRight, 
  AlertTriangle, 
  Cpu, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  onNavigateToTwin?: () => void;
}

export const KillerDemoPanel: React.FC<Props> = ({ onNavigateToTwin }) => {
  const [steps, setSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [stepData, setStepData] = useState<any>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getDemoSteps().then(setSteps).catch(console.error);
    // Execute baseline step 1 on mount
    handleExecuteStep(1);
  }, []);

  const handleExecuteStep = async (stepNum: number) => {
    setLoading(true);
    try {
      const res = await api.executeDemoStep(stepNum);
      setStepData(res);
      setCurrentStepIndex(stepNum);
    } catch (e) {
      console.error(`Failed to execute step ${stepNum}:`, e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setIsAutoPlaying(false);
    await api.resetDemo();
    handleExecuteStep(1);
  };

  // Automated 1-click sequence runner
  const handleAutoRun = () => {
    setIsAutoPlaying(true);
    let step = 1;
    const interval = setInterval(async () => {
      step += 1;
      if (step > 8) {
        clearInterval(interval);
        setIsAutoPlaying(false);
      } else {
        await handleExecuteStep(step);
      }
    }, 3500);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-polar-900 border border-polar-750 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>SIH 26060 MASTER DEMONSTRATION HARNESS</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            CLOSED-LOOP DIGITAL TWIN DEMO: BHARATI INCIDENT & MITIGATION
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1 max-w-2xl">
            Deterministic 8-step operational loop verifying real data ingestion, coupled physics, AI multivariate detection, what-if cascading consequences, and operator mitigation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAutoRun}
            disabled={isAutoPlaying}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all shadow-lg ${
              isAutoPlaying
                ? 'bg-amber-600 text-white cursor-not-allowed animate-pulse'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            <Play className="w-4 h-4" />
            {isAutoPlaying ? `PLAYING STEP ${currentStepIndex}/8...` : 'RUN 1-CLICK KILLER DEMO'}
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-polar-800 hover:bg-polar-750 text-slate-300 text-xs font-mono border border-polar-700 transition-all"
            title="Reset Station to Nominal Baseline"
          >
            <RotateCcw className="w-4 h-4" /> Reset Baseline
          </button>
        </div>
      </div>

      {/* 8-Step Timeline Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {steps.map((st) => {
          const isActive = currentStepIndex === st.step;
          const isPassed = currentStepIndex > st.step;

          return (
            <button
              key={st.step}
              onClick={() => handleExecuteStep(st.step)}
              className={`p-3 rounded-lg border text-left font-mono transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-polar-750 border-polar-cyan text-white shadow-md shadow-polar-cyan/20 ring-1 ring-polar-cyan'
                  : isPassed
                  ? 'bg-polar-900 border-emerald-500/40 text-slate-300'
                  : 'bg-polar-950 border-polar-800 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className={isActive ? 'text-polar-cyan' : isPassed ? 'text-emerald-400' : 'text-slate-500'}>
                  STEP {st.step}
                </span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
              <div className="text-[11px] font-bold mt-1 text-slate-200 line-clamp-1">{st.phase}</div>
              <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">{st.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Details & Telemetry Viewport */}
      {stepData && (
        <div className="polar-panel p-6 space-y-6">
          <div className="flex items-start justify-between border-b border-polar-800 pb-4">
            <div>
              <span className="text-xs font-mono text-polar-cyan font-bold uppercase tracking-wider">
                ACTIVE PHASE: {steps[currentStepIndex - 1]?.phase} • STEP {currentStepIndex} OF 8
              </span>
              <h3 className="text-lg font-bold text-white font-mono mt-1">
                {steps[currentStepIndex - 1]?.title}
              </h3>
              <p className="text-xs font-mono text-slate-300 mt-2 max-w-3xl leading-relaxed">
                {steps[currentStepIndex - 1]?.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
              <span className="text-[10px] font-mono text-slate-400">
                Bharati Station Incident Controller
              </span>
            </div>
          </div>

          {/* Step Dynamic Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            {stepData.status && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-500">OPERATIONAL STATE</span>
                <div className="text-base font-bold text-polar-cyan mt-1">{stepData.status}</div>
                <div className="text-[11px] text-slate-400 mt-1">{stepData.message}</div>
              </div>
            )}

            {stepData.ambient_temp_c !== undefined && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-500">ATMOSPHERIC INJECTION</span>
                <div className="text-base font-bold text-white mt-1">
                  {stepData.ambient_temp_c} °C, {stepData.wind_speed_ms} m/s
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Heating Surge: {stepData.heating_demand_kw || 42} kW
                </div>
              </div>
            )}

            {stepData.telemetry && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] text-slate-500">SENSORY ANOMALY VALUES</span>
                <div className="text-base font-bold text-amber-400 mt-1">
                  Vib: {stepData.telemetry.vibration_mms} mm/s • Exh: {stepData.telemetry.exhaust_temp_c} °C
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  ISO Vibration Warning Limit: &gt; 4.5 mm/s
                </div>
              </div>
            )}

            {stepData.ai_result && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800 md:col-span-2">
                <span className="text-[10px] text-slate-500">AI MULTIVARIATE MAHALANOBIS DETECTOR</span>
                <div className="text-base font-bold text-red-400 mt-1">
                  Distance D_M = {stepData.ai_result.anomaly_score} (Threshold: {stepData.ai_result.threshold_warning})
                </div>
                <div className="mt-2 text-[11px] text-slate-300">
                  Feature Attribution: Vibration (+3.4σ elevated), Exhaust Gas (+3.1σ elevated).
                </div>
              </div>
            )}

            {stepData.consequences && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800 md:col-span-2">
                <span className="text-[10px] text-slate-500">CASCADING CONSEQUENCES</span>
                <div className="text-base font-bold text-red-400 mt-1">
                  Power Deficit: -{stepData.consequences.power_generation_deficit_kw} kW • Freeze Window: {stepData.consequences.thermal_decay_hours_to_freeze} hrs
                </div>
                <div className="text-[11px] text-amber-300 mt-1">
                  Snow melt potable water lines will freeze if auxiliary power is not engaged within 4.5 hours.
                </div>
              </div>
            )}

            {stepData.overall_station_health !== undefined && (
              <div className="bg-emerald-950/40 p-4 rounded-lg border border-emerald-500/40 md:col-span-3 flex items-center justify-between text-emerald-300">
                <div>
                  <div className="font-bold text-base text-white">
                    MISSION ACCOMPLISHED: STATION FULLY STABILIZED
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Auxiliary Genset 02 supplying 200 kW • East Wing Lab isolated • Indoor temperature at regulated +21.5°C.
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400">HEALTH RECOVERED</span>
                  <div className="text-2xl font-bold text-emerald-400">{stepData.overall_station_health}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-polar-800">
            <button
              onClick={() => handleExecuteStep(Math.max(1, currentStepIndex - 1))}
              disabled={currentStepIndex === 1}
              className="px-4 py-2 rounded bg-polar-800 hover:bg-polar-750 disabled:opacity-40 text-xs font-mono font-bold text-white transition-all"
            >
              Previous Step
            </button>

            <span className="text-xs font-mono text-slate-400">
              Step {currentStepIndex} of 8
            </span>

            <button
              onClick={() => handleExecuteStep(Math.min(8, currentStepIndex + 1))}
              disabled={currentStepIndex === 8}
              className="flex items-center gap-1.5 px-5 py-2 rounded bg-polar-600 hover:bg-polar-500 disabled:opacity-40 text-xs font-mono font-bold text-white transition-all shadow-md"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
