import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Building2 } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const PLATFORM_COLORS = [
  'hsl(163, 100%, 21%)',
  'hsl(155, 60%, 40%)',
  'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)',
];

const OrgHealthPage: React.FC = () => {
  const { teams, selectedQuarter, platforms } = useAppState();

  const currentTeams = useMemo(() => teams.filter(t => t.quarter === selectedQuarter), [teams, selectedQuarter]);

  const platformRadar = useMemo(() => {
    return platforms.map(p => {
      const pTeams = currentTeams.filter(t => t.platform === p);
      if (pTeams.length === 0) return { platform: p, agility: 0, maturity: 0, performance: 0, stability: 0 };
      const avg = (key: 'agility' | 'maturity' | 'performance' | 'stability') =>
        +(pTeams.reduce((s, t) => s + t[key], 0) / pTeams.length).toFixed(1);
      return { platform: p, agility: avg('agility'), maturity: avg('maturity'), performance: avg('performance'), stability: +(avg('stability') / 10).toFixed(1) };
    });
  }, [currentTeams, platforms]);

  const platformStability = useMemo(() => {
    return platforms.map(p => {
      const pTeams = currentTeams.filter(t => t.platform === p);
      const stability = pTeams.length > 0 ? Math.round(pTeams.reduce((s, t) => s + t.stability, 0) / pTeams.length) : 0;
      return { platform: p, stability, teamCount: pTeams.length };
    });
  }, [currentTeams, platforms]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Organisation Health</h2>
            <p className="text-sm text-muted-foreground">Cross-platform health comparison via radar and stability analysis</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Radar */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle="Platform Health Radar" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Platform Health Radar</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Each axis represents a key metric. Lines show how each platform scores — wider coverage means stronger overall health.</p>
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
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 opacity-0 animate-slide-up relative" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle="Stability by Platform" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Stability by Platform</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Team retention & consistency percentage per platform. Higher bars indicate more stable teams.</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformStability} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
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
    </div>
  );
};

export default OrgHealthPage;
