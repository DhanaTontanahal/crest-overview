import React, { useMemo, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Building2, TrendingUp, Award, Activity, Users, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, ArrowLeft, ClipboardList } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import PlatformPillarHeatmap from '@/components/PlatformPillarHeatmap';
import AssessmentView from '@/components/AssessmentView';
import { Button } from '@/components/ui/button';
import PillarImprovement from '@/components/PillarImprovement';
import ActionItems from '@/components/ActionItems';
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

const PILLAR_COLORS = [
  'hsl(163, 100%, 21%)',
  'hsl(155, 60%, 40%)',
  'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)',
  'hsl(170, 55%, 45%)',
  'hsl(140, 45%, 70%)',
];

const TrendArrow: React.FC<{ value: number }> = ({ value }) => {
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

const LTCCEOView: React.FC = () => {
  const { teams, selectedQuarter, quarterlyTrends, platforms, pillars, assessments, setAssessments } = useAppState();
  const [drillPlatform, setDrillPlatform] = useState<string | null>(null);
  const [drillPillar, setDrillPillar] = useState<string | null>(null);
  const [showAssessments, setShowAssessments] = useState(false);

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
    const excellence = (maturity * 0.6 + performance * 0.4);
    return { agility: +agility.toFixed(1), maturity: +maturity.toFixed(1), performance: +performance.toFixed(1), stability: Math.round(stability), excellence: +excellence.toFixed(1), teamCount: currentTeams.length };
  }, [currentTeams]);

  // QoQ change
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

  // --- DRILL-DOWN DATA ---
  const drillTeams = useMemo(() => {
    let filtered = currentTeams;
    if (drillPlatform) filtered = filtered.filter(t => t.platform === drillPlatform);
    if (drillPillar) filtered = filtered.filter(t => t.pillar === drillPillar);
    return filtered;
  }, [currentTeams, drillPlatform, drillPillar]);

  const drillPillarData = useMemo(() => {
    if (!drillPlatform) return [];
    return pillars.map(pillar => {
      const pTeams = currentTeams.filter(t => t.platform === drillPlatform && t.pillar === pillar);
      if (pTeams.length === 0) return { pillar, agility: 0, maturity: 0, performance: 0, stability: 0, teamCount: 0 };
      const avg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
        +(pTeams.reduce((s, t) => s + t[key], 0) / pTeams.length).toFixed(1);
      return { pillar, agility: avg('agility'), maturity: avg('maturity'), performance: avg('performance'), stability: Math.round(pTeams.reduce((s, t) => s + t.stability, 0) / pTeams.length), teamCount: pTeams.length };
    }).filter(d => d.teamCount > 0);
  }, [currentTeams, drillPlatform, pillars]);

  const isDrilling = drillPlatform !== null;

  // Breadcrumb navigation
  const handleBack = () => {
    if (drillPillar) {
      setDrillPillar(null);
    } else {
      setDrillPlatform(null);
    }
  };

  // --- DRILL-DOWN VIEW: PILLAR DETAIL ---
  if (drillPlatform && drillPillar) {
    const pillarTeams = drillTeams;
    const pillarAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      pillarTeams.length > 0 ? +(pillarTeams.reduce((s, t) => s + t[key], 0) / pillarTeams.length).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationFillMode: 'forwards' }}>
           <Button variant="ghost" size="sm" onClick={() => { setDrillPlatform(null); setDrillPillar(null); }} className="text-muted-foreground hover:text-foreground px-2">
            <Building2 className="w-4 h-4 mr-1" /> Overview
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Button variant="ghost" size="sm" onClick={() => setDrillPillar(null)} className="text-muted-foreground hover:text-foreground px-2">
            {drillPlatform}
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{drillPillar}</span>
        </div>

        <Button variant="outline" size="sm" onClick={handleBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to {drillPlatform}
        </Button>

        {/* Pillar KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Agility', value: pillarAvg('agility'), suffix: '/10' },
            { label: 'Maturity', value: pillarAvg('maturity'), suffix: '/10' },
            { label: 'Performance', value: pillarAvg('performance'), suffix: '/10' },
            { label: 'Stability', value: pillarTeams.length > 0 ? Math.round(pillarTeams.reduce((s, t) => s + t.stability, 0) / pillarTeams.length) : 0, suffix: '%' },
            { label: 'Teams', value: pillarTeams.length, suffix: '' },
          ].map((kpi, i) => (
            <div key={kpi.label} className="bg-card rounded-xl p-4 shadow-sm border border-border opacity-0 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards' }}>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{kpi.value}{kpi.suffix}</p>
            </div>
          ))}
        </div>

        {/* Team-level detail table */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle={`${drillPillar} Teams`} />
          <h3 className="text-base font-semibold text-card-foreground mb-4">Teams in {drillPillar} — {drillPlatform}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-muted-foreground font-medium">Team</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Agility</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Maturity</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Performance</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Stability</th>
                </tr>
              </thead>
              <tbody>
                {pillarTeams.map(t => (
                  <tr key={t.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-3 font-medium">{t.name}</td>
                    <td className="text-center py-3 px-3">{t.agility}</td>
                    <td className="text-center py-3 px-3">{t.maturity}</td>
                    <td className="text-center py-3 px-3">{t.performance}</td>
                    <td className="text-center py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.stability >= 70 ? 'bg-green-100 text-green-800' :
                        t.stability >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {t.stability}%
                      </span>
                    </td>
                  </tr>
                ))}
                {pillarTeams.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No teams found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Comparison Bar Chart */}
        {pillarTeams.length > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <ChartChatBox chartTitle={`${drillPillar} Team Comparison`} />
            <h3 className="text-base font-semibold text-card-foreground text-center">Team Comparison</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Side-by-side metrics for all teams in this pillar</p>
            <ResponsiveContainer width="100%" height={Math.max(200, pillarTeams.length * 50 + 60)}>
              <BarChart data={pillarTeams.map(t => ({ name: t.name, Agility: t.agility, Maturity: t.maturity, Performance: t.performance }))} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} fontSize={11} />
                <YAxis dataKey="name" type="category" width={100} fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Agility" fill="hsl(185, 70%, 50%)" barSize={10} radius={[0, 3, 3, 0]} />
                <Bar dataKey="Maturity" fill="hsl(163, 100%, 21%)" barSize={10} radius={[0, 3, 3, 0]} />
                <Bar dataKey="Performance" fill="hsl(155, 60%, 40%)" barSize={10} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  }

  // --- DRILL-DOWN VIEW: PLATFORM DETAIL ---
  if (drillPlatform) {
    const platformTeams = drillTeams;
    const platformAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      platformTeams.length > 0 ? +(platformTeams.reduce((s, t) => s + t[key], 0) / platformTeams.length).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <Button variant="ghost" size="sm" onClick={() => { setDrillPlatform(null); setDrillPillar(null); }} className="text-muted-foreground hover:text-foreground px-2">
            <Building2 className="w-4 h-4 mr-1" /> Overview
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{drillPlatform}</span>
        </div>

        <Button variant="outline" size="sm" onClick={handleBack} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Button>

        {/* Platform KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Agility', value: platformAvg('agility'), suffix: '/10' },
            { label: 'Maturity', value: platformAvg('maturity'), suffix: '/10' },
            { label: 'Performance', value: platformAvg('performance'), suffix: '/10' },
            { label: 'Stability', value: platformTeams.length > 0 ? Math.round(platformTeams.reduce((s, t) => s + t.stability, 0) / platformTeams.length) : 0, suffix: '%' },
            { label: 'Teams', value: platformTeams.length, suffix: '' },
          ].map((kpi, i) => (
            <div key={kpi.label} className="bg-card rounded-xl p-4 shadow-sm border border-border opacity-0 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards' }}>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{kpi.value}{kpi.suffix}</p>
            </div>
          ))}
        </div>

        {/* Pillar Breakdown - clickable to drill into pillar */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle={`${drillPlatform} Pillar Breakdown`} />
          <h3 className="text-base font-semibold text-card-foreground mb-4">Pillar Breakdown — {drillPlatform}</h3>
          <p className="text-xs text-muted-foreground mb-4">Click any pillar row to drill down further</p>
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
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {drillPillarData.map((pd, i) => (
                  <tr
                    key={pd.pillar}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setDrillPillar(pd.pillar)}
                  >
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
                    <td className="text-center py-3 px-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors inline-block" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pillar Comparison Chart */}
        {drillPillarData.length > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <ChartChatBox chartTitle={`${drillPlatform} Pillar Comparison`} />
            <h3 className="text-base font-semibold text-card-foreground text-center">Pillar Metrics Comparison</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Click bars to drill into individual pillars</p>
            <ResponsiveContainer width="100%" height={Math.max(200, drillPillarData.length * 55 + 60)}>
              <BarChart
                data={drillPillarData.map(d => ({ name: d.pillar, Agility: d.agility, Maturity: d.maturity, Performance: d.performance }))}
                layout="vertical"
                margin={{ left: 30, right: 20, top: 5, bottom: 5 }}
                onClick={(data) => {
                  if (data?.activeLabel) setDrillPillar(data.activeLabel);
                }}
                style={{ cursor: 'pointer' }}
              >
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

        {/* Platform Assessment */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-card-foreground">Assessment — {drillPlatform}</h3>
          </div>
          <AssessmentView
            assessments={assessments}
            canDrillDown
            platformFilter={drillPlatform}
          />
        </div>
      </div>
    );
  }

  // --- TOP-LEVEL CEO VIEW ---
  return (
    <div className="space-y-6">
      {/* CEO Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Consolidated Organisation View</h2>
            <p className="text-sm text-muted-foreground">Organisation-wide health across all platforms</p>
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
          <p className="text-xs text-muted-foreground text-center mb-4">Click a bar to drill into platform details</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={platformStability}
              margin={{ left: 10, right: 20, top: 10, bottom: 10 }}
              onClick={(data) => {
                if (data?.activeLabel) setDrillPlatform(data.activeLabel);
              }}
              style={{ cursor: 'pointer' }}
            >
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

      {/* Heatmap */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
        <PlatformPillarHeatmap onDrill={(platform, pillar) => { setDrillPlatform(platform); setDrillPillar(pillar); }} />
      </div>

      {/* Platform Summary Table - clickable rows */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle="Platform Summary" />
        <h3 className="text-base font-semibold text-card-foreground mb-1">Platform Summary — {selectedQuarter}</h3>
        <p className="text-xs text-muted-foreground mb-4">Click any platform to drill down into pillar details</p>
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
                <th className="text-center py-2 px-3 text-muted-foreground font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {platformRadar.map((p, i) => {
                const pStab = platformStability.find(ps => ps.platform === p.platform);
                return (
                  <tr
                    key={p.platform}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => setDrillPlatform(p.platform)}
                  >
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
                    <td className="text-center py-3 px-3">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pillar Improvement */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
        <PillarImprovement />
      </div>

      {/* Action Items */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '1.0s', animationFillMode: 'forwards' }}>
        <ActionItems />
      </div>

      {/* Assessments Overview */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-card-foreground">Platform Assessments — {selectedQuarter}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAssessments(!showAssessments)}>
            {showAssessments ? 'Hide' : 'Show'} Assessments
          </Button>
        </div>
        {showAssessments && (
          <AssessmentView assessments={assessments} canDrillDown />
        )}
        {!showAssessments && (
          <p className="text-sm text-muted-foreground">Click "Show Assessments" to view all platform maturity assessments with drill-down capability.</p>
        )}
      </div>
    </div>
  );
};

export default LTCCEOView;
