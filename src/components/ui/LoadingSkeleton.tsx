import React from 'react';

interface Props {
  label?: string;
  rows?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<Props> = ({
  label = 'UPDATING DIGITAL TWIN...',
  rows = 3,
  className = '',
}) => {
  return (
    <div className={`p-6 bg-polar-card border border-polar-border rounded-lg space-y-4 font-mono shadow-sm transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-polar-cyan animate-ping" />
          <span className="text-xs font-semibold text-polar-cyan tracking-wider uppercase">{label}</span>
        </div>
        <span className="text-[10px] text-polar-text-muted">SYNCING</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-polar-elevated rounded animate-pulse"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
