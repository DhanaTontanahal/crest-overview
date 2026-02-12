import { TeamData, DimensionScore, TimeSeriesPoint } from '@/types/maturity';

export const defaultPlatforms = ['Digital Banking', 'Payments', 'Insurance', 'Wealth Management'];
export const defaultPillars = ['Engineering', 'Data', 'Cloud', 'Security'];

export const dummyTeams: TeamData[] = [
  { name: 'Team Alpha', maturity: 7.8, performance: 7.2, agility: 7.5, stability: 82, platform: 'Digital Banking', pillar: 'Engineering' },
  { name: 'Team Beta', maturity: 5.1, performance: 5.6, agility: 4.9, stability: 58, platform: 'Digital Banking', pillar: 'Data' },
  { name: 'Team Gamma', maturity: 8.5, performance: 8.1, agility: 8.3, stability: 91, platform: 'Payments', pillar: 'Engineering' },
  { name: 'Team Delta', maturity: 3.9, performance: 4.2, agility: 3.7, stability: 45, platform: 'Payments', pillar: 'Cloud' },
  { name: 'Team Epsilon', maturity: 6.4, performance: 6.9, agility: 6.2, stability: 73, platform: 'Insurance', pillar: 'Security' },
  { name: 'Team Zeta', maturity: 4.6, performance: 3.8, agility: 4.1, stability: 52, platform: 'Insurance', pillar: 'Data' },
  { name: 'Team Eta', maturity: 8.9, performance: 8.7, agility: 8.5, stability: 94, platform: 'Wealth Management', pillar: 'Engineering' },
  { name: 'Team Theta', maturity: 6.3, performance: 5.5, agility: 6.8, stability: 68, platform: 'Wealth Management', pillar: 'Cloud' },
  { name: 'Team Iota', maturity: 7.1, performance: 7.4, agility: 6.6, stability: 76, platform: 'Digital Banking', pillar: 'Security' },
  { name: 'Team Kappa', maturity: 5.7, performance: 6.1, agility: 5.3, stability: 61, platform: 'Payments', pillar: 'Data' },
];

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
  { period: '3 months ago', maturity: 3.2, performance: 3.5, agility: 3.0 },
  { period: '2 months ago', maturity: 4.5, performance: 4.8, agility: 4.2 },
  { period: 'Last month', maturity: 5.2, performance: 5.5, agility: 5.0 },
  { period: 'This month', maturity: 6.2, performance: 6.3, agility: 5.9 },
];
