import { TeamData, DimensionScore, TimeSeriesPoint, CIO, QuarterlyTrend } from '@/types/maturity';

export const cios: CIO[] = [
  { id: 'cio-consumer', name: 'CIO', platform: 'Consumer' },
  { id: 'cio-commercial', name: 'CIO', platform: 'Commercial' },
  { id: 'cio-wealth', name: 'CIO', platform: 'Wealth & Investment' },
  { id: 'cio-insurance', name: 'CIO', platform: 'Insurance' },
];

export const defaultPlatforms = ['Consumer', 'Commercial', 'Wealth & Investment', 'Insurance'];

export const subPlatformMap: Record<string, string[]> = {
  'Consumer': ['Cards', 'Loans', 'Transport'],
  'Commercial': ['Trade Finance', 'Cash Management', 'Lending'],
  'Wealth & Investment': ['Advisory', 'Trading', 'Custody'],
  'Insurance': ['Life', 'General', 'Reinsurance'],
};

export const defaultPillars = [
  'Business and Technology',
  'Run and Change Together',
  'All in One Agile',
  'Project to Product',
  'Engineering Excellence',
  'Dynamic and Well Controlled',
];

// Dynamically determine current quarter
const getCurrentQuarter = (): string => {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  return `Q${q} ${now.getFullYear()}`;
};

