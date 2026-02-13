import React from 'react';
import { QuarterlyTrend } from '@/types/maturity';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, ComposedChart, Area,
} from 'recharts';

interface TrendingChartsProps {
  trends: QuarterlyTrend[];
}

const TrendingCharts: React.FC<TrendingChartsProps> = ({ trends }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-card-foreground">Historical Trends & Trajectory</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stability Trends */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground text-center">Stability Trends</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">Quarter-over-quarter stability progression</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trends} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis domain={[0, 100]} fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="stability" fill="hsl(163, 100%, 21%)" fillOpacity={0.15} stroke="none" />
              <Line type="monotone" dataKey="stability" stroke="hsl(163, 100%, 21%)" strokeWidth={3} dot={{ r: 5, fill: 'hsl(163, 100%, 21%)' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Weighted Average Changes */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground text-center">Weighted Average Score</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">Overall weighted maturity over time</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trends} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis domain={[0, 10]} fontSize={12} />
              <Tooltip />
              <Bar dataKey="weightedAverage" fill="hsl(163, 60%, 30%)" radius={[4, 4, 0, 0]} name="Weighted Avg" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pillar Performance Over Time */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground text-center">Performance Over Time</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">Pillar performance trajectory across quarters</p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis domain={[0, 10]} fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="maturity" stroke="hsl(163, 100%, 21%)" strokeWidth={2} dot={{ r: 4 }} name="Maturity" />
              <Line type="monotone" dataKey="performance" stroke="hsl(45, 90%, 55%)" strokeWidth={2} dot={{ r: 4 }} name="Performance" />
              <Line type="monotone" dataKey="agility" stroke="hsl(185, 70%, 50%)" strokeWidth={2} dot={{ r: 4 }} name="Agility" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Improvement Trajectory */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-card-foreground text-center">Improvement Trajectory</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">Score movement towards stability goals</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={trends} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" fontSize={12} />
              <YAxis domain={[0, 10]} fontSize={12} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="weightedAverage" fill="hsl(155, 60%, 40%)" fillOpacity={0.1} stroke="hsl(155, 60%, 40%)" strokeWidth={2} name="Weighted Avg" />
              <Line type="monotone" dataKey="maturity" stroke="hsl(163, 100%, 21%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} name="Maturity" />
              {/* Target line */}
              <Line type="monotone" dataKey={() => 7.5} stroke="hsl(0, 0%, 60%)" strokeWidth={1} strokeDasharray="8 4" dot={false} name="Target (7.5)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default TrendingCharts;
