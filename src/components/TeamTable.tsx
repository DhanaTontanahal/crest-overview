import React from 'react';
import { useAppState } from '@/context/AppContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const getScoreColor = (score: number) => {
  if (score >= 8) return 'text-chart-green1 font-semibold';
  if (score >= 6) return 'text-chart-green2 font-semibold';
  if (score >= 4) return 'text-chart-gold font-semibold';
  return 'text-chart-orange font-semibold';
};

const TeamTable: React.FC = () => {
  const { teams, selectedPlatform, selectedPillar } = useAppState();

  const filtered = teams.filter(t => {
    if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
    if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
    return true;
  });

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      <div className="p-6 pb-3">
        <h3 className="text-lg font-semibold text-card-foreground">Team Overview</h3>
        <p className="text-sm text-muted-foreground">Detailed scores for each team</p>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Pillar</TableHead>
              <TableHead className="text-right">Maturity</TableHead>
              <TableHead className="text-right">Performance</TableHead>
              <TableHead className="text-right">Agility</TableHead>
              <TableHead className="text-right">Stability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((team, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.platform}</TableCell>
                <TableCell>{team.pillar}</TableCell>
                <TableCell className={`text-right ${getScoreColor(team.maturity)}`}>{team.maturity.toFixed(1)}</TableCell>
                <TableCell className={`text-right ${getScoreColor(team.performance)}`}>{team.performance.toFixed(1)}</TableCell>
                <TableCell className={`text-right ${getScoreColor(team.agility)}`}>{team.agility.toFixed(1)}</TableCell>
                <TableCell className={`text-right ${getScoreColor(team.stability)}`}>{team.stability}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamTable;
