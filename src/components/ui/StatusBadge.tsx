import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

export type SemanticStatus =
  | 'ONLINE'
  | 'OPERATIONAL'
  | 'NOMINAL'
  | 'SYNCED'
  | 'DEGRADED'
  | 'ATTENTION'
  | 'LOW RESERVE'
  | 'STALE DATA'
  | 'OFFLINE'
  | 'FAILURE'
  | 'CRITICAL'
  | 'NO TELEMETRY'
  | 'UNAVAILABLE'
  | 'NOT CONNECTED'
  | 'NOT EVALUATED';

interface Props {
  status: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<Props> = ({
  status,
  size = 'sm',
  showIcon = true,
  className = '',
}) => {
  const norm = status.toUpperCase().trim();

  const isHealthy = ['ONLINE', 'OPERATIONAL', 'NOMINAL', 'SYNCED', 'NORMAL', 'ACTIVE'].includes(norm);
  const isWarning = ['DEGRADED', 'ATTENTION', 'LOW RESERVE', 'STALE DATA', 'WARNING', 'WATCH'].includes(norm);
  const isCritical = ['OFFLINE', 'FAILURE', 'CRITICAL', 'NO TELEMETRY', 'FAILED'].includes(norm);

  let colorClasses = 'bg-slate-800/80 text-slate-300 border-slate-700';
  let Icon = HelpCircle;

  if (isHealthy) {
    colorClasses = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
    Icon = CheckCircle2;
  } else if (isWarning) {
    colorClasses = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
    Icon = AlertTriangle;
  } else if (isCritical) {
    colorClasses = 'bg-rose-950/70 text-rose-300 border-rose-500/50';
    Icon = XCircle;
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border tracking-wider uppercase select-none ${padding} ${colorClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSize} flex-shrink-0`} />}
      <span>{norm}</span>
    </span>
  );
};
