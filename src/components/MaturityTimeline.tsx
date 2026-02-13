import React from 'react';
import { TimeSeriesPoint } from '@/types/maturity';
import ChartChatBox from '@/components/ChartChatBox';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Line, ComposedChart, ReferenceLine, ReferenceArea,
} from 'recharts';

interface MaturityTimelineProps {
  title: string;
  subtitle: string;
  data: TimeSeriesPoint[];
  dataKey: keyof Omit<TimeSeriesPoint, 'period'>;
}

const maturityBands = [
  { y1: 0, y2: 2, label: 'pre-crawl', color: 'hsl(185, 70%, 50%)' },
  { y1: 2, y2: 4, label: 'crawl', color: 'hsl(185, 60%, 65%)' },
  { y1: 4, y2: 6, label: 'walk', color: 'hsl(155, 50%, 55%)' },
  { y1: 6, y2: 8, label: 'run', color: 'hsl(145, 55%, 45%)' },
  { y1: 8, y2: 10, label: 'fly', color: 'hsl(163, 100%, 21%)' },
];

const MaturityTimeline: React.FC<MaturityTimelineProps> = ({ title, subtitle, data, dataKey }) => {
  const benchmarkValue = 5;

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 relative">
      <ChartChatBox chartTitle={title} />
      <h3 className="text-lg font-semibold text-card-foreground text-center">{title}</h3>
      <p className="text-sm text-muted-foreground text-center mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <defs>
            {maturityBands.map((band, i) => (
              <linearGradient key={i} id={`band-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={band.color} stopOpacity={0.4} />
                <stop offset="100%" stopColor={band.color} stopOpacity={0.4} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" fontSize={12} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} fontSize={12} />
          <Tooltip />
          {maturityBands.map((band, i) => (
            <ReferenceArea
              key={i}
              y1={band.y1}
              y2={band.y2}
              fill={band.color}
              fillOpacity={0.3}
              label={{ value: band.label, position: 'insideLeft', fontSize: 11, fill: 'hsl(160, 30%, 10%)' }}
            />
          ))}
          <ReferenceLine
            y={benchmarkValue}
            stroke="hsl(0, 0%, 60%)"
            strokeDasharray="5 5"
            label={{ value: 'benchmark', position: 'right', fontSize: 11, fill: 'hsl(155, 60%, 40%)' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="hsl(45, 90%, 55%)"
            strokeWidth={3}
            dot={{ r: 6, fill: 'hsl(45, 90%, 55%)', stroke: 'hsl(45, 90%, 55%)' }}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MaturityTimeline;
