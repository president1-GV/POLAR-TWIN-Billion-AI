import React from 'react';
import { X, AlertTriangle, ShieldCheck, Check, CheckCheck, Clock, MapPin } from 'lucide-react';
import { Alert } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';
import { StatusBadge } from '../../components/ui/StatusBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledge: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

export const AlertsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledge,
  onResolve,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end font-mono">
      <div className="w-full max-w-lg bg-polar-card border-l border-polar-border h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-polar-elevated border-b border-polar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <h3 className="text-sm font-bold text-polar-text-primary uppercase tracking-wider">
              Operational Alerts Center ({alerts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-polar-text-muted hover:text-polar-text-primary hover:bg-polar-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-polar-text-muted space-y-2">
              <ShieldCheck className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto opacity-70" />
              <div className="text-sm font-bold text-polar-text-primary">All Systems Nominal</div>
              <p className="text-xs text-polar-text-muted max-w-xs mx-auto">
                No active critical incidents or advisories reported across Antarctic stations.
              </p>
            </div>
          ) : (
            alerts.map((al) => {
              const isCrit = al.severity === 'CRITICAL';
              const isWarn = al.severity === 'WARNING';
              const evidenceList = Array.isArray(al.evidence)
                ? al.evidence
                : typeof al.evidence === 'string'
                ? JSON.parse(al.evidence || '[]')
                : [];

              return (
                <div
                  key={al.id}
                  className={`border rounded-lg p-4 space-y-3 transition-all ${
                    isCrit ? 'border-rose-500/60 bg-rose-500/10' :
                    isWarn ? 'border-amber-500/50 bg-amber-500/10' : 'border-polar-border bg-polar-card shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={al.severity} size="sm" />
                        <span className="text-[10px] text-polar-text-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-polar-cyan" />
                          {al.station_id === 'station_bharati' ? 'Bharati' : 'Maitri'}
                        </span>
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

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-polar-border flex items-center justify-between text-xs">
                    <span className="text-[10px] text-polar-text-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(al.created_at).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {al.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledge(al.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-polar-elevated hover:bg-polar-surface text-polar-text-primary border border-polar-border transition-colors"
                        >
                          <Check className="w-3 h-3 text-polar-cyan" /> Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => onResolve(al.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors font-bold"
                      >
                        <CheckCheck className="w-3 h-3" /> Resolve
                      </button>
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
