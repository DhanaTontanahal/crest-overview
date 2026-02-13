import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import DashboardHeader from '@/components/DashboardHeader';
import GaugeChart from '@/components/GaugeChart';
import DimensionChart from '@/components/DimensionChart';
import MaturityTimeline from '@/components/MaturityTimeline';
import TeamTable from '@/components/TeamTable';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import TrendingCharts from '@/components/TrendingCharts';
import LoginPage from '@/pages/LoginPage';

const Index: React.FC = () => {
  const {
    user, setUser, teams, maturityDimensions, performanceMetrics,
    timeSeries, selectedPlatform, selectedPillar, selectedQuarter,
    quarterlyTrends, cios,
  } = useAppState();

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
    ? Math.round(filteredTeams.reduce((s, t) => s + t.stability, 0) / filteredTeams.length)
    : 0;
  const avgMaturity = filteredTeams.length > 0
    ? Math.round((filteredTeams.reduce((s, t) => s + t.maturity, 0) / filteredTeams.length) * 10)
    : 0;
  const avgPerformance = filteredTeams.length > 0
    ? Math.round((filteredTeams.reduce((s, t) => s + t.performance, 0) / filteredTeams.length) * 10)
    : 0;

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  const showDashboard = user.role === 'superuser' || user.role === 'supervisor' || user.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {user.role === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-0 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            <ExcelUpload />
            <AdminSettings />
          </div>
        )}

        {user.role === 'user' && (
          <div className="bg-card rounded-lg p-12 shadow-sm border border-border text-center animate-scale-in">
            <h2 className="text-2xl font-semibold text-card-foreground mb-2">Welcome, {user.name}</h2>
            <p className="text-muted-foreground">You have read-only access. Please contact your supervisor or admin for dashboard insights.</p>
          </div>
        )}

        {showDashboard && (
          <>
            {user.role === 'supervisor' && user.cioId && (
              <div className="bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
                <p className="text-sm text-accent-foreground font-medium">
                  Viewing as CIO: {cios.find(c => c.id === user.cioId)?.name} — {cios.find(c => c.id === user.cioId)?.platform} platform
                </p>
              </div>
            )}

            {/* Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

            {/* Dimension Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                <DimensionChart
                  title="Maturity Dimensions"
                  subtitle="How do the various dimensions contribute to overall maturity?"
                  dimensions={maturityDimensions}
                />
              </div>
              <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                <DimensionChart
                  title="Performance Metrics"
                  subtitle="How do the various metrics contribute to overall performance?"
                  dimensions={performanceMetrics}
                />
              </div>
            </div>

            {/* Timeline Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Maturity Over Time', subtitle: "How does the teams' maturity change over time?", dataKey: 'maturity' as const },
                { title: 'Performance Over Time', subtitle: "How does the teams' performance change over time?", dataKey: 'performance' as const },
                { title: 'Agility Index Over Time', subtitle: "How does the teams' overall agility change over time?", dataKey: 'agility' as const },
              ].map((tl, i) => (
                <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${0.5 + i * 0.1}s`, animationFillMode: 'forwards' }}>
                  <MaturityTimeline title={tl.title} subtitle={tl.subtitle} data={timeSeries} dataKey={tl.dataKey} />
                </div>
              ))}
            </div>

            {/* Trending Charts */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              <TrendingCharts trends={quarterlyTrends} />
            </div>

            {/* Team Table */}
            <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
              <TeamTable />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
