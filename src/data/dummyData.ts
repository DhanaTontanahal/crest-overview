import { TeamData, DimensionScore, TimeSeriesPoint, CIO, QuarterlyTrend } from '@/types/maturity';

export const cios: CIO[] = [
  { id: 'martin', name: 'Martin', platform: 'Consumer' },
  { id: 'sarah', name: 'Sarah', platform: 'Commercial' },
  { id: 'james', name: 'James', platform: 'Wealth & Investment' },
  { id: 'lisa', name: 'Lisa', platform: 'Insurance' },
];

export const defaultPlatforms = ['Consumer', 'Commercial', 'Wealth & Investment', 'Insurance'];

export const defaultPillars = [
  'Business and Technology',
  'Run and Change Together',
  'All in One Agile',
  'Project to Product',
  'Engineering Excellence',
  'Dynamic and Well Controlled',
];

export const availableQuarters = ['Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];

const generateTeamsForQuarter = (quarter: string, seed: number): TeamData[] => {
  const teamNames = [
    'Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta', 'Team Epsilon',
    'Team Zeta', 'Team Eta', 'Team Theta', 'Team Iota', 'Team Kappa',
    'Team Lambda', 'Team Mu', 'Team Nu', 'Team Xi', 'Team Omicron',
    'Team Pi', 'Team Rho', 'Team Sigma', 'Team Tau', 'Team Upsilon',
    'Team Phi', 'Team Chi', 'Team Psi', 'Team Omega',
  ];

  const platforms = defaultPlatforms;
  const pillars = defaultPillars;

  return teamNames.map((name, i) => {
    const platformIdx = i % platforms.length;
    const pillarIdx = i % pillars.length;
    const growth = seed * 0.15;
    const base = 3.5 + (i % 7) * 0.8 + growth;
    const clamp = (v: number) => Math.min(10, Math.max(1, Math.round(v * 10) / 10));

    return {
      name,
      maturity: clamp(base + (i % 3) * 0.3),
      performance: clamp(base - 0.2 + (i % 4) * 0.2),
      agility: clamp(base - 0.4 + (i % 5) * 0.15),
      stability: Math.min(100, Math.max(20, Math.round(base * 10 + (i % 6) * 3))),
      platform: platforms[platformIdx],
      pillar: pillars[pillarIdx],
      quarter,
    };
  });
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
  stability: 45 + i * 8,
  maturity: 3.2 + i * 0.7,
  performance: 3.5 + i * 0.65,
  agility: 3.0 + i * 0.68,
  weightedAverage: 3.3 + i * 0.67,
}));
