import React, { useState } from 'react';
import { WhatIfScenario, WhatIfScenarioStep } from '../types';
import { 
  AlertTriangle, 
  X, 
  Play, 
  RotateCcw, 
  Clock, 
  Zap, 
  Thermometer, 
  Droplet, 
  ShieldAlert,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { ProvenanceBadge } from '../../../components/common/ProvenanceBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  stationId: string;
  onApplyScenario: (scenario: WhatIfScenario, activeStep: WhatIfScenarioStep) => void;
  onResetScenario: () => void;
  activeScenarioId?: string | null;
}

export const SCENARIOS: WhatIfScenario[] = [
  {
    id: 'scen_genset_trip',
    title: 'Primary Genset 01 Mechanical Trip & Cold Soak',
    description: 'Catastrophic bearing seizure on Primary Genset 01. Trips main 415V busbar, requiring emergency sync to Auxiliary Genset 02 and severe non-essential load shedding.',
    triggerAssetId: 'bh_gen_01',
    defaultAmbientTempC: -22.5,
    steps: [
      {
        timeOffsetHours: 0,
        timeLabel: 'T + 0.0H (Trip Event)',
        powerDeficitKw: 185.0,
        indoorTempC: 21.5,
        waterRemainingLiters: 16500,
        affectedAssetIds: ['bh_gen_01', 'bh_pdb_01'],
        systemStatus: 'WARNING',
        summary: 'Primary Genset 01 drops from 1500 RPM to 0. Microgrid bus frequency dips to 47.8 Hz. BESS discharges to absorb transient shock.',
        recommendedAction: 'Verify BESS frequency support. Auto-command start sequence on Auxiliary Genset 02.',
      },
      {
        timeOffsetHours: 6,
        timeLabel: 'T + 6.0H (Thermal Decay)',
        powerDeficitKw: 90.0,
        indoorTempC: 13.8,
        waterRemainingLiters: 16200,
        affectedAssetIds: ['bh_gen_01', 'bh_pdb_01', 'bh_hvac_01', 'bh_water_01'],
        systemStatus: 'CRITICAL',
        summary: 'Waste heat recovery loop collapses. Indoor temperature decays towards +13.8°C. RO Desalination plant forced offline to conserve bus power.',
        recommendedAction: 'Isolate East Wing laboratories. Direct electrical trace heat to RO sea intake line.',
      },
      {
        timeOffsetHours: 12,
        timeLabel: 'T + 12.0H (Freeze Window)',
        powerDeficitKw: 90.0,
        indoorTempC: 5.2,
        waterRemainingLiters: 15400,
        affectedAssetIds: ['bh_gen_01', 'bh_pdb_01', 'bh_hvac_01', 'bh_water_01', 'bh_lab_01'],
        systemStatus: 'EMERGENCY',
        summary: 'Core habitat reaches critical +5.2°C freeze threshold. Risk of internal potable distribution pipe burst.',
        recommendedAction: 'Must sync Backup Genset 03 or declare station emergency protocol. Evacuate non-essential personnel to Habitat Core.',
      },
      {
        timeOffsetHours: 24,
        timeLabel: 'T + 24.0H (Critical Permafrost)',
        powerDeficitKw: 120.0,
        indoorTempC: -1.4,
        waterRemainingLiters: 12800,
        affectedAssetIds: ['bh_gen_01', 'bh_pdb_01', 'bh_hvac_01', 'bh_water_01', 'bh_lab_01', 'bh_comms_01'],
        systemStatus: 'EMERGENCY',
        summary: 'Interior habitat drops below 0°C. Severe line freeze-up. Satellite radome heater failure introduces telemetry attenuation.',
        recommendedAction: 'Station shelter-in-place mode. All power diverted to emergency life support and satellite uplink.',
      }
    ]
  },
  {
    id: 'scen_water_freeze',
    title: 'Snow Melt & RO Desalination Sea-Line Freeze',
    description: 'Blizzard-driven intake trace-heat circuit failure causes sea water intake line freeze-up, completely halting potable water production.',
    triggerAssetId: 'bh_water_01',
    defaultAmbientTempC: -26.0,
    steps: [
      {
        timeOffsetHours: 0,
        timeLabel: 'T + 0.0H (Line Freeze)',
        powerDeficitKw: 0.0,
        indoorTempC: 21.0,
        waterRemainingLiters: 16500,
        affectedAssetIds: ['bh_water_01'],
        systemStatus: 'WARNING',
        summary: 'Intake flow drops from 3,200 L/day to 0 L/day. RO high-pressure booster pump trips on suction pressure loss.',
        recommendedAction: 'Deploy engineering team to inspect heat trace junction box at coastal intake trestle.',
      },
      {
        timeOffsetHours: 12,
        timeLabel: 'T + 12.0H (Buffer Drawdown)',
        powerDeficitKw: 0.0,
        indoorTempC: 21.0,
        waterRemainingLiters: 15900,
        affectedAssetIds: ['bh_water_01'],
        systemStatus: 'WARNING',
        summary: 'Station consuming potable reserves at 1,200 L/day burn rate. Reserve capacity remaining: 13.2 days.',
        recommendedAction: 'Enforce Level-1 water rationing (disable laundry, restrict galley usage).',
      },
      {
        timeOffsetHours: 24,
        timeLabel: 'T + 24.0H (Reserve Warning)',
        powerDeficitKw: 0.0,
        indoorTempC: 21.0,
        waterRemainingLiters: 15300,
        affectedAssetIds: ['bh_water_01'],
        systemStatus: 'CRITICAL',
        summary: 'Intake pipe solid core freeze. Mechanical thaw coil required.',
        recommendedAction: 'Reroute heated diesel coolant loop to exterior thawing sleeve.',
      }
    ]
  },
  {
    id: 'scen_comms_severance',
    title: 'Extreme Katabatic Blizzard & Sat-Link Loss',
    description: 'Sustained 180 km/h blizzard winds cause antenna dish tracking loss and optical cable severed between Radome Tower and Core.',
    triggerAssetId: 'bh_comms_01',
    defaultAmbientTempC: -31.0,
    steps: [
      {
        timeOffsetHours: 0,
        timeLabel: 'T + 0.0H (Signal Severed)',
        powerDeficitKw: 0.0,
        indoorTempC: 20.5,
        waterRemainingLiters: 16500,
        affectedAssetIds: ['bh_comms_01'],
        systemStatus: 'CRITICAL',
        summary: 'C-band uplink signal drops from 14.8 dB to 0.0 dB. Remote mission control loses real-time telemetry stream.',
        recommendedAction: 'Station Edge PC activates autonomous store-and-forward buffer mode with CRC32 integrity verification.',
      },
      {
        timeOffsetHours: 12,
        timeLabel: 'T + 12.0H (Edge Autonomous Mode)',
        powerDeficitKw: 0.0,
        indoorTempC: 20.2,
        waterRemainingLiters: 15900,
        affectedAssetIds: ['bh_comms_01'],
        systemStatus: 'WARNING',
        summary: 'Station operating under complete edge autonomy. 14,200 telemetry packets buffered in local NVMe queue.',
        recommendedAction: 'Switch to HF dipole backup radio link (MA-SAT-01) for text summary dispatch to NCPOR Goa.',
      }
    ]
  }
];

