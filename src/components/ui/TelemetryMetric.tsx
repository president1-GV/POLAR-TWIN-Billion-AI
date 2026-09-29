import React from 'react';
import { StatusBadge } from './StatusBadge';
import { ProvenanceBadge, ProvenanceTier } from '../common/ProvenanceBadge';
import { TelemetrySparkline } from './TelemetrySparkline';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  status?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  timestamp?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  provenance?: ProvenanceTier;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const TelemetryMetric: React.FC<Props> = ({
  label,
  value,
  unit,
  status = 'NORMAL',
  trend,
  trendDirection = 'neutral',
  timestamp,
  sparklineData,
  sparklineColor = '#0284C7',
  provenance,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`bg-polar-card border border-polar-border hover:border-polar-border-active rounded-md p-3.5 font-mono shadow-sm flex flex-col justify-between transition-colors overflow-hidden min-w-0 ${className}`}>
      {/* Top Header: Label + Status */}
      <div className="flex items-center justify-between text-xs pb-1 gap-2 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          {Icon && <Icon className="w-3.5 h-3.5 text-polar-text-muted shrink-0" />}
          <span className="text-[11px] font-bold text-polar-text-muted uppercase tracking-wider truncate">{label}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Primary Value + Sparkline */}
      <div className="my-2 flex items-baseline justify-between gap-2 min-w-0 overflow-hidden">
        <div className="flex items-baseline gap-1.5 min-w-0 truncate">
          <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-polar-text-primary tracking-tight truncate">{value}</span>
          {unit && <span className="text-[11px] text-polar-text-muted uppercase font-semibold shrink-0">{unit}</span>}
        </div>

        {sparklineData && (
          <div className="shrink-0 overflow-hidden">
            <TelemetrySparkline 
              data={sparklineData} 
              color={sparklineColor} 
              height={24} 
              width={75} 
            />
          </div>
        )}
      </div>

      {/* Bottom Strip: Trend + Timestamp / Provenance */}
      <div className="pt-2 border-t border-polar-border flex items-center justify-between text-[10px] text-polar-text-muted">
        {trend ? (
          <div className="flex items-center gap-1">
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3 text-polar-text-muted" />}
            <span className={trendDirection === 'up' || trendDirection === 'down' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-polar-text-muted'}>
              {trend}
            </span>
          </div>
        ) : (
          <span className="text-polar-text-muted">Nominal range</span>
        )}

        <div className="flex items-center gap-1.5">
          {timestamp && <span className="text-polar-text-muted">{timestamp}</span>}
          {provenance && <ProvenanceBadge type={provenance} size="sm" />}
        </div>
      </div>
    </div>
  );
};
