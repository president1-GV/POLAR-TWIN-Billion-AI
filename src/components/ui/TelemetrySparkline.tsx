import React from 'react';

interface Props {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showMinMax?: boolean;
  className?: string;
}

export const TelemetrySparkline: React.FC<Props> = ({
  data,
  color = '#38BDF8',
  height = 28,
  width = 100,
  showMinMax = true,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return <div className={`h-[${height}px] w-[${width}px] bg-slate-900/50 rounded`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((val - min) / range) * (height - padding * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const lastPoint = points[points.length - 1].split(',');
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);

  // Area under line
  const areaD = `${pathD} L ${width - padding},${height} L ${padding},${height} Z`;

  return (
    <div className={`relative inline-block ${className}`} title={`Range: ${min.toFixed(1)} - ${max.toFixed(1)}`}>
      <svg
        width={width}
        height={height}
        className="overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gradient fill */}
        <path d={areaD} fill={`url(#grad-${color.replace('#', '')})`} />

        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse dot on latest point */}
        <circle cx={lastX} cy={lastY} r="2" fill={color} />
        <circle cx={lastX} cy={lastY} r="4" fill={color} opacity="0.3" className="animate-ping" />
      </svg>
    </div>
  );
};
