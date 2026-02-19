import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Users } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const PlatformComparisonPage: React.FC = () => {
  const { user, teams, selectedQuarter } = useAppState();
  const userPlatform = user?.platformId ?? '';

  const platformTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter && t.platform === userPlatform),
    [teams, selectedQuarter, userPlatform]
  );

  const allQuarterTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter),
    [teams, selectedQuarter]
  );

  const comparisonData = useMemo(() => {
    const overallAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      allQuarterTeams.length > 0 ? +(allQuarterTeams.reduce((s, t) => s + t[key], 0) / allQuarterTeams.length).toFixed(1) : 0;
    const platformAvg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
      platformTeams.length > 0 ? +(platformTeams.reduce((s, t) => s + t[key], 0) / platformTeams.length).toFixed(1) : 0;

    return [
      { metric: 'Maturity', [userPlatform]: platformAvg('maturity'), Overall: overallAvg('maturity') },
      { metric: 'Performance', [userPlatform]: platformAvg('performance'), Overall: overallAvg('performance') },
      { metric: 'Agility', [userPlatform]: platformAvg('agility'), Overall: overallAvg('agility') },
      { metric: 'Stability', [userPlatform]: +(platformAvg('stability') / 10).toFixed(1), Overall: +(overallAvg('stability') / 10).toFixed(1) },
    ];
  }, [platformTeams, allQuarterTeams, userPlatform]);

  if (!user || user.role !== 'user' || !user.platformId) {
    return <p className="text-muted-foreground">This page is available for Platform Leads only.</p>;
  }

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{userPlatform} vs Organisation Overall</h2>
            <p className="text-sm text-muted-foreground">How your platform compares against the organisation-wide average — {selectedQuarter}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <ChartChatBox chartTitle={`${userPlatform} vs Organisation Overall`} />
        <h3 className="text-base font-semibold text-card-foreground text-center">{userPlatform} vs Organisation Overall</h3>
        <p className="text-xs text-muted-foreground text-center mb-4">Comparison across key metrics</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={comparisonData} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" domain={[0, 10]} fontSize={11} />
            <YAxis dataKey="metric" type="category" width={100} fontSize={11} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey={userPlatform} fill="hsl(163, 100%, 21%)" barSize={14} radius={[0, 4, 4, 0]} />
            <Bar dataKey="Overall" fill="hsl(var(--muted-foreground) / 0.3)" barSize={14} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformComparisonPage;
