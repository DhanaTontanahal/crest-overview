import React, { useMemo, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Building2, Activity, Award, Users, TrendingUp, ArrowUpRight, ArrowDownRight, Minus, ChevronRight, ArrowLeft, ClipboardList } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import GaugeChart from '@/components/GaugeChart';
import DimensionChart from '@/components/DimensionChart';
import PillarImprovement from '@/components/PillarImprovement';
import ActionItems from '@/components/ActionItems';
import AssessmentView from '@/components/AssessmentView';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const PILLAR_COLORS = [
  'hsl(163, 100%, 21%)', 'hsl(155, 60%, 40%)', 'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)', 'hsl(170, 55%, 45%)', 'hsl(140, 45%, 70%)',
];

const TrendArrow: React.FC<{ value: number }> = ({ value }) => {
  if (value > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
  if (value < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

interface SupervisorViewProps {
  platform: string;
}

const SupervisorView: React.FC<SupervisorViewProps> = ({ platform }) => {
  const { teams, selectedQuarter, pillars, maturityDimensions, performanceMetrics, assessments } = useAppState();
  const [drillPillar, setDrillPillar] = useState<string | null>(null);
  const [showAssessments, setShowAssessments] = useState(false);

  const platformTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter && t.platform === platform),
    [teams, selectedQuarter, platform]
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

  // --- PILLAR DRILL-DOWN ---
  if (drillPillar) {
    const pillarTeams = platformTeams.filter(t => t.pillar === drillPillar);
    const pillarAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      pillarTeams.length > 0 ? +(pillarTeams.reduce((s, t) => s + t[key], 0) / pillarTeams.length).toFixed(1) : 0;

    return (
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <Button variant="ghost" size="sm" onClick={() => setDrillPillar(null)} className="text-muted-foreground hover:text-foreground px-2">
            <Building2 className="w-4 h-4 mr-1" /> {platform}
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{drillPillar}</span>
        </div>

        <Button variant="outline" size="sm" onClick={() => setDrillPillar(null)} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to {platform}
        </Button>

        {/* KPI cards */}
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

        {/* Team detail table */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle={`${drillPillar} Teams`} />
          <h3 className="text-base font-semibold text-card-foreground mb-4">Teams in {drillPillar} — {platform}</h3>
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
                      }`}>{t.stability}%</span>
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

        {/* Team Comparison Bar */}
        {pillarTeams.length > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <ChartChatBox chartTitle="Team Comparison" />
            <h3 className="text-base font-semibold text-card-foreground text-center">Team Comparison</h3>
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

  // --- MAIN SUPERVISOR VIEW ---
  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Supervisor (CIO) — {platform}</h2>
            <p className="text-sm text-muted-foreground">Platform health, pillar drill-down, and assessment oversight</p>
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

      {/* Dimension Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Maturity Dimensions" subtitle="How dimensions contribute to maturity" dimensions={maturityDimensions} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Performance Metrics" subtitle="How metrics contribute to performance" dimensions={performanceMetrics} />
        </div>
      </div>

      {/* Pillar Breakdown - clickable to drill down */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle={`${platform} Pillar Breakdown`} />
        <h3 className="text-base font-semibold text-card-foreground mb-1">Pillar Breakdown — {platform}</h3>
        <p className="text-xs text-muted-foreground mb-4">Click any pillar to drill down into team details</p>
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
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {pillarData.map((pd, i) => (
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
                    }`}>{pd.stability}%</span>
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

      {/* Radar Chart */}
      {pillarData.length > 0 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle={`${platform} Pillar Radar`} />
          <h3 className="text-base font-semibold text-card-foreground text-center">Pillar Radar — {platform}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={pillarData.map(d => ({ pillar: d.pillar, Agility: d.agility, Maturity: d.maturity, Performance: d.performance }))}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Radar name="Agility" dataKey="Agility" stroke="hsl(185, 70%, 50%)" fill="hsl(185, 70%, 50%)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Maturity" dataKey="Maturity" stroke="hsl(163, 100%, 21%)" fill="hsl(163, 100%, 21%)" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Performance" dataKey="Performance" stroke="hsl(155, 60%, 40%)" fill="hsl(155, 60%, 40%)" fillOpacity={0.15} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Pillar Improvement */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
        <PillarImprovement platformFilter={platform} />
      </div>

      {/* Action Items */}
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
        <ActionItems platformFilter={platform} />
      </div>

      {/* Assessments */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            <h3 className="text-base font-semibold text-card-foreground">Platform Assessment — {platform}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowAssessments(!showAssessments)}>
            {showAssessments ? 'Hide' : 'Show'} Assessment
          </Button>
        </div>
        {showAssessments && (
          <AssessmentView assessments={assessments} canDrillDown platformFilter={platform} />
        )}
        {!showAssessments && (
          <p className="text-sm text-muted-foreground">Click "Show Assessment" to view the assessment submitted by the TPL for {platform}.</p>
        )}
      </div>
    </div>
  );
};

export default SupervisorView;
