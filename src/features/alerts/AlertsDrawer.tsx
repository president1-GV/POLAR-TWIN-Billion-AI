import React from 'react';
import { X, AlertTriangle, ShieldCheck, Check, CheckCheck, Clock } from 'lucide-react';
import { Alert } from '../../types';
import { ProvenanceBadge } from '../../components/common/ProvenanceBadge';

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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-polar-900 border-l border-polar-750 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-polar-750 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Operational Alerts Center ({alerts.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-polar-850"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {alerts.length === 0 ? (
            <div className="text-center py-12 font-mono text-slate-500">
              <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
              All Antarctic station systems operating within normal parameters.
            </div>
          ) : (
            alerts.map((al) => {
              const isCrit = al.severity === 'CRITICAL';
              const isWarn = al.severity === 'WARNING';
              const evidenceList = Array.isArray(al.evidence) ? al.evidence : (typeof al.evidence === 'string' ? JSON.parse(al.evidence || '[]') : []);

              return (
                <div
                  key={al.id}
                  className={`polar-panel p-4 space-y-3 transition-all ${
                    isCrit ? 'border-red-500/80 bg-red-950/20' :
                    isWarn ? 'border-amber-500/60 bg-amber-950/10' : 'border-polar-750'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isCrit ? 'bg-red-950 text-red-400 border border-red-500/50 animate-pulse' :
                        isWarn ? 'bg-amber-950 text-amber-400 border border-amber-500/50' :
                        'bg-polar-800 text-slate-300'
                      }`}>
                        {al.severity}
                      </span>
                      <h4 className="text-xs font-mono font-bold text-white mt-1.5">{al.title}</h4>
                    </div>
                    <ProvenanceBadge type={al.source_type} />
                  </div>

                  {/* Evidence */}
                  {evidenceList.length > 0 && (
                    <div className="bg-polar-950 p-2.5 rounded border border-polar-800 text-[11px] font-mono space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Evidence:</span>
                      {evidenceList.map((ev: string, idx: number) => (
                        <div key={idx} className="text-slate-300 flex items-center gap-1.5">
                          <span className="text-polar-cyan">•</span> {ev}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Consequence & Recommendation */}
                  {al.predicted_consequence && (
                    <div className="text-[11px] font-mono text-slate-300">
                      <strong className="text-slate-400">Predicted Consequence: </strong>
                      {al.predicted_consequence}
                    </div>
                  )}
                  {al.recommended_action && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-500/30">
                      <strong>Action: </strong> {al.recommended_action}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 border-t border-polar-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(al.created_at).toLocaleTimeString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {al.status === 'ACTIVE' && (
                        <button
                          onClick={() => onAcknowledge(al.id)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-polar-800 hover:bg-polar-750 text-slate-200 border border-polar-700"
                        >
                          <Check className="w-3 h-3 text-polar-cyan" /> Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => onResolve(al.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-700"
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