export const WhatIfSimulationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  stationId,
  onApplyScenario,
  onResetScenario,
  activeScenarioId,
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [selectedStepIndex, setSelectedStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentScenario = SCENARIOS[selectedScenarioIndex] || SCENARIOS[0];
  const currentStep = currentScenario.steps[selectedStepIndex] || currentScenario.steps[0];
  const isCurrentlyActive = activeScenarioId === currentScenario.id;

  const handleApply = () => {
    onApplyScenario(currentScenario, currentStep);
  };

  const handleReset = () => {
    onResetScenario();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-mono select-none">
      <div className="w-full max-w-3xl bg-polar-surface border border-polar-border rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-polar-card border-b border-polar-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500 dark:text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-polar-text-primary tracking-wider">
                  PHYSICAL WHAT-IF CASCADE SIMULATOR
                </span>
                <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
              </div>
              <p className="text-[11px] text-polar-text-muted font-sans mt-0.5">
                First-principles coupled thermodynamic & electrical failure propagation modeling.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-polar-text-muted hover:text-polar-text-primary p-1.5 rounded-lg hover:bg-polar-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Scenario Selector */}
          <div>
            <label className="text-[11px] text-polar-text-muted uppercase tracking-wider block mb-2 font-bold">
              Select Failure Scenario:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {SCENARIOS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedScenarioIndex(idx);
                    setSelectedStepIndex(0);
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedScenarioIndex === idx
                      ? 'bg-polar-cyan/15 border-polar-cyan text-polar-cyan shadow-md ring-1 ring-polar-cyan/30'
                      : 'bg-polar-card border-polar-border text-polar-text-secondary hover:text-polar-text-primary hover:border-polar-border-strong'
                  }`}
                >
                  <span className="text-[10px] text-polar-text-muted uppercase block">Scenario {idx + 1}</span>
                  <span className="text-xs font-bold block mt-1 line-clamp-2 text-polar-text-primary">{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scenario Description */}
          <div className="bg-polar-card p-3 rounded-lg border border-polar-border text-xs text-polar-text-secondary">
            {currentScenario.description}
          </div>

          {/* Timeline Slider / Step Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-polar-text-muted uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-polar-cyan" />
                Cascading Progression Timeline:
              </span>
              <span className="text-xs text-polar-cyan font-bold bg-polar-card px-2 py-0.5 rounded border border-polar-border">
                {currentStep.timeLabel}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {currentScenario.steps.map((st, sIdx) => (
                <button
                  key={st.timeOffsetHours}
                  onClick={() => setSelectedStepIndex(sIdx)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedStepIndex === sIdx
                      ? st.systemStatus === 'EMERGENCY'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-500 dark:text-rose-300 ring-1 ring-rose-500/40'
                        : 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-polar-card border-polar-border text-polar-text-secondary hover:border-polar-border-strong'
                  }`}
                >
                  <span className="text-[10px] text-polar-text-muted block uppercase">Hour +{st.timeOffsetHours}</span>
                  <span className="text-xs font-bold block mt-0.5">{st.timeLabel.split(' ')[2]}</span>
                  <span className={`text-[10px] font-semibold mt-1 inline-block px-1.5 py-0.5 rounded ${
                    st.systemStatus === 'EMERGENCY' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20'
                  }`}>
                    {st.systemStatus}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Metrics Projection Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-polar-card p-3 rounded-lg border border-polar-border flex items-center gap-3">
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-polar-text-muted uppercase block">Grid Deficit</span>
                <span className="text-base font-bold text-rose-500 dark:text-rose-400">
                  {currentStep.powerDeficitKw > 0 ? `-${currentStep.powerDeficitKw} kW` : 'BALANCED'}
                </span>
              </div>
            </div>

            <div className="bg-polar-card p-3 rounded-lg border border-polar-border flex items-center gap-3">
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400">
                <Thermometer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-polar-text-muted uppercase block">Indoor Habitat Temp</span>
                <span className={`text-base font-bold ${
                  currentStep.indoorTempC <= 5 ? 'text-rose-500 dark:text-rose-400 animate-pulse' : 'text-amber-500 dark:text-amber-400'
                }`}>
                  {currentStep.indoorTempC.toFixed(1)} °C
                </span>
              </div>
            </div>

            <div className="bg-polar-card p-3 rounded-lg border border-polar-border flex items-center gap-3">
              <div className="p-2 rounded bg-sky-500/10 border border-sky-500/30 text-sky-500 dark:text-sky-400">
                <Droplet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-polar-text-muted uppercase block">Potable Water Reserves</span>
                <span className="text-base font-bold text-sky-500 dark:text-sky-400">
                  {currentStep.waterRemainingLiters.toLocaleString()} L
                </span>
              </div>
            </div>
          </div>

          {/* Failure Summary & Emergency Protocol */}
          <div className="space-y-3">
            <div className="bg-polar-card p-3.5 rounded-lg border border-polar-border">
              <span className="text-[10px] text-polar-text-muted uppercase font-bold tracking-wider block mb-1">
                Downstream Cascade Physics:
              </span>
              <p className="text-xs text-polar-text-secondary leading-relaxed font-sans">
                {currentStep.summary}
              </p>
            </div>

            <div className="bg-amber-500/10 p-3.5 rounded-lg border border-amber-500/30">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-wider block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                Recommended Operational Mitigation:
              </span>
              <p className="text-xs text-amber-700 dark:text-amber-200/90 leading-relaxed font-sans">
                {currentStep.recommendedAction}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-polar-card border-t border-polar-border flex items-center justify-between">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 bg-polar-elevated hover:bg-polar-hover text-polar-text-secondary hover:text-polar-text-primary rounded-lg text-xs font-semibold flex items-center gap-2 border border-polar-border transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Simulation</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-transparent hover:bg-polar-hover text-polar-text-secondary rounded-lg text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleApply();
                onClose();
              }}
              className="px-5 py-2 bg-polar-cyan hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-polar-cyan/30 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Drive 3D Digital Twin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
