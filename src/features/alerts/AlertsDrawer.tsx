import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, Check, CheckCheck, Clock, MapPin, Loader2 } from 'lucide-react';
import { Alert } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void | Promise<void>;
  onResolve: (alertId: string) => void | Promise<void>;
}

export const AlertsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onResolve,
}) => {
  const [filterMode, setFilterMode] = useState<'ACTIVE' | 'ALL'>('ACTIVE');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'ack' | 'resolve' | null>(null);

  if (!isOpen) return null;

  const activeCount = alerts.filter((a) => a.status === 'ACTIVE').length;
  const ackCount = alerts.filter((a) => a.status === 'ACKNOWLEDGED').length;
  const resolvedCount = alerts.filter((a) => a.status === 'RESOLVED').length;

  const displayedAlerts = filterMode === 'ACTIVE'
    ? alerts.filter((a) => a.status === 'ACTIVE' || a.status === 'ACKNOWLEDGED')
    : alerts;

  const handleAcknowledgeClick = async (alertId: string) => {
    try {
      setProcessingId(alertId);
      setProcessingAction('ack');
      await onAcknowledge(alertId);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleResolveClick = async (alertId: string) => {
    try {
      setProcessingId(alertId);
      setProcessingAction('resolve');
      await onResolve(alertId);
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end font-mono">
      <div className="w-full max-w-lg bg-polar-card border-l border-polar-border h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-polar-elevated border-b border-polar-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <h3 className="text-sm font-bold text-polar-text-primary uppercase tracking-wider">
                Operational Alerts Center
              </h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close Alerts Drawer"
              className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-polar-border/50 text-xs">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFilterMode('ACTIVE')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
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
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors flex items-center gap-1.5 ${
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

            <div className="text-[10px] text-polar-text-muted hidden sm:block">
              {resolvedCount} Resolved
            </div>
          </div>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {displayedAlerts.length === 0 ? (
            <div className="text-center py-16 text-polar-text-muted space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto opacity-70" />
              <div className="text-sm font-bold text-polar-text-primary">
                {filterMode === 'ACTIVE' ? 'No Active Operational Incidents' : 'No Incident Records Found'}
              </div>
              <p className="text-xs text-polar-text-muted max-w-xs mx-auto">
                {filterMode === 'ACTIVE'
                  ? 'All Antarctic station subsystems are operating within nominal thermodynamic and energy thresholds.'
                  : 'No operational alert logs recorded in station telemetry database.'}
              </p>
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
                  className={`border rounded-lg p-4 space-y-3 transition-all ${
                    isResolved
                      ? 'border-emerald-500/30 bg-emerald-500/5 shadow-sm'
                      : isAck
                      ? 'border-amber-500/40 bg-amber-500/5 shadow-sm'
                      : isCrit
                      ? 'border-rose-500/60 bg-rose-500/10 shadow-sm'
                      : isWarn
                      ? 'border-amber-500/50 bg-amber-500/10 shadow-sm'
                      : 'border-polar-border bg-polar-card shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={isResolved ? 'NOMINAL' : al.severity} size="sm" />
                        <span className="text-[10px] text-polar-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-polar-cyan" />
                          {al.station_id === 'station_bharati' ? 'Bharati' : 'Maitri'}
                        </span>
                        {isResolved && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            RESOLVED
                          </span>
                        )}
                        {isAck && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30">
                            ACKNOWLEDGED
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-polar-text-primary mt-1.5">{al.title}</h4>
                    </div>
                    <ProvenanceBadge type={al.source_type} />
                  </div>

                  {/* Evidence Stream */}
                  {evidenceList.length > 0 && (
                    <div className="bg-polar-elevated p-2.5 rounded border border-polar-border text-[11px] space-y-1">
                      <span className="text-[10px] text-polar-text-muted uppercase font-semibold">Evidence:</span>
                      {evidenceList.map((ev: string, idx: number) => (
                        <div key={idx} className="text-polar-text-secondary flex items-center gap-1.5">
                          <span className="text-polar-cyan">•</span> {ev}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Predicted Consequence & Recommended Action */}
                  {al.predicted_consequence && (
                    <div className="text-[11px] text-polar-text-secondary">
                      <strong className="text-polar-text-muted">Consequence: </strong>
                      {al.predicted_consequence}
                    </div>
                  )}
                  {al.recommended_action && (
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 p-2.5 rounded border border-emerald-500/30">
                      <strong className="text-emerald-600 dark:text-emerald-400">Action: </strong> {al.recommended_action}
                    </div>
                  )}

                  {/* Action Buttons & Status Indicators */}
                  <div className="pt-2 border-t border-polar-border flex items-center justify-between text-xs">
                    <span className="text-[10px] text-polar-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(al.created_at).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* ACKNOWLEDGED Badge or Button */}
                      {al.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleAcknowledgeClick(al.id)}
                          disabled={isItemProcessing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-primary border border-polar-border hover:border-polar-cyan/50 transition-colors disabled:opacity-50"
                        >
                          {isItemProcessing && processingAction === 'ack' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-polar-cyan" />
                          ) : (
                            <Check className="w-3 h-3 text-polar-cyan" />
                          )}
                          <span>Acknowledge</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                          <Check className="w-3 h-3 text-amber-400" />
                          <span>ACKNOWLEDGED {al.acknowledged_by ? `• ${al.acknowledged_by}` : ''}</span>
                        </span>
                      )}

                      {/* RESOLVE Button or RESOLVED Badge */}
                      {!isResolved ? (
                        <button
                          onClick={() => handleResolveClick(al.id)}
                          disabled={isItemProcessing}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors font-bold disabled:opacity-50 shadow-sm"
                        >
                          {isItemProcessing && processingAction === 'resolve' ? (
                            <Loader2 className="w-3 h-3 animate-spin text-white" />
                          ) : (
                            <CheckCheck className="w-3 h-3" />
                          )}
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>RESOLVED</span>
                          {al.resolved_at && (
                            <span className="text-[9px] text-polar-text-muted font-normal ml-0.5">
                              ({new Date(al.resolved_at).toLocaleTimeString()})
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
