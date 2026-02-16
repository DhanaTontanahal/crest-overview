import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import GaugeChart from '@/components/GaugeChart';
import DimensionChart from '@/components/DimensionChart';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import LTCCEOView from '@/components/LTCCEOView';
import UserTPLView from '@/components/UserTPLView';
import SupervisorView from '@/components/SupervisorView';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ReferenceLine,
} from 'recharts';

const METRIC_COLORS: Record<string, string> = {
  Stability: 'hsl(185, 70%, 50%)',
  Maturity: 'hsl(163, 100%, 21%)',
  Performance: 'hsl(155, 60%, 40%)',
};

const OverviewPage: React.FC = () => {
  const { user, teams, platforms, selectedPlatform, selectedPillar, selectedQuarter, cios, maturityDimensions, performanceMetrics } = useAppState();

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

  const avgStability = filteredTeams.length > 0
    ? Math.round(filteredTeams.reduce((s, t) => s + t.stability, 0) / filteredTeams.length) : 0;
  const avgMaturity = filteredTeams.length > 0
    ? Math.round((filteredTeams.reduce((s, t) => s + t.maturity, 0) / filteredTeams.length) * 10) : 0;
  const avgPerformance = filteredTeams.length > 0
    ? Math.round((filteredTeams.reduce((s, t) => s + t.performance, 0) / filteredTeams.length) * 10) : 0;

  const platformComparisonData = useMemo(() => {
    if (selectedPlatform === 'All') return null;
    const quarterTeams = teams.filter(t => t.quarter === selectedQuarter && (selectedPillar === 'All' || t.pillar === selectedPillar));

    const calcAvg = (pTeams: typeof quarterTeams) => {
      if (pTeams.length === 0) return { stability: 0, maturity: 0, performance: 0 };
      return {
        stability: Math.round(pTeams.reduce((s, t) => s + t.stability, 0) / pTeams.length),
        maturity: Math.round((pTeams.reduce((s, t) => s + t.maturity, 0) / pTeams.length) * 10),
        performance: Math.round((pTeams.reduce((s, t) => s + t.performance, 0) / pTeams.length) * 10),
      };
    };

    const allAvg = calcAvg(quarterTeams);

    return platforms.map(p => {
      const pTeams = quarterTeams.filter(t => t.platform === p);
      const avg = calcAvg(pTeams);
      return {
        platform: p,
        Stability: avg.stability,
        Maturity: avg.maturity,
        Performance: avg.performance,
        isSelected: p === selectedPlatform,
      };
    }).concat([{
      platform: 'All Platforms',
      Stability: allAvg.stability,
      Maturity: allAvg.maturity,
      Performance: allAvg.performance,
      isSelected: false,
    }]);
  }, [teams, platforms, selectedPlatform, selectedPillar, selectedQuarter]);

  const isSuperUser = user?.role === 'superuser';
  const showDashboard = isSuperUser || user?.role === 'admin';
  const showSupervisor = user?.role === 'supervisor';
  const isTPL = user?.role === 'user';
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  const isSpecificPlatform = selectedPlatform !== 'All' && showDashboard;

  // Shared gauge + dimension + bar chart rendering for Super User and Admin
  const renderGaugesAndDimensions = () => (
    <>
      {/* Gauges */}
      {!isSpecificPlatform && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" role="region" aria-label="Key metrics gauges">
          {[
            { value: avgStability, title: 'Team Stability', subtitle: 'How stable are my teams?' },
            { value: avgMaturity, title: 'Overall Maturity', subtitle: 'How mature are my teams?' },
            { value: avgPerformance, title: 'Overall Performance', subtitle: 'How well are teams performing?' },
          ].map((gauge, i) => (
            <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}>
              <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={filteredTeams.length} />
            </div>
          ))}
        </div>
      )}

      {isSpecificPlatform && platformComparisonData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { value: avgStability, title: 'Team Stability', subtitle: `${selectedPlatform} stability` },
              { value: avgMaturity, title: 'Overall Maturity', subtitle: `${selectedPlatform} maturity` },
              { value: avgPerformance, title: 'Overall Performance', subtitle: `${selectedPlatform} performance` },
            ].map((gauge, i) => (
              <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}>
                <GaugeChart value={gauge.value} title={gauge.title} subtitle={gauge.subtitle} teamCount={filteredTeams.length} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['Stability', 'Maturity', 'Performance'] as const).map((metric, i) => (
              <div key={metric} className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up" style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'forwards' }}>
                <h3 className="text-sm font-semibold text-card-foreground mb-1">{metric} Comparison</h3>
                <p className="text-xs text-muted-foreground mb-4">{selectedPlatform} vs all platforms</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={platformComparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="platform" fontSize={10} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} fontSize={10} />
                    <Tooltip formatter={(value: number) => [`${value}%`, metric]} />
                    <Bar dataKey={metric} radius={[4, 4, 0, 0]} barSize={28}>
                      {platformComparisonData.map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={entry.isSelected ? METRIC_COLORS[metric] : 'hsl(var(--muted-foreground) / 0.25)'}
                          stroke={entry.isSelected ? METRIC_COLORS[metric] : 'transparent'}
                          strokeWidth={entry.isSelected ? 2 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Dimension Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Maturity Dimensions" subtitle="How dimensions contribute to maturity" dimensions={maturityDimensions} />
        </div>
        <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <DimensionChart title="Performance Metrics" subtitle="How metrics contribute to performance" dimensions={performanceMetrics} />
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

      {/* Super User: gauges + dimensions FIRST, then consolidated CEO view */}
      {isSuperUser && (
        <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          {renderGaugesAndDimensions()}
          <LTCCEOView />
        </div>
      )}

      {/* Admin (non-superuser): same gauges + dimensions */}
      {showDashboard && !isSuperUser && (
        <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          {renderGaugesAndDimensions()}
        </div>
      )}
    </section>
  );
};

export default OverviewPage;
