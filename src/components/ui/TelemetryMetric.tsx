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
  sparklineColor = '#38BDF8',
  provenance,
  icon: Icon,
  className = '',
}) => {
  return (
    <div className={`bg-[#07111D] border border-[#1E293B] hover:border-[#26354A] rounded-md p-3.5 font-mono shadow-sm flex flex-col justify-between transition-colors ${className}`}>
      {/* Top Header: Label + Status */}
      <div className="flex items-center justify-between text-xs pb-1">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        </div>
        <StatusBadge status={status} size="sm" />
      </div>

      {/* Primary Value + Sparkline */}
      <div className="my-2 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</span>
          {unit && <span className="text-xs text-slate-400 uppercase font-semibold">{unit}</span>}
        </div>

        {sparklineData && (
          <TelemetrySparkline 
            data={sparklineData} 
            color={sparklineColor} 
            height={26} 
            width={90} 
          />
        )}
      </div>

      {/* Bottom Strip: Trend + Timestamp / Provenance */}
      <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] text-slate-400">
        {trend ? (
          <div className="flex items-center gap-1">
            {trendDirection === 'up' && <TrendingUp className="w-3 h-3 text-emerald-400" />}
            {trendDirection === 'down' && <TrendingDown className="w-3 h-3 text-emerald-400" />}
            {trendDirection === 'neutral' && <Minus className="w-3 h-3 text-slate-500" />}
            <span className={trendDirection === 'up' || trendDirection === 'down' ? 'text-emerald-400' : 'text-slate-400'}>
              {trend}
            </span>
          </div>
        ) : (
          <span className="text-slate-500">Nominal range</span>
        )}

        <div className="flex items-center gap-1.5">
          {timestamp && <span className="text-slate-500">{timestamp}</span>}
          {provenance && <ProvenanceBadge type={provenance} size="sm" />}
        </div>
      </div>
    </div>
  );
};