const getCurrentMonth = (): string => {
  const now = new Date();
  return now.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const currentQuarter = getCurrentQuarter();
export const currentMonth = getCurrentMonth();

export const availableQuarters = ['Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

const generateTeamsForQuarter = (quarter: string, seed: number): TeamData[] => {
  const platforms = defaultPlatforms;
  const pillars = defaultPillars;

  // Quarter-specific adjustments to create realistic dips
  const quarterDips: Record<number, { platforms?: string[]; pillars?: string[]; maturityAdj: number; performanceAdj: number; agilityAdj: number; stabilityAdj: number }> = {
    2: { platforms: ['Commercial', 'Insurance'], maturityAdj: -0.6, performanceAdj: -0.4, agilityAdj: -0.3, stabilityAdj: -8 },
    4: { pillars: ['Project to Product', 'Engineering Excellence'], maturityAdj: -0.5, performanceAdj: -0.7, agilityAdj: -0.4, stabilityAdj: -6 },
    5: { platforms: ['Wealth & Investment'], pillars: ['All in One Agile', 'Dynamic and Well Controlled'], maturityAdj: -0.4, performanceAdj: -0.3, agilityAdj: -0.5, stabilityAdj: -5 },
  };

  const dip = quarterDips[seed];
  const teams: TeamData[] = [];
  let teamIdx = 0;

  // Generate teams per platform → sub-platform → pillar
  for (let pIdx = 0; pIdx < platforms.length; pIdx++) {
    const subs = subPlatformMap[platforms[pIdx]] || [platforms[pIdx]];
    for (let sIdx = 0; sIdx < subs.length; sIdx++) {
      for (let plIdx = 0; plIdx < pillars.length; plIdx++) {
        const growth = seed * 0.15;
        const base = 3.5 + (teamIdx % 7) * 0.8 + growth;
        const clamp = (v: number) => Math.min(10, Math.max(1, Math.round(v * 10) / 10));

        let maturityAdj = 0, performanceAdj = 0, agilityAdj = 0, stabilityAdj = 0;
        if (dip) {
          const platformMatch = !dip.platforms || dip.platforms.includes(platforms[pIdx]);
          const pillarMatch = !dip.pillars || dip.pillars.includes(pillars[plIdx]);
          if (platformMatch && pillarMatch) {
            maturityAdj = dip.maturityAdj;
            performanceAdj = dip.performanceAdj;
            agilityAdj = dip.agilityAdj;
            stabilityAdj = dip.stabilityAdj;
          }
        }

        teams.push({
          name: `Team ${subs[sIdx].substring(0, 3).toUpperCase()}-${pillars[plIdx].substring(0, 3).toUpperCase()}-${teamIdx + 1}`,
          maturity: clamp(base + (teamIdx % 3) * 0.3 + maturityAdj),
          performance: clamp(base - 0.2 + (teamIdx % 4) * 0.2 + performanceAdj),
          agility: clamp(base - 0.4 + (teamIdx % 5) * 0.15 + agilityAdj),
          stability: Math.min(100, Math.max(20, Math.round(base * 10 + (teamIdx % 6) * 3 + stabilityAdj))),
          platform: platforms[pIdx],
          subPlatform: subs[sIdx],
          pillar: pillars[plIdx],
          quarter,
        });
        teamIdx++;
      }
    }
  }

  return teams;
};

export const dummyTeams: TeamData[] = availableQuarters.flatMap((q, i) => generateTeamsForQuarter(q, i));

export const dummyMaturityDimensions: DimensionScore[] = [
  { name: 'Clarity', weight: 25, scores: [8, 5, 9, 4, 6, 5, 9, 6, 7, 6], average: 6.5 },
  { name: 'Leadership', weight: 25, scores: [7, 5, 8, 4, 7, 4, 9, 6, 7, 5], average: 6.2 },
  { name: 'Culture', weight: 25, scores: [8, 5, 8, 4, 6, 5, 9, 7, 7, 6], average: 6.5 },
  { name: 'Foundation', weight: 25, scores: [8, 5, 9, 4, 7, 4, 8, 6, 7, 6], average: 6.4 },
];

export const dummyPerformanceMetrics: DimensionScore[] = [
  { name: 'Throughput', weight: 16, scores: [7, 5, 9, 4, 7, 4, 9, 6, 7, 6], average: 6.4 },
  { name: 'Predictability', weight: 16, scores: [7, 5, 8, 4, 7, 4, 8, 6, 7, 6], average: 6.2 },
  { name: 'Change Fail Rate', weight: 16, scores: [6, 5, 8, 5, 6, 3, 8, 5, 6, 5], average: 5.7 },
  { name: 'Deployment Frequency', weight: 16, scores: [8, 6, 9, 4, 7, 4, 9, 7, 8, 6], average: 6.8 },
  { name: 'Mean Time to Deploy', weight: 16, scores: [7, 5, 8, 4, 6, 4, 9, 6, 7, 5], average: 6.1 },
  { name: 'Lead Time', weight: 20, scores: [7, 5, 8, 4, 6, 4, 8, 6, 7, 6], average: 6.1 },
];

export const dummyStabilityDimensions: DimensionScore[] = [
  { name: 'Attrition Rate', weight: 25, scores: [8, 6, 7, 5, 7, 6, 8, 7, 6, 7], average: 6.7 },
  { name: 'Tenure', weight: 25, scores: [7, 5, 8, 6, 6, 5, 7, 6, 7, 6], average: 6.3 },
  { name: 'Role Clarity', weight: 25, scores: [8, 6, 9, 5, 7, 5, 8, 7, 7, 6], average: 6.8 },
  { name: 'Succession Plan', weight: 25, scores: [6, 4, 7, 5, 6, 4, 7, 5, 6, 5], average: 5.5 },
];

export const dummyAgilityDimensions: DimensionScore[] = [
  { name: 'Adaptability', weight: 20, scores: [7, 5, 8, 5, 7, 5, 8, 6, 7, 6], average: 6.4 },
  { name: 'Innovation', weight: 20, scores: [6, 5, 7, 4, 6, 4, 8, 5, 6, 5], average: 5.6 },
  { name: 'Time to Market', weight: 20, scores: [8, 6, 9, 5, 7, 5, 9, 7, 8, 6], average: 7.0 },
  { name: 'Responsiveness', weight: 20, scores: [7, 5, 8, 4, 6, 5, 8, 6, 7, 5], average: 6.1 },
  { name: 'Continuous Improvement', weight: 20, scores: [7, 6, 8, 5, 7, 5, 8, 6, 7, 6], average: 6.5 },
];

export const dummyTimeSeries: TimeSeriesPoint[] = [
  { period: 'Q3 2024', maturity: 3.2, performance: 3.5, agility: 3.0 },
  { period: 'Q4 2024', maturity: 4.1, performance: 4.3, agility: 3.8 },
  { period: 'Q1 2025', maturity: 4.8, performance: 5.0, agility: 4.5 },
  { period: 'Q2 2025', maturity: 5.5, performance: 5.7, agility: 5.2 },
  { period: 'Q3 2025', maturity: 6.1, performance: 6.3, agility: 5.8 },
  { period: 'Q4 2025', maturity: 6.8, performance: 6.9, agility: 6.4 },
];

export const quarterlyTrends: QuarterlyTrend[] = availableQuarters.map((q, i) => ({
  quarter: q,
  stability: 45 + i * 7,
  maturity: 3.2 + i * 0.6,
  performance: 3.5 + i * 0.55,
  agility: 3.0 + i * 0.58,
  weightedAverage: 3.3 + i * 0.57,
}));
