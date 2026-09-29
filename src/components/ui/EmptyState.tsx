import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  statusLabel?: string;
  lastUpdated?: string;
  onRetry?: () => void;
  className?: string;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  statusLabel = 'STALE',
  lastUpdated,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`p-8 text-center bg-[#0B1220] border border-[#1E293B] rounded-lg space-y-3 font-mono ${className}`}>
      <div className="w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <div className="flex items-center justify-center gap-2">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{title}</h4>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto mt-1.5">
          {description}
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-slate-500 mt-1">
            Last successful transmission: {lastUpdated}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1E293B] hover:bg-[#334155] text-slate-200 text-xs transition-colors border border-[#334155]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Telemetry Probe</span>
        </button>
      )}
    </div>
  );
};
