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
    <div className={`p-8 text-center bg-polar-card border border-polar-border rounded-lg space-y-3 font-mono shadow-sm transition-colors ${className}`}>
      <div className="w-10 h-10 rounded-full bg-polar-elevated border border-polar-border flex items-center justify-center text-polar-text-muted mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-500" />
      </div>
      <div>
        <div className="flex items-center justify-center gap-2">
          <h4 className="text-sm font-bold text-polar-text-primary uppercase tracking-wider">{title}</h4>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-polar-text-muted max-w-md mx-auto mt-1.5 font-sans">
          {description}
        </p>
        {lastUpdated && (
          <p className="text-[10px] text-polar-text-muted mt-1">
            Last successful transmission: {lastUpdated}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-polar-elevated hover:bg-polar-hover text-polar-text-primary text-xs transition-colors border border-polar-border"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Telemetry Probe</span>
        </button>
      )}
    </div>
  );
};
