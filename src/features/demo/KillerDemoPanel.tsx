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
  ArrowRight,
  HelpCircle,
  Box
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

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
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header */}
      <div className="bg-polar-card border border-polar-border p-5 rounded-lg space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-polar-cyan font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-polar-cyan animate-pulse" />
              <span>SIH 26060 MASTER DEMONSTRATION HARNESS</span>
            </div>
            <h2 className="text-xl font-bold text-polar-text-primary tracking-tight font-sans">
              CLOSED-LOOP DIGITAL TWIN SYSTEM DEMONSTRATION
            </h2>
            <p className="text-xs text-polar-text-secondary mt-1 max-w-2xl font-sans">
              Deterministic 8-step operational loop verifying real data ingestion, coupled physics, AI multivariate detection, what-if cascading consequences, and operator mitigation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoRun}
              disabled={isAutoPlaying}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-colors ${
                isAutoPlaying
                  ? 'bg-amber-600 text-white cursor-not-allowed animate-pulse'
                  : 'bg-polar-cyan hover:opacity-90 text-polar-base dark:text-black shadow-sm font-bold'
              }`}
            >
              <Play className="w-4 h-4" />
              {isAutoPlaying ? `EXECUTING STEP ${currentStepIndex}/8...` : 'RUN SYSTEM DEMONSTRATION'}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-polar-elevated hover:bg-polar-surface text-polar-text-secondary hover:text-polar-text-primary text-xs border border-polar-border transition-colors"
              title="Reset Station to Nominal Baseline"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Baseline</span>
            </button>
          </div>
        </div>

        {/* Demo Distinction Banner */}
        <div className="bg-polar-cyan/10 border border-polar-cyan/30 p-2.5 rounded text-xs flex items-center gap-2.5 text-polar-cyan">
          <HelpCircle className="w-4 h-4 text-polar-cyan flex-shrink-0" />
          <span>
            <strong>DEMO HARNESS:</strong> Injects calibrated telemetry sequences to test end-to-end station response, AI anomaly detection, and Human-in-the-Loop mitigation.
          </span>
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
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? 'bg-polar-elevated border-polar-cyan/70 text-polar-text-primary shadow-sm ring-1 ring-polar-cyan/50'
                  : isPassed
                  ? 'bg-polar-card border-emerald-500/40 text-polar-text-primary'
                  : 'bg-polar-base border-polar-border text-polar-text-muted opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className={isActive ? 'text-polar-cyan' : isPassed ? 'text-emerald-500 dark:text-emerald-400' : 'text-polar-text-muted'}>
                  STEP {st.step}
                </span>
                {isPassed && <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />}
              </div>
              <div className="text-[11px] font-bold mt-1 text-polar-text-primary line-clamp-1">{st.phase}</div>
              <div className="text-[9px] text-polar-text-secondary mt-1 line-clamp-2">{st.title}</div>
            </button>
          );
        })}
      </div>

      {/* Active Step Details & Telemetry Viewport */}
      {stepData && (
        <div className="bg-polar-card border border-polar-border p-5 rounded-lg space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-polar-border pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-polar-cyan font-bold uppercase tracking-wider">
                  PHASE: {steps[currentStepIndex - 1]?.phase} • STEP {currentStepIndex} OF 8
                </span>
              </div>
              <h3 className="text-lg font-bold text-polar-text-primary mt-1">
                {steps[currentStepIndex - 1]?.title}
              </h3>
              <p className="text-xs text-polar-text-secondary mt-2 max-w-3xl leading-relaxed font-sans">
                {steps[currentStepIndex - 1]?.description}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
              <span className="text-[10px] text-polar-text-muted">
                Bharati Station Incident Controller
              </span>
            </div>
          </div>

          {/* Dynamic Metrics Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {stepData.status && (
              <div className="bg-polar-elevated p-4 rounded-lg border border-polar-border">
                <span className="text-[10px] text-polar-text-muted uppercase">Operational State</span>
                <div className="text-base font-bold text-polar-cyan mt-1">{stepData.status}</div>
                <div className="text-[11px] text-polar-text-secondary mt-1">{stepData.message}</div>
              </div>
            )}

            {stepData.ambient_temp_c !== undefined && (
              <div className="bg-polar-elevated p-4 rounded-lg border border-polar-border">
                <span className="text-[10px] text-polar-text-muted uppercase">Atmospheric Condition</span>
                <div className="text-base font-bold text-polar-text-primary mt-1">
                  {stepData.ambient_temp_c} °C, {stepData.wind_speed_ms} m/s
                </div>
                <div className="text-[11px] text-polar-text-secondary mt-1">
                  Causal wind-chill loss factor: 1.28x
                </div>
              </div>
            )}

            {stepData.telemetry && (
              <div className="bg-polar-elevated p-4 rounded-lg border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase">Sensor Telemetry</span>
                <div className="text-polar-text-primary font-bold text-sm">
                  {stepData.telemetry.exhaust_temp_c}°C Exhaust, {stepData.telemetry.vibration_mms} mm/s Vib
                </div>
                <div className="text-[11px] text-polar-text-secondary">
                  Load: {stepData.telemetry.load_pct}%, Oil: {stepData.telemetry.oil_pressure_bar} bar
                </div>
              </div>
            )}
          </div>

          {/* Step Actions */}
          <div className="pt-2 border-t border-polar-border flex items-center justify-between">
            <span className="text-[11px] text-polar-text-secondary">
              {currentStepIndex < 8
                ? `Next Step: ${steps[currentStepIndex]?.title}`
                : 'All 8 Demonstration Steps Successfully Completed!'}
            </span>

            <div className="flex items-center gap-2">
              {onNavigateToTwin && (
                <button
                  onClick={onNavigateToTwin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-secondary hover:text-polar-text-primary text-xs border border-polar-border transition-colors"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspect 3D Twin</span>
                </button>
              )}

              {currentStepIndex < 8 && (
                <button
                  onClick={() => handleExecuteStep(currentStepIndex + 1)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-polar-cyan/15 hover:bg-polar-cyan/25 border border-polar-cyan/40 text-polar-cyan text-xs font-bold transition-colors"
                >
                  <span>Advance to Step {currentStepIndex + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
