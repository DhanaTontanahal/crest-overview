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
import LTCCEOView from '@/components/LTCCEOView';
import UserTPLView from '@/components/UserTPLView';
import SupervisorView from '@/components/SupervisorView';
import PillarImprovement from '@/components/PillarImprovement';
import ActionItems from '@/components/ActionItems';
import AssessmentSubmit from '@/components/AssessmentSubmit';
import AssessmentView from '@/components/AssessmentView';
import LoginPage from '@/pages/LoginPage';
import { Assessment } from '@/data/assessmentQuestions';

const Index: React.FC = () => {
  const {
    user, setUser, teams, maturityDimensions, performanceMetrics,
    timeSeries, selectedPlatform, selectedPillar, selectedQuarter,
    quarterlyTrends, cios,
    assessments, setAssessments, activeTab, setActiveTab,
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

  const handleAssessmentSubmit = (assessment: Assessment) => {
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === assessment.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = assessment;
        return updated;
      }
      return [...prev, assessment];
    });
  };

  const handleReview = (assessmentId: string, reviewerPlatform: string) => {
    setAssessments(prev => prev.map(a =>
      a.id === assessmentId ? { ...a, reviewedBy: reviewerPlatform, reviewedAt: new Date().toISOString().split('T')[0], status: 'reviewed' as const } : a
    ));
  };

  const showDashboard = user.role === 'superuser' || user.role === 'admin';
  const showSupervisor = user.role === 'supervisor';
  const showLTCCEO = false; // Role removed, consolidated into superuser
  const isTPL = user.role === 'user';
  const supervisorPlatform = user.role === 'supervisor' && user.cioId ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  // Assessment tab content
  const renderAssessmentContent = () => {
    if (activeTab === 'submit-assessment' && isTPL && user.platformId) {
      const existing = assessments.find(a => a.platform === user.platformId && a.quarter === selectedQuarter);
      return (
        <AssessmentSubmit
          platform={user.platformId}
          onSubmit={handleAssessmentSubmit}
          existingAssessment={existing}
        />
      );
    }

    if (activeTab === 'view-assessments') {
      const platformFilter = isTPL ? user.platformId : supervisorPlatform;
      return (
        <AssessmentView
          assessments={assessments}
          canDrillDown={user.role === 'superuser' || user.role === 'reviewer' || user.role === 'supervisor'}
          platformFilter={isTPL ? platformFilter : undefined}
          reviewerPlatform={isTPL ? user.platformId : undefined}
        />
      );
    }

    if (activeTab === 'review-assessment' && isTPL && user.platformId) {
      // Show other platforms' submitted assessments for peer review
      const peerAssessments = assessments.filter(a => a.platform !== user.platformId && a.status === 'submitted');
      return (
        <AssessmentView
          assessments={peerAssessments.length > 0 ? peerAssessments : assessments.filter(a => a.platform !== user.platformId)}
          canDrillDown
          onReview={handleReview}
          reviewerPlatform={user.platformId}
        />
      );
    }

    return null;
  };

  const isAssessmentTab = activeTab === 'submit-assessment' || activeTab === 'view-assessments' || activeTab === 'review-assessment';

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isAssessmentTab ? (
          <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
            {renderAssessmentContent()}
          </div>
        ) : (
          <>
            {user.role === 'admin' && (
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

            {showLTCCEO && (
              <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
                <LTCCEOView />
              </div>
            )}

            {showSupervisor && supervisorPlatform && (
              <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
                <SupervisorView platform={supervisorPlatform} />
              </div>
            )}

            {showDashboard && (
              <>
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
                    <DimensionChart title="Maturity Dimensions" subtitle="How do the various dimensions contribute to overall maturity?" dimensions={maturityDimensions} />
                  </div>
                  <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                    <DimensionChart title="Performance Metrics" subtitle="How do the various metrics contribute to overall performance?" dimensions={performanceMetrics} />
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

                {/* Pillar Improvement */}
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
                  <PillarImprovement platformFilter={supervisorPlatform} />
                </div>

                {/* Action Items */}
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
                  <ActionItems platformFilter={supervisorPlatform} />
                </div>

                {/* Team Table */}
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '1.0s', animationFillMode: 'forwards' }}>
                  <TeamTable />
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
