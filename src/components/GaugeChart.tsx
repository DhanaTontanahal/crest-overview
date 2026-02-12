import React from 'react';

interface GaugeChartProps {
  value: number;
  title: string;
  subtitle: string;
  teamCount: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({ value, title, subtitle, teamCount }) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const angle = -180 + (clampedValue / 100) * 180;

  const arcPath = (startAngle: number, endAngle: number, radius: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = 100 + radius * Math.cos(startRad);
    const y1 = 100 + radius * Math.sin(startRad);
    const x2 = 100 + radius * Math.cos(endRad);
    const y2 = 100 + radius * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const segments = [
    { start: -180, end: -144, color: 'hsl(var(--chart-green-5))' },
    { start: -144, end: -108, color: 'hsl(var(--chart-green-4))' },
    { start: -108, end: -72, color: 'hsl(var(--chart-green-3))' },
    { start: -72, end: -36, color: 'hsl(var(--chart-green-2))' },
    { start: -36, end: 0, color: 'hsl(var(--chart-green-1))' },
  ];

  const needleRad = (angle * Math.PI) / 180;
  const needleLength = 55;
  const nx = 100 + needleLength * Math.cos(needleRad);
  const ny = 100 + needleLength * Math.sin(needleRad);

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-card-foreground text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-2">{subtitle}</p>
      <svg viewBox="0 0 200 130" className="w-full max-w-[280px] mx-auto">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={arcPath(seg.start, seg.end, 70)}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeLinecap="butt"
          />
        ))}
        {[0, 20, 40, 60, 80, 100].map(tick => {
          const tickAngle = -180 + (tick / 100) * 180;
          const tickRad = (tickAngle * Math.PI) / 180;
          const tx = 100 + 90 * Math.cos(tickRad);
          const ty = 100 + 90 * Math.sin(tickRad);
          return (
            <text key={tick} x={tx} y={ty} textAnchor="middle" fontSize="8" fill="hsl(var(--muted-foreground))">
              {tick}
            </text>
          );
        })}
        <line x1="100" y1="100" x2={nx} y2={ny} stroke="hsl(var(--chart-orange))" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="100" cy="100" r="4" fill="hsl(var(--chart-orange))" />
        <text x="100" y="112" textAnchor="middle" fontSize="18" fontWeight="bold" fill="hsl(var(--foreground))">
          {clampedValue}%
        </text>
        <text x="100" y="123" textAnchor="middle" fontSize="9" fill="hsl(var(--muted-foreground))">
          ({teamCount} teams)
        </text>
      </svg>
      <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'hsl(var(--chart-orange))' }} /> Actual
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: 'hsl(var(--chart-gray))' }} /> Target
        </span>
      </div>
    </div>
  );
};

export default GaugeChart;
