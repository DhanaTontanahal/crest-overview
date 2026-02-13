import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

const TeamDataPage: React.FC = () => {
  const { teams, selectedPlatform, selectedPillar, selectedQuarter, user, cios } = useAppState();

  const filtered = useMemo(() => teams.filter(t => {
    if (t.quarter !== selectedQuarter) return false;
    if (user?.role === 'supervisor' && user.cioId) {
      const cio = cios.find(c => c.id === user.cioId);
      if (cio && t.platform !== cio.platform) return false;
    }
    if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
    if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
    return true;
  }), [teams, selectedPlatform, selectedPillar, selectedQuarter, user, cios]);

  const handleDownload = () => {
    const data = filtered.map(t => ({
      Team: t.name,
      Platform: t.platform,
      Pillar: t.pillar,
      Quarter: t.quarter,
      Maturity: t.maturity.toFixed(1),
      Performance: t.performance.toFixed(1),
      Agility: t.agility.toFixed(1),
      'Stability (%)': t.stability,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Team Data');
    XLSX.writeFile(wb, `team-data-${selectedQuarter.replace(' ', '-')}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Team Data</h2>
          <p className="text-sm text-muted-foreground">{filtered.length} teams for {selectedQuarter}</p>
        </div>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="w-4 h-4" /> Download Excel
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Team</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Pillar</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Maturity</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Performance</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Agility</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Stability</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((team, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-medium">{team.name}</td>
                  <td className="py-3 px-4">{team.platform}</td>
                  <td className="py-3 px-4">{team.pillar}</td>
                  <td className="text-right py-3 px-4">{team.maturity.toFixed(1)}</td>
                  <td className="text-right py-3 px-4">{team.performance.toFixed(1)}</td>
                  <td className="text-right py-3 px-4">{team.agility.toFixed(1)}</td>
                  <td className="text-right py-3 px-4">{team.stability}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamDataPage;
