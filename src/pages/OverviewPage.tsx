import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import GaugeChart from '@/components/GaugeChart';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import LTCCEOView from '@/components/LTCCEOView';
import UserTPLView from '@/components/UserTPLView';
import SupervisorView from '@/components/SupervisorView';

const OverviewPage: React.FC = () => {
  const { user, teams, selectedPlatform, selectedPillar, selectedQuarter, cios } = useAppState();

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

  const showDashboard = user?.role === 'superuser' || user?.role === 'admin';
  const showSupervisor = user?.role === 'supervisor';
  const showLTCCEO = user?.role === 'ltc_ceo';
  const isTPL = user?.role === 'user';
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <>
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
      )}
    </>
  );
};

export default OverviewPage;
