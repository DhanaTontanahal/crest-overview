import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Users } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import GaugeChart from '@/components/GaugeChart';
import DimensionChart from '@/components/DimensionChart';
import PillarImprovement from '@/components/PillarImprovement';
import ActionItems from '@/components/ActionItems';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
} from 'recharts';

const PILLAR_COLORS = [
  'hsl(163, 100%, 21%)',
  'hsl(155, 60%, 40%)',
  'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)',
  'hsl(170, 55%, 45%)',
  'hsl(140, 45%, 70%)',
];

const UserTPLView: React.FC = () => {
  const { user, teams, selectedQuarter, pillars, maturityDimensions, performanceMetrics } = useAppState();

  const userPlatform = user?.platformId ?? '';

  const platformTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter && t.platform === userPlatform),
    [teams, selectedQuarter, userPlatform]
  );

  // All teams in the quarter for overall comparison
  const allQuarterTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter),
    [teams, selectedQuarter]
  );

  const pillarData = useMemo(() => {
    return pillars.map((pillar, i) => {
      const pTeams = platformTeams.filter(t => t.pillar === pillar);
      if (pTeams.length === 0) return { pillar, agility: 0, maturity: 0, performance: 0, stability: 0, teamCount: 0 };
      const avg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
        +(pTeams.reduce((s, t) => s + t[key], 0) / pTeams.length).toFixed(1);
      return { pillar, agility: avg('agility'), maturity: avg('maturity'), performance: avg('performance'), stability: Math.round(pTeams.reduce((s, t) => s + t.stability, 0) / pTeams.length), teamCount: pTeams.length };
    }).filter(d => d.teamCount > 0);
  }, [platformTeams, pillars]);

  const avgStability = platformTeams.length > 0
    ? Math.round(platformTeams.reduce((s, t) => s + t.stability, 0) / platformTeams.length) : 0;
  const avgMaturity = platformTeams.length > 0
    ? Math.round((platformTeams.reduce((s, t) => s + t.maturity, 0) / platformTeams.length) * 10) : 0;
  const avgPerformance = platformTeams.length > 0
    ? Math.round((platformTeams.reduce((s, t) => s + t.performance, 0) / platformTeams.length) * 10) : 0;

  // Current platform vs Overall comparison data
  const comparisonData = useMemo(() => {
    const overallAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      allQuarterTeams.length > 0 ? +(allQuarterTeams.reduce((s, t) => s + t[key], 0) / allQuarterTeams.length).toFixed(1) : 0;
    const platformAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      platformTeams.length > 0 ? +(platformTeams.reduce((s, t) => s + t[key], 0) / platformTeams.length).toFixed(1) : 0;

    return [
      { metric: 'Maturity', [userPlatform]: platformAvg('maturity'), Overall: overallAvg('maturity') },
      { metric: 'Performance', [userPlatform]: platformAvg('performance'), Overall: overallAvg('performance') },
      { metric: 'Agility', [userPlatform]: platformAvg('agility'), Overall: overallAvg('agility') },
      { metric: 'Stability', [userPlatform]: +(platformAvg('stability') / 10).toFixed(1), Overall: +(overallAvg('stability') / 10).toFixed(1) },
    ];
  }, [platformTeams, allQuarterTeams, userPlatform]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Platform Lead — {userPlatform}</h2>
            <p className="text-sm text-muted-foreground">Your platform's maturity, performance, and pillar breakdown</p>
          </div>
        </div>
      </div>

      {/* Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { value: avgStability, title: 'Team Stability', subtitle: 'How stable are your teams?' },
          { value: avgMaturity, title: 'Overall Maturity', subtitle: 'How mature are your teams?' },
          { value: avgPerformance, title: 'Overall Performance', subtitle: 'How well are teams performing?' },
        ].map((gauge, i) => (
          <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}>
            <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={platformTeams.length} />
          </div>
        ))}
      </div>

      {/* Current Platform vs Overall Comparison */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.25s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle={`${userPlatform} vs Organisation Overall`} />
        <h3 className="text-base font-semibold text-card-foreground text-center">{userPlatform} vs Organisation Overall</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">How your platform compares against the organisation-wide average across key metrics</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 10]} fontSize={11} />
            <YAxis dataKey="metric" type="category" width={100} fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={userPlatform} fill="hsl(163, 100%, 21%)" barSize={12} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Overall" fill="hsl(var(--muted-foreground) / 0.3)" barSize={12} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Maturity Dimensions" subtitle="How dimensions contribute to maturity" dimensions={maturityDimensions} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Performance Metrics" subtitle="How metrics contribute to performance" dimensions={performanceMetrics} />
        </div>
      </div>

      {/* Pillar Breakdown */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle={`${userPlatform} Pillar Breakdown`} />
        <h3 className="text-base font-semibold text-card-foreground mb-4">Pillar Performance — {userPlatform}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Pillar</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Teams</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Agility</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Maturity</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Performance</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Stability</th>
              </tr>
            </thead>
            <tbody>
              {pillarData.map((pd, i) => (
                <tr key={pd.pillar} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-3 font-medium flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: PILLAR_COLORS[i % PILLAR_COLORS.length] }} />
                    {pd.pillar}
                  </td>
                  <td className="text-center py-3 px-3">{pd.teamCount}</td>
                  <td className="text-center py-3 px-3">{pd.agility}</td>
                  <td className="text-center py-3 px-3">{pd.maturity}</td>
                  <td className="text-center py-3 px-3">{pd.performance}</td>
                  <td className="text-center py-3 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      pd.stability >= 70 ? 'bg-green-100 text-green-800' :
                      pd.stability >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {pd.stability}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillar Chart */}
      {pillarData.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle="Pillar Comparison" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Pillar Metrics Comparison</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, pillarData.length * 55 + 60)}>
            <BarChart data={pillarData.map(d => ({ name: d.pillar, Agility: d.agility, Maturity: d.maturity, Performance: d.performance }))} layout="vertical" margin={{ left: 30, right: 20, top: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 10]} fontSize={11} />
              <YAxis dataKey="name" type="category" width={140} fontSize={10} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Agility" fill="hsl(185, 70%, 50%)" barSize={10} radius={[0, 3, 3, 0]} />
              <Bar dataKey="Maturity" fill="hsl(163, 100%, 21%)" barSize={10} radius={[0, 3, 3, 0]} />
              <Bar dataKey="Performance" fill="hsl(155, 60%, 40%)" barSize={10} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pillar Improvement */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
        <PillarImprovement platformFilter={userPlatform} />
      </div>

      {/* Action Items */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
        <ActionItems platformFilter={userPlatform} />
      </div>
    </div>
  );
};

export default UserTPLView;
