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
    <div className={`p-6 bg-[#0B1220] border border-[#1E293B] rounded-lg space-y-4 font-mono ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold text-cyan-400 tracking-wider uppercase">{label}</span>
        </div>
        <span className="text-[10px] text-slate-500">SYNCING</span>
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-[#111827] rounded animate-pulse"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
};
