import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Building2, TrendingUp, Award, Activity, Users, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ComposedChart, Line, Area, Cell, Legend,
} from 'recharts';

const PLATFORM_COLORS = [
  'hsl(163, 100%, 21%)',
  'hsl(155, 60%, 40%)',
  'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)',
];

const TrendArrow: React.FC<{ value: number }> = ({ value }) => {
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const LTCCEOView: React.FC = () => {
  const { teams, selectedQuarter, quarterlyTrends, platforms, timeSeries } = useAppState();

  const currentTeams = useMemo(() => teams.filter(t => t.quarter === selectedQuarter), [teams, selectedQuarter]);

  // Org-wide KPIs
  const orgMetrics = useMemo(() => {
    if (currentTeams.length === 0) return { agility: 0, maturity: 0, performance: 0, stability: 0, excellence: 0, teamCount: 0 };
    const avg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      currentTeams.reduce((s, t) => s + t[key], 0) / currentTeams.length;
    const agility = avg('agility');
    const maturity = avg('maturity');
    const performance = avg('performance');
    const stability = avg('stability');
    // Excellence = weighted combo of maturity + performance
    const excellence = (maturity * 0.6 + performance * 0.4);
    return { agility: +agility.toFixed(1), maturity: +maturity.toFixed(1), performance: +performance.toFixed(1), stability: Math.round(stability), excellence: +excellence.toFixed(1), teamCount: currentTeams.length };
  }, [currentTeams]);

  // Quarter-over-quarter change
  const qoqChange = useMemo(() => {
    const qIdx = quarterlyTrends.findIndex(q => q.quarter === selectedQuarter);
    if (qIdx <= 0) return { agility: 0, stability: 0, maturity: 0 };
    const curr = quarterlyTrends[qIdx];
    const prev = quarterlyTrends[qIdx - 1];
    return {
      agility: +(curr.agility - prev.agility).toFixed(1),
      stability: Math.round(curr.stability - prev.stability),
      maturity: +(curr.maturity - prev.maturity).toFixed(1),
    };
  }, [quarterlyTrends, selectedQuarter]);

  // Platform breakdown for radar
  const platformRadar = useMemo(() => {
    return platforms.map(p => {
      const pTeams = currentTeams.filter(t => t.platform === p);
      if (pTeams.length === 0) return { platform: p, agility: 0, maturity: 0, performance: 0, stability: 0 };
      const avg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
        +(pTeams.reduce((s, t) => s + t[key], 0) / pTeams.length).toFixed(1);
      return { platform: p, agility: avg('agility'), maturity: avg('maturity'), performance: avg('performance'), stability: +(avg('stability') / 10).toFixed(1) };
    });
  }, [currentTeams, platforms]);

  // Platform stability bar data
  const platformStability = useMemo(() => {
    return platforms.map(p => {
      const pTeams = currentTeams.filter(t => t.platform === p);
      const stability = pTeams.length > 0 ? Math.round(pTeams.reduce((s, t) => s + t.stability, 0) / pTeams.length) : 0;
      const teamCount = pTeams.length;
      return { platform: p, stability, teamCount };
    });
  }, [currentTeams, platforms]);

  const kpiCards = [
    { label: 'Business Agility', value: orgMetrics.agility, suffix: '/10', icon: Activity, change: qoqChange.agility, color: 'hsl(185, 70%, 50%)' },
    { label: 'Excellence First', value: orgMetrics.excellence, suffix: '/10', icon: Award, change: qoqChange.maturity, color: 'hsl(163, 100%, 21%)' },
    { label: 'Org Stability', value: orgMetrics.stability, suffix: '%', icon: Users, change: qoqChange.stability, color: 'hsl(155, 60%, 40%)' },
    { label: 'Active Teams', value: orgMetrics.teamCount, suffix: '', icon: Building2, change: 0, color: 'hsl(145, 50%, 55%)' },
  ];

  return (
    <div className="space-y-6">
      {/* CEO Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">LTC CEO Consolidated View</h2>
            <p className="text-sm text-muted-foreground">Organisation-wide health across all platforms — LTC India (subsidiary of LBG UK)</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div
            key={kpi.label}
            className="bg-card rounded-xl p-5 shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 opacity-0 animate-slide-up relative"
            style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}
          >
            <ChartChatBox chartTitle={kpi.label} />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${kpi.color}20` }}>
                <kpi.icon className="w-5 h-5" style={{ color: kpi.color }} />
              </div>
              {kpi.change !== 0 && (
                <div className="flex items-center gap-0.5 text-xs font-medium">
                  <TrendArrow value={kpi.change} />
                  <span className={kpi.change > 0 ? 'text-green-600' : kpi.change < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}{kpi.suffix === '%' ? 'pp' : ''}
                  </span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}{kpi.suffix}</p>
            <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Radar */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle="Platform Health Radar" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Platform Health Radar</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Cross-platform comparison across all dimensions</p>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={[
              { dimension: 'Agility', ...Object.fromEntries(platformRadar.map(p => [p.platform, p.agility])) },
              { dimension: 'Maturity', ...Object.fromEntries(platformRadar.map(p => [p.platform, p.maturity])) },
              { dimension: 'Performance', ...Object.fromEntries(platformRadar.map(p => [p.platform, p.performance])) },
              { dimension: 'Stability', ...Object.fromEntries(platformRadar.map(p => [p.platform, p.stability])) },
            ]}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Tooltip />
              {platforms.map((p, i) => (
                <Radar key={p} name={p} dataKey={p} stroke={PLATFORM_COLORS[i]} fill={PLATFORM_COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Stability Bars */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle="Stability by Platform" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Stability by Platform</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Organisation-wide stability indicators per platform</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformStability} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" fontSize={11} />
              <YAxis domain={[0, 100]} fontSize={11} />
              <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
              <Bar dataKey="stability" name="Stability %" radius={[6, 6, 0, 0]} barSize={48} animationDuration={1200}>
                {platformStability.map((_, i) => (
                  <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle="Business Agility & Excellence Trajectory" />
        <h3 className="text-base font-semibold text-card-foreground text-center">Business Agility & Excellence Trajectory</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">Quarter-over-quarter organisation-wide progression</p>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={quarterlyTrends} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="quarter" fontSize={11} />
            <YAxis domain={[0, 10]} fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="weightedAverage" fill="hsl(163, 100%, 21%)" fillOpacity={0.1} stroke="none" name="Weighted Avg (area)" />
            <Line type="monotone" dataKey="agility" stroke="hsl(185, 70%, 50%)" strokeWidth={3} dot={{ r: 5 }} name="Business Agility" animationDuration={1500} />
            <Line type="monotone" dataKey="maturity" stroke="hsl(163, 100%, 21%)" strokeWidth={3} dot={{ r: 5 }} name="Excellence (Maturity)" animationDuration={1500} />
            <Line type="monotone" dataKey="performance" stroke="hsl(155, 60%, 40%)" strokeWidth={2} dot={{ r: 4 }} name="Performance" strokeDasharray="5 5" animationDuration={1500} />
            <Line type="monotone" dataKey={() => 7.5} stroke="hsl(0, 0%, 60%)" strokeWidth={1} strokeDasharray="8 4" dot={false} name="Target (7.5)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Summary Table */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle="Platform Summary" />
        <h3 className="text-base font-semibold text-card-foreground mb-4">Platform Summary — {selectedQuarter}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-3 text-muted-foreground font-medium">Platform</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Teams</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Agility</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Maturity</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Performance</th>
                <th className="text-center py-2 px-3 text-muted-foreground font-medium">Stability</th>
              </tr>
            </thead>
            <tbody>
              {platformRadar.map((p, i) => {
                const pStab = platformStability.find(ps => ps.platform === p.platform);
                return (
                  <tr key={p.platform} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-medium flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: PLATFORM_COLORS[i] }} />
                      {p.platform}
                    </td>
                    <td className="text-center py-3 px-3">{pStab?.teamCount ?? 0}</td>
                    <td className="text-center py-3 px-3">{p.agility}</td>
                    <td className="text-center py-3 px-3">{p.maturity}</td>
                    <td className="text-center py-3 px-3">{p.performance}</td>
                    <td className="text-center py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        (pStab?.stability ?? 0) >= 70 ? 'bg-green-100 text-green-800' :
                        (pStab?.stability ?? 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {pStab?.stability ?? 0}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LTCCEOView;
