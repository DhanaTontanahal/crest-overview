import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import PlatformPillarHeatmap from '@/components/PlatformPillarHeatmap';
import { Building2, ChevronRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChartChatBox from '@/components/ChartChatBox';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const HeatmapPage: React.FC = () => {
  const { teams, selectedQuarter, pillars } = useAppState();
  const [drillPlatform, setDrillPlatform] = useState<string | null>(null);
  const [drillPillar, setDrillPillar] = useState<string | null>(null);

  const currentTeams = teams.filter(t => t.quarter === selectedQuarter);

  // Drill into platform+pillar → show teams
  if (drillPlatform && drillPillar) {
    const drillTeams = currentTeams.filter(t => t.platform === drillPlatform && t.pillar === drillPillar);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <Button variant="ghost" size="sm" onClick={() => { setDrillPlatform(null); setDrillPillar(null); }} className="text-muted-foreground hover:text-foreground px-2">
            <Building2 className="w-4 h-4 mr-1" /> Heatmap
          </Button>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-foreground">{drillPlatform} — {drillPillar}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setDrillPlatform(null); setDrillPillar(null); }} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Heatmap
        </Button>

        {/* KPI summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Agility', value: drillTeams.length > 0 ? +(drillTeams.reduce((s, t) => s + t.agility, 0) / drillTeams.length).toFixed(1) : 0, suffix: '/10' },
            { label: 'Maturity', value: drillTeams.length > 0 ? +(drillTeams.reduce((s, t) => s + t.maturity, 0) / drillTeams.length).toFixed(1) : 0, suffix: '/10' },
            { label: 'Performance', value: drillTeams.length > 0 ? +(drillTeams.reduce((s, t) => s + t.performance, 0) / drillTeams.length).toFixed(1) : 0, suffix: '/10' },
            { label: 'Stability', value: drillTeams.length > 0 ? Math.round(drillTeams.reduce((s, t) => s + t.stability, 0) / drillTeams.length) : 0, suffix: '%' },
            { label: 'Teams', value: drillTeams.length, suffix: '' },
          ].map((kpi, i) => (
            <div key={kpi.label} className="bg-card rounded-xl p-4 shadow-sm border border-border opacity-0 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: 'forwards' }}>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold text-foreground mt-1">{kpi.value}{kpi.suffix}</p>
            </div>
          ))}
        </div>

        {/* Team table */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
          <ChartChatBox chartTitle={`${drillPlatform} — ${drillPillar} Teams`} />
          <h3 className="text-base font-semibold text-card-foreground mb-4">Teams in {drillPillar} — {drillPlatform}</h3>
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
                {drillTeams.map(t => (
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
                {drillTeams.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">No teams found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team comparison chart */}
        {drillTeams.length > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up relative" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
            <ChartChatBox chartTitle="Team Comparison" />
            <h3 className="text-base font-semibold text-card-foreground text-center">Team Comparison</h3>
            <p className="text-xs text-muted-foreground text-center mb-4">Side-by-side metrics for all teams in this intersection</p>
            <ResponsiveContainer width="100%" height={Math.max(200, drillTeams.length * 50 + 60)}>
              <BarChart data={drillTeams.map(t => ({ name: t.name, Agility: t.agility, Maturity: t.maturity, Performance: t.performance }))} layout="vertical" margin={{ left: 20, right: 20, top: 5, bottom: 5 }}>
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

  // Main heatmap view
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PlatformPillarHeatmap onDrill={(platform, pillar) => { setDrillPlatform(platform); setDrillPillar(pillar); }} />
    </div>
  );
};

export default HeatmapPage;
