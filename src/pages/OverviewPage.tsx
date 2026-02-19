import React, { useMemo, useCallback } from 'react';
import { useAppState } from '@/context/AppContext';
import { CalculationMethod } from '@/context/AppContext';
import GaugeChart from '@/components/GaugeChart';
import DimensionChart from '@/components/DimensionChart';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import UserTPLView from '@/components/UserTPLView';
import SupervisorView from '@/components/SupervisorView';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { Calculator } from 'lucide-react';

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

const OverviewPage: React.FC = () => {
  const { user, teams, platforms, selectedPlatform, selectedPillar, selectedQuarter, cios, maturityDimensions, performanceMetrics, stabilityDimensions, agilityDimensions, calculationMethod } = useAppState();

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

  const platformComparisonData = useMemo(() => {
    if (selectedPlatform === 'All') return null;
    const quarterTeams = teams.filter(t => t.quarter === selectedQuarter && (selectedPillar === 'All' || t.pillar === selectedPillar));
    const calcAvg = (pTeams: typeof quarterTeams) => {
      if (pTeams.length === 0) return { stability: 0, maturity: 0, performance: 0, agility: 0 };
      return {
        stability: Math.round(calc(pTeams.map(t => t.stability))),
        maturity: Math.round(calc(pTeams.map(t => t.maturity)) * 10),
        performance: Math.round(calc(pTeams.map(t => t.performance)) * 10),
        agility: Math.round(calc(pTeams.map(t => t.agility)) * 10),
      };
    };
    const allAvg = calcAvg(quarterTeams);
    return platforms.map(p => {
      const pTeams = quarterTeams.filter(t => t.platform === p);
      const avg = calcAvg(pTeams);
      return { platform: p, Stability: avg.stability, Maturity: avg.maturity, Performance: avg.performance, Agility: avg.agility, isSelected: p === selectedPlatform };
    }).concat([{ platform: 'All Platforms', Stability: allAvg.stability, Maturity: allAvg.maturity, Performance: allAvg.performance, Agility: allAvg.agility, isSelected: false }]);
  }, [teams, platforms, selectedPlatform, selectedPillar, selectedQuarter, calc]);

  const isSuperUser = user?.role === 'superuser';
  const showDashboard = isSuperUser || user?.role === 'admin';
  const showSupervisor = user?.role === 'supervisor';
  const isTPL = user?.role === 'user';
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId ? cios.find(c => c.id === user.cioId)?.platform : undefined;
  const isSpecificPlatform = selectedPlatform !== 'All' && showDashboard;

  const renderGaugesAndDimensions = () => (
    <>
      {!isSpecificPlatform && (
        <div className="relative">
          <span className="absolute -top-1 right-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full" aria-label={`Using ${CALC_LABELS[calculationMethod]} calculation`}>
            <Calculator className="w-3 h-3" /> {CALC_LABELS[calculationMethod]}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" role="region" aria-label="Key metrics gauges">
            {[
              { value: avgStability, title: 'Overall Team Stability', subtitle: 'How stable are my teams?' },
              { value: avgMaturity, title: 'Overall Maturity', subtitle: 'How mature are my teams?' },
              { value: avgPerformance, title: 'Overall Performance', subtitle: 'How well are teams performing?' },
              { value: avgAgility, title: 'Overall Agility', subtitle: 'How agile are my teams?' },
            ].map((gauge, i) => (
              <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}>
                <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={filteredTeams.length} />
              </div>
            ))}
          </div>
        </div>
      )}

      {isSpecificPlatform && platformComparisonData && (
        <>
          <div className="relative">
            <span className="absolute -top-1 right-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full" aria-label={`Using ${CALC_LABELS[calculationMethod]} calculation`}>
              <Calculator className="w-3 h-3" /> {CALC_LABELS[calculationMethod]}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { value: avgStability, title: 'Overall Team Stability', subtitle: `${selectedPlatform} stability` },
                { value: avgMaturity, title: 'Overall Maturity', subtitle: `${selectedPlatform} maturity` },
                { value: avgPerformance, title: 'Overall Performance', subtitle: `${selectedPlatform} performance` },
                { value: avgAgility, title: 'Overall Agility', subtitle: `${selectedPlatform} agility` },
              ].map((gauge, i) => (
                <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}>
                  <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={filteredTeams.length} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Stability Dimensions" subtitle="How dimensions contribute to stability" dimensions={stabilityDimensions} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Maturity Dimensions" subtitle="How dimensions contribute to maturity" dimensions={maturityDimensions} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Performance Metrics" subtitle="How metrics contribute to performance" dimensions={performanceMetrics} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Agility Dimensions" subtitle="How dimensions contribute to agility" dimensions={agilityDimensions} />
        </div>
      </div>
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

      {showSupervisor && supervisorPlatform && (
        <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <SupervisorView platform={supervisorPlatform} />
        </div>
      )}

      {showDashboard && (
        <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          {renderGaugesAndDimensions()}
        </div>
      )}
    </section>
  );
};

export default OverviewPage;
