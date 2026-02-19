import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { subPlatformMap } from '@/data/dummyData';
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

interface SubPlatformHeatmapProps {
  platform: string;
}

const SubPlatformHeatmap: React.FC<SubPlatformHeatmapProps> = ({ platform }) => {
  const { teams, selectedQuarter, pillars } = useAppState();
  const [metric, setMetric] = React.useState<MetricKey>('maturity');

  const subPlatforms = subPlatformMap[platform] || [platform];

  const currentTeams = useMemo(() =>
    teams.filter(t => t.quarter === selectedQuarter && t.platform === platform),
    [teams, selectedQuarter, platform]
  );

  const heatmapData = useMemo(() => {
    return subPlatforms.map(sub => {
      const cells = pillars.map(pillar => {
        const matching = currentTeams.filter(t => t.subPlatform === sub && t.pillar === pillar);
        if (matching.length === 0) return { pillar, value: null, count: 0 };
        const avg = matching.reduce((s, t) => s + t[metric], 0) / matching.length;
        return { pillar, value: metric === 'stability' ? Math.round(avg) : +avg.toFixed(1), count: matching.length };
      });
      return { subPlatform: sub, cells };
    });
  }, [currentTeams, subPlatforms, pillars, metric]);

  const metricConfig = metricOptions.find(m => m.value === metric)!;

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-all duration-300 relative">
      <ChartChatBox chartTitle={`${platform} Sub-Platform Scorecard`} />
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-card-foreground">{platform} — Sub-Platform Scorecard</h3>
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
        Average <span className="font-medium">{metricConfig.label.toLowerCase()}</span> score for each sub-platform across pillars.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-muted-foreground font-medium min-w-[120px]">Sub-Platform</th>
              {pillars.map(pillar => (
                <th key={pillar} className="text-center py-2 px-1 text-muted-foreground font-medium min-w-[90px]">
                  <span className="block leading-tight">{pillar}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heatmapData.map(row => (
              <tr key={row.subPlatform} className="border-t border-border/30">
                <td className="py-2 px-2 font-medium text-foreground">{row.subPlatform}</td>
                {row.cells.map(cell => (
                  <td key={cell.pillar} className="py-1 px-1 text-center">
                    {cell.value !== null ? (
                      <div className={`rounded-md py-2 px-1 font-semibold text-xs ${getHeatColor(cell.value, metricConfig.max)}`}>
                        {cell.value}{metric === 'stability' ? '%' : ''}
                        <span className="block text-[9px] opacity-80 font-medium">{getSubjectiveLabel(cell.value, metricConfig.max)}</span>
                        <span className="block text-[9px] opacity-60 font-normal">{cell.count} team{cell.count !== 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

export default SubPlatformHeatmap;
