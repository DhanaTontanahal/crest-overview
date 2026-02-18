import React, { useMemo, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PillarImprovementProps {
  platformFilter?: string; // if set, lock to this platform
}

const PillarImprovement: React.FC<PillarImprovementProps> = ({ platformFilter }) => {
  const { teams, pillars, platforms, availableQuarters } = useAppState();

  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(platformFilter || 'All');

  // Compare last two quarters
  const lastTwo = availableQuarters.slice(-2);
  const prevQ = lastTwo[0];
  const currQ = lastTwo[1];

  const filteredPillars = selectedPillar === 'All' ? pillars : [selectedPillar];
  const effectivePlatform = platformFilter || (selectedPlatform === 'All' ? undefined : selectedPlatform);

  const improvementData = useMemo(() => {
    const relevantPlatforms = effectivePlatform ? [effectivePlatform] : platforms;

    return filteredPillars.map(pillar => {
      const platformBreakdown = relevantPlatforms.map(platform => {
        const prevTeams = teams.filter(t => t.quarter === prevQ && t.pillar === pillar && t.platform === platform);
        const currTeams = teams.filter(t => t.quarter === currQ && t.pillar === pillar && t.platform === platform);

        const avg = (arr: typeof teams, key: 'maturity' | 'performance' | 'agility' | 'stability') =>
          arr.length > 0 ? arr.reduce((s, t) => s + t[key], 0) / arr.length : 0;

        return {
          platform,
          prevMaturity: +avg(prevTeams, 'maturity').toFixed(1),
          currMaturity: +avg(currTeams, 'maturity').toFixed(1),
          maturityDelta: +(avg(currTeams, 'maturity') - avg(prevTeams, 'maturity')).toFixed(1),
          prevPerformance: +avg(prevTeams, 'performance').toFixed(1),
          currPerformance: +avg(currTeams, 'performance').toFixed(1),
          performanceDelta: +(avg(currTeams, 'performance') - avg(prevTeams, 'performance')).toFixed(1),
          prevAgility: +avg(prevTeams, 'agility').toFixed(1),
          currAgility: +avg(currTeams, 'agility').toFixed(1),
          agilityDelta: +(avg(currTeams, 'agility') - avg(prevTeams, 'agility')).toFixed(1),
          prevStability: Math.round(avg(prevTeams, 'stability')),
          currStability: Math.round(avg(currTeams, 'stability')),
          stabilityDelta: Math.round(avg(currTeams, 'stability') - avg(prevTeams, 'stability')),
          teamCount: currTeams.length,
        };
      });

      const allPrev = teams.filter(t => t.quarter === prevQ && t.pillar === pillar && (effectivePlatform ? t.platform === effectivePlatform : true));
      const allCurr = teams.filter(t => t.quarter === currQ && t.pillar === pillar && (effectivePlatform ? t.platform === effectivePlatform : true));
      const overallAvg = (arr: typeof teams, key: 'maturity' | 'performance' | 'agility') =>
        arr.length > 0 ? +(arr.reduce((s, t) => s + t[key], 0) / arr.length).toFixed(1) : 0;

      return {
        pillar,
        overallMaturityDelta: +(overallAvg(allCurr, 'maturity') - overallAvg(allPrev, 'maturity')).toFixed(1),
        overallPerformanceDelta: +(overallAvg(allCurr, 'performance') - overallAvg(allPrev, 'performance')).toFixed(1),
        overallAgilityDelta: +(overallAvg(allCurr, 'agility') - overallAvg(allPrev, 'agility')).toFixed(1),
        platformBreakdown,
      };
    });
  }, [teams, filteredPillars, platforms, prevQ, currQ, effectivePlatform]);

  const DeltaIndicator: React.FC<{ value: number; suffix?: string }> = ({ value, suffix = '' }) => {
    const icon = value > 0 ? <TrendingUp className="w-3 h-3" /> : value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;
    const color = value > 0 ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-muted-foreground';
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
        {icon} {value > 0 ? '+' : ''}{value}{suffix}
      </span>
    );
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border border-border relative">
      <ChartChatBox chartTitle="Pillar Improvement" />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground mb-0.5">Pillar Improvement — {prevQ} → {currQ}</h3>
          <p className="text-xs text-muted-foreground">Quarter-over-quarter delta{effectivePlatform ? ` (${effectivePlatform})` : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPillar} onValueChange={setSelectedPillar}>
            <SelectTrigger className="w-[180px] h-8 text-xs" aria-label="Filter by pillar">
              <SelectValue placeholder="Pillar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Pillars</SelectItem>
              {pillars.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          {!platformFilter && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[160px] h-8 text-xs" aria-label="Filter by platform">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Platforms</SelectItem>
                {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {improvementData.map(item => (
          <div key={item.pillar} className="border border-border/50 rounded-lg p-4 hover:bg-muted/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">{item.pillar}</h4>
              <div className="flex gap-4">
                <span className="text-xs text-muted-foreground">Maturity <DeltaIndicator value={item.overallMaturityDelta} /></span>
                <span className="text-xs text-muted-foreground">Performance <DeltaIndicator value={item.overallPerformanceDelta} /></span>
                <span className="text-xs text-muted-foreground">Agility <DeltaIndicator value={item.overallAgilityDelta} /></span>
              </div>
            </div>

            {!effectivePlatform && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs mt-2">
                  <thead>
                    <tr className="border-b border-border/30">
                      <th className="text-left py-1 px-2 text-muted-foreground font-medium">Platform</th>
                      <th className="text-center py-1 px-2 text-muted-foreground font-medium">Maturity Δ</th>
                      <th className="text-center py-1 px-2 text-muted-foreground font-medium">Performance Δ</th>
                      <th className="text-center py-1 px-2 text-muted-foreground font-medium">Agility Δ</th>
                      <th className="text-center py-1 px-2 text-muted-foreground font-medium">Stability Δ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.platformBreakdown.filter(pb => pb.teamCount > 0).map(pb => (
                      <tr key={pb.platform} className="border-b border-border/20">
                        <td className="py-1.5 px-2 font-medium text-foreground">{pb.platform}</td>
                        <td className="text-center py-1.5 px-2"><DeltaIndicator value={pb.maturityDelta} /></td>
                        <td className="text-center py-1.5 px-2"><DeltaIndicator value={pb.performanceDelta} /></td>
                        <td className="text-center py-1.5 px-2"><DeltaIndicator value={pb.agilityDelta} /></td>
                        <td className="text-center py-1.5 px-2"><DeltaIndicator value={pb.stabilityDelta} suffix="pp" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {effectivePlatform && (
              <div className="flex gap-6 mt-1">
                {item.platformBreakdown.filter(pb => pb.teamCount > 0).map(pb => (
                  <div key={pb.platform} className="flex gap-4 text-xs">
                    <span className="text-muted-foreground">Stability <DeltaIndicator value={pb.stabilityDelta} suffix="pp" /></span>
                    <span className="text-muted-foreground">{pb.teamCount} teams</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PillarImprovement;
