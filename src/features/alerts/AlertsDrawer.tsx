import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  ShieldCheck, 
  Check, 
  CheckCheck, 
  Clock, 
  MapPin, 
  Loader2, 
  Activity, 
  Wrench, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  AlertOctagon,
  Zap,
  Info
} from 'lucide-react';
import { Alert } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledge: (alertId: string, notes?: string) => void | Promise<void>;
  onResolve: (alertId: string, notes?: string) => void | Promise<void>;
  onReopen?: (alertId: string) => void | Promise<void>;
  currentStationId?: string;
  currentRole?: string;
  currentUser?: any;
}

export const AlertsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onResolve,
  onReopen,
  currentStationId,
  currentRole = 'DUTY_OPERATOR',
  currentUser,
}) => {
  const [filterMode, setFilterMode] = useState<'ACTIVE' | 'RESOLVED' | 'ALL'>('ACTIVE');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'ack' | 'resolve' | 'reopen' | null>(null);

  // Interactive Modal State
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [modalType, setModalType] = useState<'ACKNOWLEDGE' | 'RESOLVE' | 'DETAIL' | null>(null);
  const [ackNotes, setAckNotes] = useState<string>('Acknowledged by Duty Operator. Monitoring active micro-vibration telemetry.');
  const [resolveNotes, setResolveNotes] = useState<string>('Hot transfer to Aux Genset 02 successfully executed. Primary genset isolated for maintenance. Telemetry restored to nominal.');
  const [ackChecklist, setAckChecklist] = useState<Record<string, boolean>>({
    notify_supervisor: true,
    diagnostic_sampling: true,
    dispatch_technician: true,
  });
  const [resolveChecklist, setResolveChecklist] = useState<Record<string, boolean>>({
    aux_transfer: true,
    lubrication_check: true,
    telemetry_nominal: true,
    exhaust_stabilized: true,
  });

  // Toast Notification State
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' | 'info' } | null>(null);
  const [recentlyResolvedId, setRecentlyResolvedId] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'warn' | 'info' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 4500);
  };

  if (!isOpen) return null;

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const displayedAlerts = filterMode === 'ACTIVE'
    ? alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED')
    : filterMode === 'RESOLVED'
    ? alerts.filter((a) => a.status === 'RESOLVED')
    : alerts;

  const dutyOfficerName = currentUser?.name || currentUser?.username || 'V. Sharma (Duty Officer)';

  // Open Acknowledge Modal
  const openAcknowledgeModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setAckNotes(`Acknowledged by ${dutyOfficerName}. Station monitoring active. Telemetry within allowable safety margins.`);
    setAckChecklist({
      notify_supervisor: true,
      diagnostic_sampling: true,
      dispatch_technician: true,
    });
    setModalType('ACKNOWLEDGE');
  };

  // Open Resolve Modal
  const openResolveModal = (alert: Alert) => {
    setSelectedAlert(alert);
    setResolveNotes(
      alert.recommended_action
        ? `Executed action: ${alert.recommended_action}. Subsystem returned to nominal operating limits.`
        : `Hot transfer to auxiliary backup executed. Micro-vibration and exhaust temperature restored to nominal baseline.`
    );
    setResolveChecklist({
      aux_transfer: true,
      lubrication_check: true,
      telemetry_nominal: true,
      exhaust_stabilized: true,
    });
    setModalType('RESOLVE');
  };

  // Quick 1-Click Acknowledge
  const handleQuickAcknowledge = async (alert: Alert, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(alert.id);
      setProcessingAction('ack');
      const note = `Quick-acknowledged by ${dutyOfficerName}`;
      await onAcknowledge(alert.id, note);
      showToast(`✓ Alert Acknowledged: Logged to station shift journal by ${dutyOfficerName}`, 'success');
    } catch (err: any) {
      showToast(`Failed to acknowledge alert: ${err.message || 'Network error'}`, 'warn');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  // Confirm Modal Acknowledge
  const handleConfirmAcknowledge = async () => {
    if (!selectedAlert) return;
    try {
      setProcessingId(selectedAlert.id);
      setProcessingAction('ack');
      await onAcknowledge(selectedAlert.id, ackNotes);
      showToast(`✓ Operational Alert Acknowledged & Logged to Telemetry Audit Journal`, 'success');
      setModalType(null);
    } catch (err: any) {
      showToast(`Failed to record acknowledgment: ${err.message || 'Error'}`, 'warn');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  // Confirm Modal Resolve
  const handleConfirmResolve = async () => {
    if (!selectedAlert) return;
    try {
      setProcessingId(selectedAlert.id);
      setProcessingAction('resolve');
      await onResolve(selectedAlert.id, resolveNotes);
      setRecentlyResolvedId(selectedAlert.id);
      showToast(`✅ Incident Resolved: Subsystem restored to NOMINAL. Archived to Station Audit Log.`, 'success');
      setModalType(null);
    } catch (err: any) {
      showToast(`Failed to resolve incident: ${err.message || 'Error'}`, 'warn');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  // Reopen an alert
  const handleReopen = async (alertId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setProcessingId(alertId);
      setProcessingAction('reopen');
      if (onReopen) {
        await onReopen(alertId);
      }
      if (recentlyResolvedId === alertId) {
        setRecentlyResolvedId(null);
      }
      showToast(`🔄 Incident Reopened: Subsystem flagged for continuous monitoring.`, 'info');
    } catch (err: any) {
      showToast(`Failed to reopen alert: ${err.message || 'Error'}`, 'warn');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end font-mono">
      <div className="w-full max-w-xl bg-polar-card border-l border-polar-border h-full flex flex-col shadow-2xl relative">
        
        {/* Toast Notification Banner */}
        {toast && (
          <div className="absolute top-3 left-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className={`p-3 rounded-lg border shadow-xl flex items-center justify-between text-xs font-semibold ${
              toast.type === 'success' 
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/60 shadow-emerald-950/40' 
                : toast.type === 'warn'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/60 shadow-amber-950/40'
                : 'bg-cyan-950/90 text-cyan-300 border-cyan-500/60 shadow-cyan-950/40'
            }`}>
              <div className="flex items-center gap-2">
                {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {toast.type === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
                <span>{toast.msg}</span>
              </div>
              <button 
                onClick={() => setToast(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Drawer Header */}
        <div className="p-4 bg-polar-elevated border-b border-polar-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-polar-text-primary uppercase tracking-wider">
                Operational Alerts Center
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-polar-surface text-polar-cyan border border-polar-border">
                {activeCount + ackCount} ACTIVE
              </span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Alerts Drawer"
              className="p-1.5 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-polar-border/50 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('ACTIVE')}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  filterMode === 'ACTIVE'
                    ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface'
                }`}
              >
                <span>Active & Pending</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeCount > 0 ? 'bg-rose-500/30 text-rose-400' : 'bg-polar-surface text-polar-text-muted'
                }`}>
                  {activeCount + ackCount}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('RESOLVED')}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  filterMode === 'RESOLVED'
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-sm'
                    : 'text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface'
                }`}
              >
                <span>Resolved</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {resolvedCount}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
                  filterMode === 'ALL'
                    ? 'bg-polar-card text-polar-cyan border border-polar-border shadow-sm'
                    : 'text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface'
                }`}
              >
                <span>All Alerts</span>
                <span className="px-1.5 py-0.2 rounded-full bg-polar-surface text-polar-text-muted text-[10px] font-bold">
                  {alerts.length}
                </span>
              </button>
            </div>

            <div className="text-[10px] text-polar-text-muted hidden sm:flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry Guard
            </div>
          </div>
        </div>

        {/* Alerts List Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">

          {/* Recently Resolved Banner in ACTIVE View */}
          {filterMode === 'ACTIVE' && recentlyResolvedId && (() => {
            const recent = alerts.find(a => a.id === recentlyResolvedId);
            if (!recent) return null;
            return (
              <div className="p-3.5 rounded-lg border border-emerald-500/50 bg-emerald-950/20 shadow-lg space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      Incident Resolved & Restored to Nominal
                    </span>
                  </div>
                  <span className="text-[10px] text-polar-text-muted">
                    {recent.resolved_at ? new Date(recent.resolved_at).toLocaleTimeString() : 'Just now'}
                  </span>
                </div>
                <p className="text-xs text-polar-text-primary font-semibold">{recent.title}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-polar-text-muted">
                    Resolved by {recent.resolved_by || dutyOfficerName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setFilterMode('RESOLVED')}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                    >
                      View in Resolved Archive
                    </button>
                    <button
                      onClick={(e) => handleReopen(recent.id, e)}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-polar-surface text-polar-text-muted hover:text-amber-400 transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" /> Reopen
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {displayedAlerts.length === 0 ? (
            <div className="text-center py-16 text-polar-text-muted space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto opacity-75" />
              <div className="text-sm font-bold text-polar-text-primary">
                {filterMode === 'ACTIVE' 
                  ? 'All Station Subsystems Operating Nominally' 
                  : filterMode === 'RESOLVED'
                  ? 'No Resolved Incidents on Record'
                  : 'No Incident Records Found in Database'}
              </div>
              <p className="text-xs text-polar-text-muted max-w-sm mx-auto leading-relaxed">
                {filterMode === 'ACTIVE'
                  ? 'All Antarctic microgrid, thermal life-support, and generation telemetry channels are currently within nominal safety envelopes.'
                  : 'Historical incident records are logged to the station immutable telemetry archive.'}
              </p>
              {filterMode === 'ACTIVE' && resolvedCount > 0 && (
                <button
                  onClick={() => setFilterMode('RESOLVED')}
                  className="mt-2 px-3 py-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-cyan border border-polar-border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Inspect Resolved Incidents ({resolvedCount})</span>
                </button>
              )}
            </div>
          ) : (
            displayedAlerts.map((al) => {
              const isCrit = al.severity === 'CRITICAL';
              const isWarn = al.severity === 'WARNING';
              const isResolved = al.status === 'RESOLVED';
              const isAck = al.status === 'ACKNOWLEDGED';
              const isItemProcessing = processingId === al.id;

              const evidenceList = Array.isArray(al.evidence)
                ? al.evidence
                : typeof al.evidence === 'string'
                ? (() => {
                    try {
                      const parsed = JSON.parse(al.evidence);
                      return Array.isArray(parsed) ? parsed : [al.evidence];
                    } catch {
                      return [al.evidence];
                    }
                  })()
                : [];

              return (
                <div
                  key={al.id}
                  className={`border rounded-lg p-4 space-y-3 transition-all cursor-pointer ${
                    isResolved
                      ? 'border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60 shadow-sm'
                      : isAck
                      ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-500/60 shadow-sm'
                      : isCrit
                      ? 'border-rose-500/60 bg-rose-500/10 hover:border-rose-500/80 shadow-md'
                      : isWarn
                      ? 'border-amber-500/50 bg-amber-500/10 hover:border-amber-500/70 shadow-sm'
                      : 'border-polar-border bg-polar-card hover:border-polar-cyan/40 shadow-sm'
                  }`}
                  onClick={() => {
                    if (isResolved) {
                      setSelectedAlert(al);
                      setModalType('DETAIL');
                    } else if (isAck) {
                      openResolveModal(al);
                    } else {
                      openAcknowledgeModal(al);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={isResolved ? 'NOMINAL' : al.severity} size="sm" />
                        <span className="text-[10px] text-polar-text-muted flex items-center gap-1 font-semibold">
                          <MapPin className="w-3 h-3 text-polar-cyan" />
                          {al.station_id === 'station_bharati' ? 'Bharati Station' : 'Maitri Station'}
                        </span>
                        {al.asset_id && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-polar-elevated text-polar-text-secondary border border-polar-border">
                            {al.asset_id}
                          </span>
                        )}
                        {isResolved && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCheck className="w-2.5 h-2.5" />
                            RESOLVED
                          </span>
                        )}
                        {isAck && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/40 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" />
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-polar-text-primary mt-1">
                        {al.title}
                      </h4>
                    </div>
                    <ProvenanceBadge type={al.source_type} />
                  </div>

                  {/* Evidence Stream */}
                  {evidenceList.length > 0 && (
                    <div className="bg-polar-elevated p-2.5 rounded border border-polar-border text-[11px] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-polar-text-muted uppercase font-semibold">
                        <span>Telemetry Evidence:</span>
                        <span className="text-polar-cyan">Verified Sensors</span>
                      </div>
                      {evidenceList.map((ev: string, idx: number) => (
                        <div key={idx} className="text-polar-text-secondary flex items-center gap-1.5 font-mono">
                          <span className="text-polar-cyan shrink-0">•</span> 
                          <span>{ev}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Predicted Consequence & Recommended Action */}
                  {al.predicted_consequence && (
                    <div className="text-[11px] text-polar-text-secondary bg-polar-surface/60 p-2 rounded border border-polar-border/60">
                      <strong className="text-amber-400 font-semibold">Consequence: </strong>
                      {al.predicted_consequence}
                    </div>
                  )}
                  {al.recommended_action && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/30">
                      <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Action Required: </strong> 
                      {al.recommended_action}
                    </div>
                  )}

                  {/* Acknowledged or Resolved Audit Record */}
                  {isResolved && (
                    <div className="text-[11px] bg-emerald-950/30 text-emerald-300 p-2 rounded border border-emerald-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Resolved by {al.resolved_by || dutyOfficerName}</span>
                      </div>
                      {al.resolved_at && (
                        <span className="text-[10px] text-emerald-400/80">
                          {new Date(al.resolved_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  )}

                  {isAck && !isResolved && (
                    <div className="text-[11px] bg-amber-950/25 text-amber-300 p-2 rounded border border-amber-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Acknowledged by {al.acknowledged_by || dutyOfficerName}</span>
                      </div>
                      {al.acknowledged_at && (
                        <span className="text-[10px] text-amber-400/80">
                          {new Date(al.acknowledged_at).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Interactive Action Footer */}
                  <div 
                    className="pt-2.5 border-t border-polar-border flex items-center justify-between text-xs gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-[10px] text-polar-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(al.created_at).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Action 1: Acknowledge Button */}
                      {al.status === 'ACTIVE' && (
                        <>
                          <button
                            onClick={(e) => handleQuickAcknowledge(al, e)}
                            disabled={isItemProcessing}
                            title="1-Click Quick Acknowledge"
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-cyan border border-polar-cyan/30 hover:border-polar-cyan transition-colors text-[11px] font-bold disabled:opacity-50"
                          >
                            {isItemProcessing && processingAction === 'ack' ? (
                              <Loader2 className="w-3 h-3 animate-spin text-polar-cyan" />
                            ) : (
                              <Zap className="w-3 h-3 text-polar-cyan" />
                            )}
                            <span>Quick Ack</span>
                          </button>

                          <button
                            onClick={() => openAcknowledgeModal(al)}
                            disabled={isItemProcessing}
                            className="flex items-center gap-1 px-3 py-1.5 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-primary border border-polar-border hover:border-polar-cyan/50 transition-colors text-[11px] font-semibold disabled:opacity-50"
                          >
                            <FileText className="w-3 h-3 text-polar-text-muted" />
                            <span>Review & Ack</span>
                          </button>
                        </>
                      )}

                      {/* Action 2: Resolve Button */}
                      {!isResolved ? (
                        <button
                          onClick={() => openResolveModal(al)}
                          disabled={isItemProcessing}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors font-bold text-[11px] shadow-sm disabled:opacity-50"
                        >
                          {isItemProcessing && processingAction === 'resolve' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <CheckCheck className="w-3.5 h-3.5" />
                          )}
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleReopen(al.id, e)}
                          disabled={isItemProcessing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-muted hover:text-amber-400 border border-polar-border transition-colors text-[10px] font-semibold"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reopen Alert</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: INTERACTIVE OPERATIONAL ACKNOWLEDGMENT MODAL                      */}
      {/* ========================================================================= */}
      {modalType === 'ACKNOWLEDGE' && selectedAlert && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-200"
          onClick={() => setModalType(null)}
        >
          <div 
            className="w-full max-w-lg bg-polar-card border border-polar-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-polar-elevated border-b border-polar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold text-polar-text-primary uppercase tracking-wider">
                    Alert Acknowledgment & Duty Protocol
                  </h3>
                  <p className="text-[10px] text-polar-text-muted">
                    Station: {selectedAlert.station_id === 'station_bharati' ? 'Bharati' : 'Maitri'} • Ref: {selectedAlert.id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Alert Title & Severity */}
              <div className="p-3 bg-polar-elevated rounded border border-polar-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <StatusBadge status={selectedAlert.severity} size="sm" />
                  <span className="font-bold text-polar-text-primary text-xs">{selectedAlert.title}</span>
                </div>
                {selectedAlert.predicted_consequence && (
                  <p className="text-[11px] text-amber-400 font-sans">
                    ⚠️ {selectedAlert.predicted_consequence}
                  </p>
                )}
              </div>

              {/* SOP Checklist */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-polar-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-polar-cyan" />
                  Duty Protocol Response Checklist
                </label>
                <div className="space-y-2 bg-polar-elevated p-3 rounded border border-polar-border">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ackChecklist.notify_supervisor}
                      onChange={(e) => setAckChecklist(prev => ({ ...prev, notify_supervisor: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-polar-cyan focus:ring-polar-cyan bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Record anomaly in station watch journal and notify Shift Supervisor
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ackChecklist.diagnostic_sampling}
                      onChange={(e) => setAckChecklist(prev => ({ ...prev, diagnostic_sampling: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-polar-cyan focus:ring-polar-cyan bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Elevate sensor sampling rate to 10 Hz high-frequency diagnostic mode
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ackChecklist.dispatch_technician}
                      onChange={(e) => setAckChecklist(prev => ({ ...prev, dispatch_technician: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-polar-cyan focus:ring-polar-cyan bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Alert generator bay technician for visual inspection & oil sampling
                    </span>
                  </label>
                </div>
              </div>

              {/* Duty Operator Operational Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-polar-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-polar-cyan" />
                  Operational Response Notes
                </label>
                <textarea
                  value={ackNotes}
                  onChange={(e) => setAckNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-polar-elevated border border-polar-border rounded text-polar-text-primary text-xs font-mono focus:border-polar-cyan focus:outline-none"
                  placeholder="Enter specific station operational notes..."
                />
              </div>

              {/* Duty Officer Identity Card */}
              <div className="p-2.5 rounded bg-polar-surface border border-polar-border/60 text-[10px] text-polar-text-muted flex items-center justify-between">
                <div>
                  <strong className="text-polar-text-primary">Officer: </strong> {dutyOfficerName}
                </div>
                <div>
                  <strong className="text-polar-text-primary">Authority: </strong> {currentRole}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-polar-elevated border-t border-polar-border flex items-center justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="px-3.5 py-1.5 rounded text-xs text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAcknowledge}
                disabled={processingId === selectedAlert.id}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
              >
                {processingId === selectedAlert.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Record Acknowledgment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INTERACTIVE INCIDENT RESOLUTION MODAL                            */}
      {/* ========================================================================= */}
      {modalType === 'RESOLVE' && selectedAlert && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-200"
          onClick={() => setModalType(null)}
        >
          <div 
            className="w-full max-w-lg bg-polar-card border border-polar-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-emerald-950/40 border-b border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Incident Resolution & Root Cause Clearance
                  </h3>
                  <p className="text-[10px] text-polar-text-muted">
                    Station: {selectedAlert.station_id === 'station_bharati' ? 'Bharati' : 'Maitri'} • Subsystem: {selectedAlert.asset_id || 'Primary Infrastructure'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalType(null)}
                className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Alert Title */}
              <div className="p-3 bg-polar-elevated rounded border border-polar-border space-y-1">
                <span className="text-[10px] text-polar-text-muted uppercase font-semibold">Incident Being Cleared:</span>
                <p className="font-bold text-polar-text-primary text-xs">{selectedAlert.title}</p>
              </div>

              {/* Corrective Action Checklist */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  Engineering Verification Checklist
                </label>
                <div className="space-y-2 bg-polar-elevated p-3 rounded border border-polar-border">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resolveChecklist.aux_transfer}
                      onChange={(e) => setResolveChecklist(prev => ({ ...prev, aux_transfer: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-emerald-500 focus:ring-emerald-500 bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Hot transfer to Aux Genset 02 successfully synchronized and load transferred
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resolveChecklist.lubrication_check}
                      onChange={(e) => setResolveChecklist(prev => ({ ...prev, lubrication_check: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-emerald-500 focus:ring-emerald-500 bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Injector lubrication inspected, flushed, and bearing clearances verified
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resolveChecklist.telemetry_nominal}
                      onChange={(e) => setResolveChecklist(prev => ({ ...prev, telemetry_nominal: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-emerald-500 focus:ring-emerald-500 bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Micro-vibration telemetry returned to nominal envelope (&lt; 2.2 mm/s)
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resolveChecklist.exhaust_stabilized}
                      onChange={(e) => setResolveChecklist(prev => ({ ...prev, exhaust_stabilized: e.target.checked }))}
                      className="mt-0.5 rounded border-polar-border text-emerald-500 focus:ring-emerald-500 bg-polar-surface"
                    />
                    <span className="text-[11px] text-polar-text-primary leading-tight">
                      Thermal exhaust gas temperatures stabilized within ISO tolerance (&lt; 400°C)
                    </span>
                  </label>
                </div>
              </div>

              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-polar-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Root Cause & Resolution Summary
                </label>
                <textarea
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-polar-elevated border border-polar-border rounded text-polar-text-primary text-xs font-mono focus:border-emerald-500 focus:outline-none"
                  placeholder="Summarize corrective actions taken..."
                />
              </div>

              {/* Officer Authorization Sign-off */}
              <div className="p-2.5 rounded bg-polar-surface border border-polar-border/60 text-[10px] text-polar-text-muted flex items-center justify-between">
                <div>
                  <strong className="text-polar-text-primary">Sign-off: </strong> {dutyOfficerName}
                </div>
                <div>
                  <strong className="text-polar-text-primary">Status: </strong> RETURNING TO NOMINAL
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-polar-elevated border-t border-polar-border flex items-center justify-end gap-2.5">
              <button
                onClick={() => setModalType(null)}
                className="px-3.5 py-1.5 rounded text-xs text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                disabled={processingId === selectedAlert.id}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
              >
                {processingId === selectedAlert.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Executing Resolution...</span>
                  </>
                ) : (
                  <>
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Execute Resolution & Clear Incident</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ALERT DETAILS & DIAGNOSTICS VIEW                                 */}
      {/* ========================================================================= */}
      {modalType === 'DETAIL' && selectedAlert && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono animate-in fade-in duration-200"
          onClick={() => setModalType(null)}
        >
          <div 
            className="w-full max-w-lg bg-polar-card border border-polar-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-polar-elevated border-b border-polar-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAlert.status === 'RESOLVED' ? 'NOMINAL' : selectedAlert.severity} size="sm" />
                <h3 className="text-xs font-bold text-polar-text-primary uppercase tracking-wider">
                  Operational Incident Telemetry Dossier
                </h3>
              </div>
              <button onClick={() => setModalType(null)} className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              <div>
                <h4 className="font-bold text-sm text-polar-text-primary">{selectedAlert.title}</h4>
                <p className="text-[10px] text-polar-text-muted mt-0.5">
                  Station: {selectedAlert.station_id} • Created: {new Date(selectedAlert.created_at).toLocaleString()}
                </p>
              </div>

              {selectedAlert.status === 'RESOLVED' ? (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded space-y-1 text-emerald-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Incident Resolved</span>
                  </div>
                  <p className="text-[11px] text-emerald-400/80">
                    Resolved by {selectedAlert.resolved_by || 'Duty Operator'} at {selectedAlert.resolved_at ? new Date(selectedAlert.resolved_at).toLocaleString() : 'N/A'}.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded space-y-1 text-amber-300">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Status: {selectedAlert.status}</span>
                  </div>
                  {selectedAlert.acknowledged_by && (
                    <p className="text-[11px] text-amber-400/80">
                      Acknowledged by {selectedAlert.acknowledged_by} at {selectedAlert.acknowledged_at ? new Date(selectedAlert.acknowledged_at).toLocaleString() : 'N/A'}
                    </p>
                  )}
                </div>
              )}

              {selectedAlert.recommended_action && (
                <div className="p-3 bg-polar-elevated rounded border border-polar-border space-y-1">
                  <span className="text-[10px] text-polar-text-muted uppercase font-bold">Standard Operating Procedure:</span>
                  <p className="text-polar-text-primary">{selectedAlert.recommended_action}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-polar-elevated border-t border-polar-border flex items-center justify-between">
              {selectedAlert.status === 'RESOLVED' ? (
                <button
                  onClick={(e) => {
                    handleReopen(selectedAlert.id, e);
                    setModalType(null);
                  }}
                  className="px-3 py-1.5 rounded bg-polar-surface text-amber-400 hover:bg-polar-elevated text-xs font-semibold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reopen Incident
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedAlert.status === 'ACTIVE' && (
                    <button
                      onClick={() => openAcknowledgeModal(selectedAlert)}
                      className="px-3 py-1.5 rounded bg-polar-surface text-polar-cyan hover:bg-polar-elevated text-xs font-semibold"
                    >
                      Acknowledge...
                    </button>
                  )}
                  <button
                    onClick={() => openResolveModal(selectedAlert)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    Resolve Incident...
                  </button>
                </div>
              )}
              <button
                onClick={() => setModalType(null)}
                className="px-3.5 py-1.5 rounded text-xs text-polar-text-muted hover:text-polar-text-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
