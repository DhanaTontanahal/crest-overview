import React from 'react';
import { DimensionScore } from '@/types/maturity';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DimensionChartProps {
  title: string;
  subtitle: string;
  dimensions: DimensionScore[];
}

const COLORS = [
  'hsl(163, 100%, 21%)',
  'hsl(155, 60%, 40%)',
  'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)',
  'hsl(170, 55%, 45%)',
  'hsl(140, 45%, 70%)',
];

const DimensionChart: React.FC<DimensionChartProps> = ({ title, subtitle, dimensions }) => {
  const data = dimensions.map(d => ({
    name: `${d.name}\nweight: ${d.weight}%`,
    label: d.name,
    weight: d.weight,
    average: Number(d.average.toFixed(1)),
  }));

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
      <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={dimensions.length * 60 + 40}>
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, 10]} ticks={[0, 2.5, 5, 7.5, 10]} />
          <YAxis
            dataKey="label"
            type="category"
            width={100}
            tick={({ x, y, payload }) => (
              <g>
                <text x={x} y={y - 6} textAnchor="end" fontSize={13} fontWeight={600} fill="hsl(160, 30%, 10%)">
                  {payload.value}
                </text>
                <text x={x} y={y + 10} textAnchor="end" fontSize={10} fill="hsl(160, 10%, 45%)">
                  weight: {dimensions.find(d => d.name === payload.value)?.weight}%
                </text>
              </g>
            )}
          />
          <Tooltip />
          <Bar dataKey="average" radius={[0, 4, 4, 0]} barSize={24}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DimensionChart;
