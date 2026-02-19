import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import PageHeader from '@/components/PageHeader';
import { downloadDummyDataExcel } from '@/utils/exportDummyData';

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
      'Sub Platform': t.subPlatform,
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
      <PageHeader
        title="Team Data"
        subtitle={`${filtered.length} teams for ${selectedQuarter} — raw scores across all metrics.`}
        infoContent={[
          'This table shows every team\'s individual scores for the selected quarter, platform, and pillar filters.',
          'Data originates from Excel uploads (Admin → Data Upload) or system defaults.',
          'Download filtered results or the full sample dataset using the buttons above.',
        ]}
      />
      <div className="flex items-center justify-between">
        <div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadDummyDataExcel} className="gap-2">
            <Download className="w-4 h-4" /> Full Sample Data
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" /> Download Filtered
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Team</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Platform</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Sub Platform</th>
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
                  <td className="py-3 px-4">{team.subPlatform}</td>
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
