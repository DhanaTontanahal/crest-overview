import React, { useMemo, useCallback, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { CalculationMethod } from '@/context/AppContext';
import GaugeChart from '@/components/GaugeChart';

import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import UserTPLView from '@/components/UserTPLView';
import PageHeader from '@/components/PageHeader';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { Calculator, TrendingUp, TrendingDown, Minus, Target, Shield, Zap, BarChart3, ArrowRight, X } from 'lucide-react';

const CALC_LABELS: Record<string, string> = {
  simple: 'Simple Avg',
  weighted: 'Weighted Avg',
  median: 'Median',
  trimmed: 'Trimmed Mean',
};

const METRIC_COLORS: Record<string, string> = {
  Stability: 'hsl(185, 70%, 50%)',
  Maturity: 'hsl(163, 100%, 21%)',
  Performance: 'hsl(155, 60%, 40%)',
  Agility: 'hsl(45, 80%, 50%)',
};

interface MetricInsight {
  key: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  dimensions: { name: string; score: number; trend: 'up' | 'down' | 'stable'; insight: string }[];
  summary: string;
  improvements: string[];
}

const OverviewPage: React.FC = () => {
  const { user, teams, platforms, selectedPlatform, setSelectedPlatform, selectedPillar, selectedQuarter, cios, calculationMethod,
    maturityDimensions, performanceMetrics, stabilityDimensions, agilityDimensions, quarterlyTrends } = useAppState();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Auto-set platform for supervisors
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId ? cios.find(c => c.id === user.cioId)?.platform : undefined;
  React.useEffect(() => {
    if (supervisorPlatform && selectedPlatform !== supervisorPlatform) {
      setSelectedPlatform(supervisorPlatform);
    }
  }, [supervisorPlatform]);

  const calc = useCallback((values: number[]): number => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    switch (calculationMethod) {
      case 'weighted':
        return values.reduce((s, v) => s + v, 0) / values.length;
      case 'median':
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      case 'trimmed': {
        const trimCount = Math.max(1, Math.floor(sorted.length * 0.1));
        if (sorted.length <= trimCount * 2) return sorted.reduce((s, v) => s + v, 0) / sorted.length;
        const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
        return trimmed.reduce((s, v) => s + v, 0) / trimmed.length;
      }
      case 'simple':
      default:
        return values.reduce((s, v) => s + v, 0) / values.length;
    }
  }, [calculationMethod]);

  const filteredTeams = useMemo(() => {
    if (!user) return [];
    return teams.filter(t => {
      if (t.quarter !== selectedQuarter) return false;
      if (user.role === 'supervisor' && user.cioId) {
        const cio = cios.find(c => c.id === user.cioId);
        if (cio && t.platform !== cio.platform) return false;
      }
      if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
      if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
      return true;
    });
  }, [teams, selectedPlatform, selectedPillar, selectedQuarter, user, cios]);

  const avgStability = filteredTeams.length > 0 ? Math.round(calc(filteredTeams.map(t => t.stability))) : 0;
  const avgMaturity = filteredTeams.length > 0 ? Math.round(calc(filteredTeams.map(t => t.maturity)) * 10) : 0;
  const avgPerformance = filteredTeams.length > 0 ? Math.round(calc(filteredTeams.map(t => t.performance)) * 10) : 0;
  const avgAgility = filteredTeams.length > 0 ? Math.round(calc(filteredTeams.map(t => t.agility)) * 10) : 0;

  // Build metric insights from dimension data
  const metricInsights = useMemo((): MetricInsight[] => {
    const getTrend = (name: string, dims: typeof maturityDimensions): 'up' | 'down' | 'stable' => {
      const d = dims.find(d => d.name === name);
      if (!d) return 'stable';
      return d.average >= 7 ? 'up' : d.average < 5 ? 'down' : 'stable';
    };

    const currentTrend = quarterlyTrends.find(t => t.quarter === selectedQuarter);
    const prevIdx = quarterlyTrends.findIndex(t => t.quarter === selectedQuarter) - 1;
    const prevTrend = prevIdx >= 0 ? quarterlyTrends[prevIdx] : null;

    const stabilityDelta = currentTrend && prevTrend ? currentTrend.stability - prevTrend.stability : 0;
    const maturityDelta = currentTrend && prevTrend ? currentTrend.maturity - prevTrend.maturity : 0;
    const performanceDelta = currentTrend && prevTrend ? currentTrend.performance - prevTrend.performance : 0;
    const agilityDelta = currentTrend && prevTrend ? currentTrend.agility - prevTrend.agility : 0;

    return [
      {
        key: 'stability',
        title: 'Overall Team Stability',
        icon: <Shield className="w-5 h-5" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50 border-cyan-200',
        dimensions: stabilityDimensions.map(d => ({
          name: d.name,
          score: d.average,
          trend: d.average >= 7 ? 'up' as const : d.average < 5 ? 'down' as const : 'stable' as const,
          insight: d.average >= 7 ? 'Strong performance — maintain current practices' : d.average < 5 ? 'Needs immediate attention and improvement plan' : 'On track — continue monitoring progress',
        })),
        summary: stabilityDelta >= 0
          ? `Stability improved by ${Math.abs(stabilityDelta).toFixed(0)}% QoQ, driven by workforce retention and role clarity initiatives.`
          : `Stability declined by ${Math.abs(stabilityDelta).toFixed(0)}% QoQ — review team composition and succession planning.`,
        improvements: [
          'Strengthen succession planning across all platforms',
          'Reduce contractor dependency through targeted hiring',
          'Implement structured onboarding for improved tenure',
          'Establish clear role definitions and career pathways',
        ],
      },
      {
        key: 'maturity',
        title: 'Overall Maturity',
        icon: <Target className="w-5 h-5" />,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-200',
        dimensions: maturityDimensions.map(d => ({
          name: d.name,
          score: d.average,
          trend: d.average >= 7 ? 'up' as const : d.average < 5 ? 'down' as const : 'stable' as const,
          insight: d.average >= 7 ? 'Mature capability — focus on sustaining excellence' : d.average < 5 ? 'Foundational gaps require strategic investment' : 'Building momentum — accelerate adoption',
        })),
        summary: maturityDelta >= 0
          ? `Maturity grew ${maturityDelta.toFixed(1)} points QoQ through improved leadership alignment and cultural embedding.`
          : `Maturity regressed ${Math.abs(maturityDelta).toFixed(1)} points — revisit transformation roadmap priorities.`,
        improvements: [
          'Deepen product-centric operating model adoption',
          'Embed continuous feedback culture across pillars',
          'Align joint BPL/TPL OKRs to value outcomes',
          'Invest in foundational capability building',
        ],
      },
      {
        key: 'performance',
        title: 'Overall Performance',
        icon: <BarChart3 className="w-5 h-5" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50 border-green-200',
        dimensions: performanceMetrics.map(d => ({
          name: d.name,
          score: d.average,
          trend: d.average >= 7 ? 'up' as const : d.average < 5 ? 'down' as const : 'stable' as const,
          insight: d.average >= 7 ? 'High-performing — benchmark and share practices' : d.average < 5 ? 'Critical bottleneck requiring process redesign' : 'Progressing — identify and remove remaining blockers',
        })),
        summary: performanceDelta >= 0
          ? `Performance increased ${performanceDelta.toFixed(1)} points QoQ, with deployment frequency and predictability leading gains.`
          : `Performance dipped ${Math.abs(performanceDelta).toFixed(1)} points — focus on DORA metrics improvement.`,
        improvements: [
          'Accelerate CI/CD pipeline adoption across teams',
          'Reduce change fail rate through automated testing',
          'Improve deployment frequency to weekly or better',
          'Shorten lead time through value stream mapping',
        ],
      },
      {
        key: 'agility',
        title: 'Overall Agility',
        icon: <Zap className="w-5 h-5" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50 border-amber-200',
        dimensions: agilityDimensions.map(d => ({
          name: d.name,
          score: d.average,
          trend: d.average >= 7 ? 'up' as const : d.average < 5 ? 'down' as const : 'stable' as const,
          insight: d.average >= 7 ? 'Highly agile — foster innovation experiments' : d.average < 5 ? 'Rigid processes limiting responsiveness' : 'Evolving — embed agile practices deeper',
        })),
        summary: agilityDelta >= 0
          ? `Agility improved ${agilityDelta.toFixed(1)} points QoQ through better adaptive planning and ceremony effectiveness.`
          : `Agility declined ${Math.abs(agilityDelta).toFixed(1)} points — review agile ceremony effectiveness and tooling adoption.`,
        improvements: [
          'Embed flow-based planning (Kanban) across teams',
          'Drive Horizon 2/3 experimentation and innovation',
          'Improve retrospective action tracking and outcomes',
          'Accelerate time-to-market through governance automation',
        ],
      },
    ];
  }, [maturityDimensions, performanceMetrics, stabilityDimensions, agilityDimensions, quarterlyTrends, selectedQuarter]);

  const isSuperUser = user?.role === 'superuser';
  const showDashboard = isSuperUser || user?.role === 'admin' || user?.role === 'supervisor';
  const isTPL = user?.role === 'user';
  const isSpecificPlatform = selectedPlatform !== 'All';

  const handleGaugeClick = (metricKey: string) => {
    setSelectedMetric(prev => prev === metricKey ? null : metricKey);
  };

  const selectedInsight = metricInsights.find(m => m.key === selectedMetric);

  const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'stable' }> = ({ trend }) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-amber-500" />;
  };

  const gaugeConfigs = [
    { value: avgStability, key: 'stability', title: 'Overall Team Stability', subtitle: isSpecificPlatform ? `${selectedPlatform} stability` : 'How stable are my teams?' },
    { value: avgMaturity, key: 'maturity', title: 'Overall Maturity', subtitle: isSpecificPlatform ? `${selectedPlatform} maturity` : 'How mature are my teams?' },
    { value: avgPerformance, key: 'performance', title: 'Overall Performance', subtitle: isSpecificPlatform ? `${selectedPlatform} performance` : 'How well are teams performing?' },
    { value: avgAgility, key: 'agility', title: 'Overall Agility', subtitle: isSpecificPlatform ? `${selectedPlatform} agility` : 'How agile are my teams?' },
  ];

  const renderGauges = () => (
    <>
      <div className="relative">
        <span className="absolute -top-1 right-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full" aria-label={`Using ${CALC_LABELS[calculationMethod]} calculation`}>
          <Calculator className="w-3 h-3" /> {CALC_LABELS[calculationMethod]}
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Key metrics gauges">
          {gaugeConfigs.map((gauge, i) => (
            <div
              key={i}
              className={`opacity-0 animate-slide-up cursor-pointer transition-all duration-300 rounded-xl ${
                selectedMetric === gauge.key ? 'ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}
              onClick={() => handleGaugeClick(gauge.key)}
            >
              <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={filteredTeams.length} />
            </div>
          ))}
        </div>
      </div>

      {/* Expandable Metric Detail Panel */}
      {selectedInsight && (
        <div className={`mt-6 rounded-xl border-2 ${selectedInsight.bgColor} overflow-hidden animate-scale-in`} style={{ animationFillMode: 'forwards' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-card flex items-center justify-center ${selectedInsight.color}`}>
                {selectedInsight.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{selectedInsight.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedQuarter} • Dimension Breakdown & Insights</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedMetric(null)}
              className="w-8 h-8 rounded-full bg-card/80 hover:bg-card flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Dimension Mind Map */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Dimension Scores
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedInsight.dimensions.map((dim, idx) => (
                  <div
                    key={dim.name}
                    className="bg-card rounded-lg p-4 border border-border/50 shadow-sm opacity-0 animate-fade-in hover:shadow-md transition-shadow"
                    style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'forwards' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-card-foreground">{dim.name}</span>
                      <div className="flex items-center gap-1.5">
                        <TrendIcon trend={dim.trend} />
                        <span className={`text-lg font-bold ${
                          dim.score >= 7 ? 'text-green-600' : dim.score >= 5 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {dim.score.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="w-full h-2 bg-muted rounded-full mb-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          dim.score >= 7 ? 'bg-green-500' : dim.score >= 5 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(dim.score / 10) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{dim.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary & Improvements */}
            <div className="space-y-4">
              {/* Summary */}
              <div className="bg-card rounded-lg p-4 border border-border/50 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Quarter Summary
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedInsight.summary}</p>
              </div>

              {/* Improvement Areas */}
              <div className="bg-card rounded-lg p-4 border border-border/50 shadow-sm opacity-0 animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'forwards' }}>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> Key Improvements
                </h4>
                <ul className="space-y-2.5">
                  {selectedInsight.improvements.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground opacity-0 animate-fade-in"
                      style={{ animationDelay: `${400 + idx * 80}ms`, animationFillMode: 'forwards' }}
                    >
                      <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <section aria-label="Overview dashboard">
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <ExcelUpload />
          <AdminSettings />
        </div>
      )}

      {isTPL && (
        <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <UserTPLView />
        </div>
      )}


      {showDashboard && (
        <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <PageHeader
            title="Overview"
            subtitle="High-level health gauges across all four key metrics — click any gauge to expand dimension insights."
            infoContent={[
              'Gauges show aggregated team scores for the selected quarter, platform, and pillar filters.',
              'Click a gauge to expand a detailed breakdown of its contributing dimensions.',
              'The calculation method (simple avg, weighted, median, trimmed) can be changed in Admin Settings.',
              'Supervisors see only their assigned platform; Super Users see the full organisation.',
            ]}
          />
          {renderGauges()}
        </div>
      )}
    </section>
  );
};

export default OverviewPage;
