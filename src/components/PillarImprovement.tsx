import React, { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import ChartChatBox from '@/components/ChartChatBox';

interface PillarImprovementProps {
  platformFilter?: string; // if set, show only this platform
}

const PillarImprovement: React.FC<PillarImprovementProps> = ({ platformFilter }) => {
  const { teams, pillars, platforms, availableQuarters } = useAppState();

  // Compare last two quarters
  const lastTwo = availableQuarters.slice(-2);
  const prevQ = lastTwo[0];
  const currQ = lastTwo[1];

  const improvementData = useMemo(() => {
    const relevantPlatforms = platformFilter ? [platformFilter] : platforms;

    return pillars.map(pillar => {
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

      // Overall pillar averages
      const allPrev = teams.filter(t => t.quarter === prevQ && t.pillar === pillar && (platformFilter ? t.platform === platformFilter : true));
      const allCurr = teams.filter(t => t.quarter === currQ && t.pillar === pillar && (platformFilter ? t.platform === platformFilter : true));
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
  }, [teams, pillars, platforms, prevQ, currQ, platformFilter]);

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
      <h3 className="text-base font-semibold text-card-foreground mb-1">Pillar Improvement — {prevQ} → {currQ}</h3>
      <p className="text-xs text-muted-foreground mb-4">Quarter-over-quarter delta for each pillar{platformFilter ? ` (${platformFilter})` : ' across all platforms'}</p>

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

            {!platformFilter && (
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

            {platformFilter && (
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
