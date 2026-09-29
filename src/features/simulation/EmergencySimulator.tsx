import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Zap, 
  Flame, 
  Activity, 
  ListOrdered,
  Sliders,
  CheckCircle2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DataFreshness } from '../../components/ui/DataFreshness';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

interface Props {
  stationId: string;
}

export const EmergencySimulator: React.FC<Props> = ({ stationId }) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('GENERATOR_FAILURE');
  const [simResult, setSimResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
  const [simTemp, setSimTemp] = useState<number>(-25.0);

  useEffect(() => {
    api.getScenarios().then(setScenarios).catch(console.error);
    handleRun('GENERATOR_FAILURE');
  }, [stationId]);

  const handleRun = async (key: string) => {
    setRunning(true);
    setApprovalStatus(null);
    try {
      const res = await api.runSimulation(key, stationId, simTemp);
      setSimResult(res);
      setSelectedScenarioKey(key);
    } catch (e) {
      console.error('Failed to run simulation:', e);
    } finally {
      setRunning(false);
    }
  };

  const handleReview = async (action: 'APPROVED' | 'REJECTED') => {
    if (!simResult) return;
    try {
      await api.reviewSimulation(
        simResult.simulation_id, 
        action, 
        `Operator review during what-if session at ${simTemp}°C`
      );
      setApprovalStatus(action);
    } catch (e) {
      console.error('Failed to review simulation:', e);
    }
  };

  const stationName = stationId === 'station_bharati' ? 'Bharati Station' : 'Maitri Station';

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto font-mono">
      {/* Header with Strict Simulation Distinction Banner */}
      <div className="bg-[#0B1220] border border-[#1E293B] p-4 rounded-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <span>DETERMINISTIC CONTINGENCY SIMULATION WORKSPACE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{stationName}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1 font-sans">
              EMERGENCY WHAT-IF SIMULATION & DECISION SUPPORT
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <DataFreshness isSimulation={true} />
            <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-purple-950/40 border border-purple-500/30 p-2.5 rounded text-xs flex items-center gap-2.5 text-purple-300">
          <HelpCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <span>
            <strong>SIMULATION MODE:</strong> The values below represent mathematical contingency projections. They are physically decoupled from live station microgrid operations.
          </span>
        </div>
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Select Operational Scenario to Model</span>
          <span className="text-[11px] text-slate-500">8 Deterministic Contingencies</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {scenarios.map((sc) => {
            const isSelected = selectedScenarioKey === sc.key;
            return (
              <button
                key={sc.key}
                onClick={() => handleRun(sc.key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-[#111827] border-cyan-500/60 text-white shadow-sm'
                    : 'bg-[#0B1220] border-[#1E293B] text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <div className="text-[10px] text-slate-500 uppercase">{sc.category}</div>
                <div className="text-xs font-bold mt-1 text-slate-200 truncate">{sc.name}</div>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <StatusBadge status={sc.default_severity || 'WARNING'} size="sm" showIcon={false} />
                  <span className="text-cyan-400 flex items-center gap-1 font-semibold">
                    <Play className="w-3 h-3" /> Run
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulation Results Workspace */}
      {simResult && (
        <div className="space-y-6">
          {/* Side-by-Side: Current Baseline vs Simulated Contingency */}
          <div className="bg-[#0B1220] border border-[#1E293B] p-5 rounded-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1E293B] pb-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 uppercase">ACTIVE CONTINGENCY RUN</span>
                <h3 className="text-base font-bold text-white">{simResult.scenario_name}</h3>
              </div>
              <div className="text-right text-xs text-slate-400">
                <span>Run ID: </span>
                <span className="text-cyan-400 font-mono">{simResult.simulation_id.slice(0, 12)}</span>
              </div>
            </div>

            {/* Baseline vs Simulated Metric Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Nominal State */}
              <div className="bg-[#111827] p-4 rounded-lg border border-[#1E293B] space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase">1. Baseline Nominal State</span>
                  <StatusBadge status="NOMINAL" size="sm" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Generation Capacity:</span>
                    <span className="text-white font-bold">250.0 kW (Primary Genset)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Station Demand:</span>
                    <span className="text-white">185.0 kW (Base + HVAC)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Spinning Reserve Margin:</span>
                    <span className="text-emerald-400 font-bold">26.0%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Habitat Indoor Climate:</span>
                    <span className="text-white">+21.5°C (Regulated)</span>
                  </div>
                </div>
              </div>

              {/* Simulated Post-Incident State */}
              <div className="bg-[#111827] p-4 rounded-lg border border-rose-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase">2. Post-Incident Simulated Impact</span>
                  <StatusBadge status="CRITICAL" size="sm" />
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Power Deficit:</span>
                    <span className="text-rose-400 font-bold">-{simResult.consequences.power_generation_deficit_kw ?? 185} kW</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Capacity Loss:</span>
                    <span className="text-rose-400 font-bold">{simResult.consequences.power_capacity_loss_pct ?? 74}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Thermal Buffer to Freeze (+5°C):</span>
                    <span className="text-amber-400 font-bold">{simResult.consequences.thermal_decay_hours_to_freeze ?? 14.0} hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Subsystems at Risk:</span>
                    <span className="text-slate-200">{simResult.consequences.systems_impacted_count ?? 3} Critical Systems</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Load Shedding Candidates */}
            {simResult.consequences.load_shed_order && (
              <div className="bg-[#111827] p-4 rounded-lg border border-[#1E293B] space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>Prioritized Load Shedding Sequence (Preserves Life-Support & Water RO)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  {simResult.consequences.load_shed_order.map((item: any) => (
                    <div key={item.asset_id} className="p-2.5 rounded bg-[#0B1220] border border-[#1E293B] flex items-center justify-between">
                      <div>
                        <span className="text-slate-200 font-bold">{item.name}</span>
                        <div className="text-[10px] text-slate-500">Priority #{item.shed_priority}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                        SHED #{item.shed_priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explainable Decision Support & Human-in-the-Loop Operator Review */}
          <div className="bg-[#0B1220] border border-[#1E293B] p-5 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Operational Decision Support & Mitigation Protocol
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Human-in-the-Loop Approval Required</span>
            </div>

            <div className="space-y-3">
              {simResult.recommendations?.map((rec: any, idx: number) => (
                <div key={idx} className="bg-[#111827] p-3.5 rounded-lg border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">Action #{rec.step}:</span>
                      <span className="text-white font-semibold">{rec.action}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1 font-sans">
                      {rec.rationale}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase">Estimated Recovery</span>
                    <div className="font-bold text-emerald-400 text-sm">{rec.estimated_recovery_hours} hrs</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Operator Approval / Rejection Controls */}
            <div className="pt-2 border-t border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                {approvalStatus === 'APPROVED' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Mitigation Plan Authorized by Duty Operator. Stabilizing simulation microgrid.
                  </span>
                ) : approvalStatus === 'REJECTED' ? (
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Mitigation Rejected. Operator opted for manual contingency override.
                  </span>
                ) : (
                  <span>Review recommendations above and authorize automated mitigation sequence:</span>
                )}
              </div>

              {!approvalStatus && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReview('REJECTED')}
                    className="px-3.5 py-1.5 rounded bg-[#111827] hover:bg-[#1E293B] text-slate-300 border border-[#1E293B] text-xs transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleReview('APPROVED')}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors shadow"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve & Enact Mitigation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
