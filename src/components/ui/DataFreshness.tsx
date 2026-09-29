import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle } from 'lucide-react';

interface Props {
  lastUpdatedTimestamp?: string | number | Date;
  isLive?: boolean;
  isSynthetic?: boolean;
  isSimulation?: boolean;
  className?: string;
}

export const DataFreshness: React.FC<Props> = ({
  lastUpdatedTimestamp,
  isLive = true,
  isSynthetic = false,
  isSimulation = false,
  className = '',
}) => {
  const [secondsAgo, setSecondsAgo] = useState<number>(0);

  useEffect(() => {
    const updateSeconds = () => {
      if (!lastUpdatedTimestamp) {
        setSecondsAgo(0);
        return;
      }
      const ts = new Date(lastUpdatedTimestamp).getTime();
      const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
      setSecondsAgo(diff);
    };

    updateSeconds();
    const interval = setInterval(updateSeconds, 1000);
    return () => clearInterval(interval);
  }, [lastUpdatedTimestamp]);

  if (isSimulation) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-purple-400 bg-purple-950/50 border border-purple-500/30 px-2 py-0.5 rounded ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
        <span className="font-semibold tracking-wider">SIMULATION</span>
        <span className="text-slate-400 text-[10px]">(What-If Model)</span>
      </div>
    );
  }

  if (isSynthetic) {
    return (
      <div className={`inline-flex items-center gap-1.5 text-[11px] font-mono text-sky-400 bg-sky-950/50 border border-sky-500/30 px-2 py-0.5 rounded ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
        <span className="font-semibold tracking-wider">SYNTHETIC</span>
        <span className="text-slate-400 text-[10px]">(Physics Coupled)</span>
      </div>
    );
  }

  const isStale = secondsAgo > 30;

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-mono px-2 py-0.5 rounded border ${
        isStale
          ? 'bg-amber-950/50 text-amber-300 border-amber-500/40'
          : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isStale ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
        }`}
      />
      <span className="font-semibold tracking-wider">{isStale ? 'STALE' : 'LIVE'}</span>
      <span className="text-slate-400 text-[10px]">
        • {secondsAgo < 5 ? 'Just now' : `${secondsAgo}s ago`}
      </span>
    </div>
  );
};
