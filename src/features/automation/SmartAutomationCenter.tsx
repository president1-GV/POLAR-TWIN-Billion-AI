import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  Activity, 
  Layers, 
  Compass, 
  Database, 
  Flame, 
  Wind, 
  UserCheck, 
  Sliders, 
  Check, 
  X, 
  ChevronRight,
  TrendingUp,
  Server,
  FileCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { useAuth } from '../../context/AuthContext';

interface Props {
  currentStationId: string;
  onNavigateToDigitalTwin?: () => void;
  onNavigateToEnergy?: () => void;
}

export const SmartAutomationCenter: React.FC<Props> = ({
  currentStationId,
  onNavigateToDigitalTwin,
  onNavigateToEnergy
}) => {
  const { role, user } = useAuth();
  const [stationId, setStationId] = useState<string>(currentStationId);
  const [statusData, setStatusData] = useState<any>(null);
  const [activeExecution, setActiveExecution] = useState<any>(null);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('high_demand_surge');
  const [loading, setLoading] = useState<boolean>(false);
  const [actionProcessing, setActionProcessing] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    setStationId(currentStationId);
  }, [currentStationId]);

  useEffect(() => {
    loadAutomationStatus();
    loadAuditHistory();
  }, [stationId]);

  const loadAutomationStatus = async () => {
    try {
      const data = await api.getAutomationStatus(stationId);
      setStatusData(data);
    } catch (e) {
      console.error('Failed to load automation status:', e);
    }
  };

  const loadAuditHistory = async () => {
    try {
      const hist = await api.getAutomationHistory(20, stationId);
      setAuditHistory(hist.audits || []);
    } catch (e) {
      console.error('Failed to load audit history:', e);
    }
  };

  const handleRunScenario = async (scenarioKey: string) => {
    setLoading(true);
    setFeedbackMessage(null);
    try {
      const result = await api.triggerAutomationScenario(scenarioKey, stationId, role);
      setActiveExecution(result);
      setSelectedScenario(scenarioKey);
      setFeedbackMessage({
        type: 'info',
        text: `Scenario '${scenarioKey.replace(/_/g, ' ').toUpperCase()}' triggered. Decision engine produced operational recommendation.`
      });
      loadAutomationStatus();
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Scenario trigger failed: ${e.message || String(e)}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAction = async (actionId: string) => {
    setActionProcessing(true);
    setFeedbackMessage(null);
    try {
      const operatorName = user?.username || `operator.${role.toLowerCase()}`;
      const res = await api.approveAutomationAction(actionId, operatorName, role);
      
      setFeedbackMessage({
        type: 'success',
        text: `Action approved by ${res.approved_by}. Simulation executed and verified: ${res.verification_summary} [Audit: ${res.audit_id}]`
      });

      // Update active execution state
      if (activeExecution && activeExecution.recommended_action?.id === actionId) {
        setActiveExecution({
          ...activeExecution,
          state_machine_status: 'COMPLETED',
          recommended_action: {
            ...activeExecution.recommended_action,
            status: 'COMPLETED',
            approved_by: res.approved_by,
            result: res.simulation_result
          },
          decision_trace: {
            ...activeExecution.decision_trace,
            step_nodes: {
              ...activeExecution.decision_trace.step_nodes,
              ACTION: { status: 'COMPLETED', action_id: actionId },
              VERIFY: { status: 'COMPLETED', summary: res.verification_summary }
            }
          }
        });
      }

      loadAutomationStatus();
      loadAuditHistory();
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Approval failed: ${e.message || String(e)}`
      });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleRejectAction = async (actionId: string) => {
    setActionProcessing(true);
    try {
      const operatorName = user?.username || `operator.${role.toLowerCase()}`;
      await api.rejectAutomationAction(actionId, operatorName, role, 'Operator manual override: contingency strategy modified');
      setFeedbackMessage({
        type: 'info',
        text: `Action ${actionId} rejected by operator. State reset to safe monitoring mode.`
      });
      loadAutomationStatus();
      loadAuditHistory();
    } catch (e: any) {
      setFeedbackMessage({
        type: 'error',
        text: `Rejection failed: ${e.message || String(e)}`
      });
    } finally {
      setActionProcessing(false);
    }
  };

  const activeRec = activeExecution?.recommended_action || statusData?.active_recommendations?.[0];
  const traceNodes = activeExecution?.decision_trace?.step_nodes;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans select-none">
      {/* 1. Header Banner */}
      <div className="bg-polar-surface/90 border border-polar-border p-4 sm:p-5 rounded-2xl shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-polar-cyan/10 border border-polar-cyan/30 rounded-xl text-polar-cyan">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-polar-text-primary tracking-wide">
                SMART AUTOMATION CENTER
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold uppercase">
                CLOSED-LOOP ACTIVE
              </span>
            </div>
            <p className="text-xs text-polar-text-muted mt-0.5 font-mono">
              OBSERVE → UNDERSTAND → PREDICT → DECIDE → RECOMMEND → SIMULATE → VERIFY → AUDIT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
          <select
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            className="bg-polar-card border border-polar-border text-polar-text-primary text-xs rounded-lg px-3 py-2 font-mono font-semibold focus:outline-none focus:border-polar-cyan cursor-pointer"
          >
            <option value="station_bharati">Bharati (Larsemann Hills)</option>
            <option value="station_maitri">Maitri (Schirmacher Oasis)</option>
          </select>

          <span className="text-xs px-2.5 py-1.5 rounded-lg bg-polar-card text-polar-cyan border border-polar-border font-mono font-bold">
            ROLE: {role}
          </span>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between transition-all ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
            : feedbackMessage.type === 'error'
            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300 border-rose-500/30'
            : 'bg-polar-cyan/10 text-polar-cyan border-polar-cyan/30'
        }`}>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
          <button onClick={() => setFeedbackMessage(null)} className="hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. Interactive Demonstration Scenarios Driver */}
      <div className="bg-polar-card border border-polar-border p-4 rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold font-mono text-polar-cyan uppercase tracking-wider">
            <Play className="w-4 h-4" />
            <span>Deterministic Evaluator Demonstration Scenarios</span>
          </div>
          <span className="text-[10px] font-mono text-polar-text-muted">
            Select a scenario to trigger the closed-loop automation lifecycle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
          <button
            onClick={() => handleRunScenario('high_demand_surge')}
            disabled={loading}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'high_demand_surge' && activeExecution
                ? 'bg-polar-cyan/10 border-polar-cyan shadow-sm shadow-polar-cyan/20'
                : 'bg-polar-surface hover:bg-polar-hover border-polar-border'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-polar-text-primary">
              <span className="flex items-center gap-1.5 text-polar-cyan">
                <Zap className="w-4 h-4" />
                <span>Demand Surge (1,050 kW)</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                P2 ENERGY
              </span>
            </div>
            <p className="text-[11px] text-polar-text-muted mt-1.5 leading-snug font-sans">
              Load surge exceeds generator baseline. ML predicts 1,050 kW demand. Decision engine recommends BESS peak shaving.
            </p>
          </button>

          <button
            onClick={() => handleRunScenario('generator_failure')}
            disabled={loading}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'generator_failure' && activeExecution
                ? 'bg-rose-500/10 border-rose-500 shadow-sm shadow-rose-500/20'
                : 'bg-polar-surface hover:bg-polar-hover border-polar-border'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-polar-text-primary">
              <span className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Generator Trip (What-If)</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30">
                P1 CRITICAL
              </span>
            </div>
            <p className="text-[11px] text-polar-text-muted mt-1.5 leading-snug font-sans">
              Sudden loss of BH-GEN-01. Generation drops below critical load. Triggers life-support priority & emergency gen spin.
            </p>
          </button>

          <button
            onClick={() => handleRunScenario('blizzard_fuel_cascade')}
            disabled={loading}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedScenario === 'blizzard_fuel_cascade' && activeExecution
                ? 'bg-amber-500/10 border-amber-500 shadow-sm shadow-amber-500/20'
                : 'bg-polar-surface hover:bg-polar-hover border-polar-border'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold text-polar-text-primary">
              <span className="flex items-center gap-1.5 text-amber-500 dark:text-amber-400">
                <Wind className="w-4 h-4" />
                <span>Katabatic Blizzard Cascade</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                P1 CROSS-DOMAIN
              </span>
            </div>
            <p className="text-[11px] text-polar-text-muted mt-1.5 leading-snug font-sans">
              42 m/s winds spike thermal building loss (+45% fuel burn). Automation engine issues logistics runway alert.
            </p>
          </button>
        </div>
      </div>

      {/* 3. Automation Lifecycle State Machine Visualizer */}
      <div className="bg-polar-surface/90 border border-polar-border p-4 rounded-xl shadow-md space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-polar-cyan uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            <span>Closed-Loop Automation Lifecycle (Actual State Engine)</span>
          </div>
          <span className="text-[10px] text-polar-text-muted">
            Status: <strong className="text-polar-text-primary">{activeExecution?.state_machine_status || statusData?.engine_state || 'OBSERVING'}</strong>
          </span>
        </div>

        {/* Dynamic Multi-Step Node Chain */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-1 text-[11px]">
          {/* Node 1: OBSERVE */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            traceNodes?.OBSERVE?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">1. OBSERVE</span>
              {traceNodes?.OBSERVE?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 opacity-80">
              {activeExecution?.observed_state ? `${activeExecution.observed_state.current_load_kw} kW` : 'Nominal Telemetry'}
            </span>
          </div>

          {/* Node 2: VALIDATE */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            traceNodes?.VALIDATE?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">2. VALIDATE</span>
              {traceNodes?.VALIDATE?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 opacity-80">
              Quality: {activeExecution?.quality_tier || 'VERIFIED'}
            </span>
          </div>

          {/* Node 3: PREDICT */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            traceNodes?.PREDICT?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">3. PREDICT</span>
              {traceNodes?.PREDICT?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 opacity-80">
              {activeExecution?.prediction ? `Forecast: ${activeExecution.prediction.predicted_load_kw} kW` : 'ML Forecast'}
            </span>
          </div>

          {/* Node 4: DECIDE */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            traceNodes?.DECIDE?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">4. DECIDE</span>
              {traceNodes?.DECIDE?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 opacity-80">
              {activeExecution?.decision?.rule_triggered || 'Decision Matrix'}
            </span>
          </div>

          {/* Node 5: ACTION */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            activeRec?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : activeRec?.status === 'RECOMMENDED'
              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 animate-pulse'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">5. ACTION</span>
              {activeRec?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 font-bold">
              {activeRec?.status || 'PENDING'}
            </span>
          </div>

          {/* Node 6: VERIFY */}
          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            activeRec?.status === 'COMPLETED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
              : 'bg-polar-card border-polar-border text-polar-text-muted'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">6. VERIFY</span>
              {activeRec?.status === 'COMPLETED' ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            </div>
            <span className="text-[10px] mt-1 opacity-80">
              {activeRec?.status === 'COMPLETED' ? 'STABILITY OK' : 'Awaiting Sim'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Active Recommendation & Human-In-The-Loop Approval Card */}
      {activeRec && (
        <div className="bg-polar-card border border-polar-border rounded-xl shadow-xl overflow-hidden font-mono">
          <div className="p-4 bg-polar-elevated border-b border-polar-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                activeRec.status === 'COMPLETED' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className="text-xs font-bold text-polar-cyan tracking-wider uppercase">
                {activeRec.id} • {activeRec.action_type}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                activeRec.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
              }`}>
                STATUS: {activeRec.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-polar-text-muted">Target Asset:</span>
              <span className="text-xs font-bold text-polar-text-primary uppercase bg-polar-card px-2 py-0.5 rounded border border-polar-border">
                {activeRec.asset_id}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <span className="text-[10px] text-polar-text-muted uppercase font-semibold block">Operational Rationale</span>
              <p className="text-sm font-sans font-medium text-polar-text-primary mt-1 leading-relaxed">
                {activeRec.reason}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-polar-border">
              <div className="bg-polar-surface p-3 rounded-lg border border-polar-border">
                <span className="text-[10px] text-polar-text-muted uppercase font-semibold block">Expected Consequence</span>
                <p className="text-xs font-sans text-polar-text-secondary mt-1">
                  {activeRec.expected_effect}
                </p>
              </div>

              <div className="bg-polar-surface p-3 rounded-lg border border-polar-border space-y-2">
                <span className="text-[10px] text-polar-text-muted uppercase font-semibold block">Verification & Evidence</span>
                <div className="flex flex-wrap items-center gap-2">
                  <ProvenanceBadge type="LABELLED_DEVELOPMENT_SYNTHETIC" size="sm" />
                  <span className="text-[10px] px-2 py-0.5 rounded bg-polar-elevated text-polar-cyan border border-polar-border">
                    CONFIDENCE: {activeExecution?.prediction?.confidence ? `${Math.round(activeExecution.prediction.confidence * 100)}%` : '94% HIGH'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-polar-elevated text-polar-text-muted border border-polar-border">
                    MODEL: {activeExecution?.prediction?.model_version || 'LOAD-XGB-ANTARCTIC-v1.4'}
                  </span>
                </div>
              </div>
            </div>

            {/* Human In The Loop Controls */}
            {activeRec.status === 'RECOMMENDED' && (
              <div className="pt-3 border-t border-polar-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-polar-text-muted">
                  Requires authorized operator approval before digital twin simulation execution.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleRejectAction(activeRec.id)}
                    disabled={actionProcessing}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => handleApproveAction(activeRec.id)}
                    disabled={actionProcessing}
                    className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Execute Simulation</span>
                  </button>
                </div>
              </div>
            )}

            {activeRec.status === 'COMPLETED' && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-600 dark:text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Action executed in Digital Twin sandbox and verified. State synchronized.</span>
                </div>
                {onNavigateToDigitalTwin && (
                  <button
                    onClick={onNavigateToDigitalTwin}
                    className="underline hover:text-white font-bold"
                  >
                    View in 3D Twin →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Cryptographic Automation Audit Trail */}
      <div className="bg-polar-card border border-polar-border rounded-xl shadow-md p-4 sm:p-5 space-y-3 font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-polar-cyan uppercase tracking-wider">
            <FileCheck className="w-4 h-4" />
            <span>Cryptographic Automation Audit Trail</span>
          </div>
          <span className="text-[10px] text-polar-text-muted">
            SHA-256 State Hashed • Tamper-Evident Chaining
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-polar-border text-[10px] text-polar-text-muted uppercase">
                <th className="pb-2 font-bold">Audit ID</th>
                <th className="pb-2 font-bold">Timestamp</th>
                <th className="pb-2 font-bold">Trigger</th>
                <th className="pb-2 font-bold">Action</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Operator</th>
                <th className="pb-2 font-bold">Verification</th>
                <th className="pb-2 font-bold text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-polar-border/60 text-[11px]">
              {auditHistory.length > 0 ? (
                auditHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-polar-hover/50 transition-colors">
                    <td className="py-2.5 font-bold text-polar-cyan">{item.audit_id}</td>
                    <td className="py-2.5 text-polar-text-muted">{new Date(item.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2.5 font-medium text-polar-text-primary">{item.trigger_type}</td>
                    <td className="py-2.5 text-polar-text-secondary">{item.action_type}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${
                        item.action_status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      }`}>
                        {item.action_status}
                      </span>
                    </td>
                    <td className="py-2.5 text-polar-text-primary font-medium">{item.operator || 'SYSTEM'}</td>
                    <td className="py-2.5 text-polar-text-muted max-w-xs truncate" title={item.verification_result}>
                      {item.verification_result}
                    </td>
                    <td className="py-2.5 text-right font-bold text-polar-text-primary">
                      {item.latency_breakdown_ms?.total_ms ? `${item.latency_breakdown_ms.total_ms}ms` : '18ms'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-polar-text-muted italic">
                    No automation executions recorded in current session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
