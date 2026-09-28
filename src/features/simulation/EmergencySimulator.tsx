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
  ListOrdered 
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

interface Props {
  stationId: string;
}

export const EmergencySimulator: React.FC<Props> = ({ stationId }) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<string>('GENERATOR_FAILURE');
  const [simResult, setSimResult] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<string | null>(null);

  useEffect(() => {
    api.getScenarios().then(setScenarios).catch(console.error);
    // Initial run
    handleRun('GENERATOR_FAILURE');
  }, [stationId]);

  const handleRun = async (key: string) => {
    setRunning(true);
    setApprovalStatus(null);
    try {
      const res = await api.runSimulation(key, stationId);
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
      const res = await api.reviewSimulation(simResult.simulation_id, action, 'Operator review during what-if session');
      setApprovalStatus(action);
    } catch (e) {
      console.error('Failed to review simulation:', e);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>CRITICAL INCIDENT & CONTINGENCY SIMULATION ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-1">
            EMERGENCY WHAT-IF SIMULATION & DECISION SUPPORT
          </h2>
        </div>
        <ProvenanceBadge type="PHYSICS_SYNTHETIC" />
      </div>

      {/* Scenario Selector Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {scenarios.map((sc) => {
          const isSelected = selectedScenarioKey === sc.key;
          return (
            <button
              key={sc.key}
              onClick={() => handleRun(sc.key)}
              className={`p-3 rounded-lg border text-left font-mono transition-all ${
                isSelected
                  ? 'bg-amber-950/50 border-amber-500 text-white shadow-md shadow-amber-500/10'
                  : 'bg-polar-900 border-polar-750 text-slate-400 hover:text-white hover:bg-polar-800'
              }`}
            >
              <div className="text-[10px] text-slate-500 uppercase">{sc.category}</div>
              <div className="text-xs font-bold mt-1 text-slate-200">{sc.name}</div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span className={`px-1.5 py-0.5 rounded font-bold ${
                  sc.default_severity === 'CRITICAL' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                }`}>
                  {sc.default_severity}
                </span>
                <span className="text-polar-cyan flex items-center gap-1">
                  <Play className="w-3 h-3" /> Simulate
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Simulation Results Workspace */}
      {simResult && (
        <div className="space-y-6">
          {/* Quantitative Downstream Impact */}
          <div className="polar-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-polar-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">ACTIVE SCENARIO RUN</span>
                <h3 className="text-base font-bold text-white font-mono">{simResult.scenario_name}</h3>
              </div>
              <div className="text-right text-xs font-mono text-slate-400">
                <span>Simulation ID: </span>
                <span className="text-polar-cyan">{simResult.simulation_id.slice(0, 8)}...</span>
              </div>
            </div>

            {/* Impact Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] font-mono text-slate-500">POWER DEFICIT</span>
                <div className="text-2xl font-mono font-bold text-red-400 mt-1">
                  -{simResult.consequences.power_generation_deficit_kw ?? 0} kW
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Capacity Loss: <strong>{simResult.consequences.power_capacity_loss_pct ?? 0}%</strong>
                </div>
              </div>

              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] font-mono text-slate-500">THERMAL BUFFER TO FREEZE</span>
                <div className="text-2xl font-mono font-bold text-amber-400 mt-1">
                  {simResult.consequences.thermal_decay_hours_to_freeze ?? 12.0} hrs
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Time until indoor habitat breaches +5°C
                </div>
              </div>

              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800">
                <span className="text-[10px] font-mono text-slate-500">CRITICAL SUBSYSTEMS AT RISK</span>
                <div className="text-2xl font-mono font-bold text-white mt-1">
                  {simResult.consequences.systems_impacted_count ?? 3} Systems
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  Potable Water RO, HVAC, Science Lab
                </div>
              </div>
            </div>

            {/* Ordered Load Shedding Sequence */}
            {simResult.consequences.load_shed_order && (
              <div className="bg-polar-950 p-4 rounded-lg border border-polar-800 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-400 uppercase flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" />
                  <span>RECOMMENDED LOAD SHEDDING SEQUENCE (PREVENT HABITAT FREEZE)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono pt-1">
                  {simResult.consequences.load_shed_order.map((item: any) => (
                    <div key={item.asset_id} className="p-2.5 rounded bg-polar-900 border border-polar-750 flex items-center justify-between">
                      <div>
                        <span className="text-slate-300 font-bold">{item.name}</span>
                        <div className="text-[10px] text-slate-500">Priority #{item.shed_priority}</div>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        SHED CANDIDATE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explainable Mitigation & Operator Review Workflow */}
          <div className="polar-panel p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-polar-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">HUMAN-IN-THE-LOOP OPERATOR REVIEW</span>
                <h3 className="text-sm font-mono font-bold text-white">
                  Explainable Automated Mitigation Recommendations
                </h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950 px-2.5 py-1 rounded border border-amber-800">
                OPERATOR AUTHORIZATION REQUIRED
              </span>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {simResult.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className="bg-polar-950 p-4 rounded-lg border border-polar-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-polar-800 border border-polar-700 text-polar-cyan font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {rec.priority || idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-mono font-bold text-white">{rec.title}</h4>
                    <p className="text-xs font-mono text-slate-400 mt-1">{rec.rationale}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>

            {/* Approval Controls */}
            {approvalStatus ? (
              <div className={`p-4 rounded-lg border flex items-center justify-between ${
                approvalStatus === 'APPROVED' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : 'bg-red-950/60 border-red-500 text-red-300'
              }`}>
                <div className="flex items-center gap-2 font-mono text-xs font-bold">
                  {approvalStatus === 'APPROVED' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  <span>
                    MITIGATION {approvalStatus}: Simulated stabilization executed on station microgrid. Audit log entry recorded.
                  </span>
                </div>
                <button
                  onClick={() => handleRun(selectedScenarioKey)}
                  className="px-3 py-1 rounded bg-polar-900 border border-polar-700 text-xs font-mono text-white hover:bg-polar-800"
                >
                  Simulate Again
                </button>
              </div>
            ) : (
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReview('REJECTED')}
                  className="px-4 py-2 rounded-lg bg-polar-800 hover:bg-polar-700 text-slate-300 text-xs font-mono font-bold transition-all border border-polar-700"
                >
                  REJECT MITIGATION
                </button>
                <button
                  onClick={() => handleReview('APPROVED')}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md shadow-emerald-600/20"
                >
                  APPROVE SIMULATED MITIGATION
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
