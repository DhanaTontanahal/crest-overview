import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Users } from 'lucide-react';
import GaugeChart from '@/components/GaugeChart';

const UserTPLView: React.FC = () => {
  const { user, teams, selectedQuarter } = useAppState();

  const userPlatform = user?.platformId ?? '';

  const platformTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter && t.platform === userPlatform),
    [teams, selectedQuarter, userPlatform]
  );

  const avgStability = platformTeams.length > 0
    ? Math.round(platformTeams.reduce((s, t) => s + t.stability, 0) / platformTeams.length) : 0;
  const avgMaturity = platformTeams.length > 0
    ? Math.round((platformTeams.reduce((s, t) => s + t.maturity, 0) / platformTeams.length) * 10) : 0;
  const avgPerformance = platformTeams.length > 0
    ? Math.round((platformTeams.reduce((s, t) => s + t.performance, 0) / platformTeams.length) * 10) : 0;

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
            <p className="text-sm text-muted-foreground">Your platform's maturity, performance, and stability</p>
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
    </div>
  );
};

export default UserTPLView;
