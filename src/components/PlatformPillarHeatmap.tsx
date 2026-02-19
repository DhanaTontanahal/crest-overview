import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import ChartChatBox from '@/components/ChartChatBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type MetricKey = 'maturity' | 'performance' | 'agility' | 'stability';

const metricOptions: { value: MetricKey; label: string; max: number }[] = [
  { value: 'maturity', label: 'Maturity', max: 10 },
  { value: 'performance', label: 'Performance', max: 10 },
  { value: 'agility', label: 'Agility', max: 10 },
  { value: 'stability', label: 'Stability', max: 100 },
];

const getHeatColor = (value: number, max: number): string => {
  const ratio = value / max;
  if (ratio >= 0.8) return 'bg-emerald-600 text-white';
  if (ratio >= 0.6) return 'bg-emerald-400 text-white';
  if (ratio >= 0.4) return 'bg-yellow-400 text-yellow-900';
  if (ratio >= 0.2) return 'bg-orange-400 text-white';
  return 'bg-red-500 text-white';
};

const getSubjectiveLabel = (value: number, max: number): string => {
  const ratio = value / max;
  if (ratio >= 0.8) return 'Excellent';
  if (ratio >= 0.6) return 'Good';
  if (ratio >= 0.4) return 'Fair';
  if (ratio >= 0.2) return 'Needs Work';
  return 'Critical';
};

interface PlatformPillarHeatmapProps {
  onDrill?: (platform: string, pillar: string) => void;
}

const PlatformPillarHeatmap: React.FC<PlatformPillarHeatmapProps> = ({ onDrill }) => {
  const { teams, selectedQuarter, platforms, pillars } = useAppState();
  const [metric, setMetric] = React.useState<MetricKey>('maturity');

  const currentTeams = useMemo(() => teams.filter(t => t.quarter === selectedQuarter), [teams, selectedQuarter]);

  const heatmapData = useMemo(() => {
    return platforms.map(platform => {
      const cells = pillars.map(pillar => {
        const matching = currentTeams.filter(t => t.platform === platform && t.pillar === pillar);
        if (matching.length === 0) return { pillar, value: null, count: 0 };
        const avg = matching.reduce((s, t) => s + t[metric], 0) / matching.length;
        return { pillar, value: metric === 'stability' ? Math.round(avg) : +avg.toFixed(1), count: matching.length };
      });
      return { platform, cells };
    });
  }, [currentTeams, platforms, pillars, metric]);

  const metricConfig = metricOptions.find(m => m.value === metric)!;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 relative">
      <ChartChatBox chartTitle="Cross-Platform Maturity Scorecard" />
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-card-foreground">Cross-Platform Maturity Scorecard</h3>
        <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {metricOptions.map(m => (
              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Each cell shows the average <span className="font-medium">{metricConfig.label.toLowerCase()}</span> score of all teams in that platform–pillar intersection, with a qualitative rating.
        {onDrill ? ' Click any cell to drill down into team-level details.' : ''}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium min-w-[120px]">Platform</th>
              {pillars.map(pillar => (
                <th key={pillar} className="text-center py-2 px-1 text-muted-foreground font-medium min-w-[90px]">
                  <span className="block leading-tight">{pillar}</span>
                </th>
              ))}
              <th className="text-center py-2 px-2 text-muted-foreground font-medium" title="Average across all pillars for this platform"></th>
            </tr>
          </thead>
          <tbody>
            {heatmapData.map(row => {
              return (
                <tr key={row.platform} className="border-t border-border/30">
                  <td className="py-2 px-2 font-medium text-foreground">{row.platform}</td>
                  {row.cells.map(cell => (
                    <td key={cell.pillar} className="py-1 px-1 text-center">
                      {cell.value !== null ? (
                        <button
                          onClick={() => onDrill?.(row.platform, cell.pillar)}
                          className={`w-full rounded-md py-2 px-1 font-semibold text-xs transition-all duration-200 hover:scale-105 hover:shadow-md ${getHeatColor(cell.value, metricConfig.max)} ${onDrill ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                          {cell.value}{metric === 'stability' ? '%' : ''}
                          <span className="block text-[9px] opacity-80 font-medium">{getSubjectiveLabel(cell.value, metricConfig.max)}</span>
                          <span className="block text-[9px] opacity-60 font-normal">{cell.count} team{cell.count !== 1 ? 's' : ''}</span>
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                  <td />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Low</span>
        <div className="flex gap-0.5">
          {['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-600'].map(c => (
            <div key={c} className={`w-6 h-3 rounded-sm ${c}`} />
          ))}
        </div>
        <span>High</span>
      </div>
    </div>
  );
};

export default PlatformPillarHeatmap;
