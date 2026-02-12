import { TeamData, DimensionScore, TimeSeriesPoint } from '@/types/maturity';

export const defaultPlatforms = ['Digital Banking', 'Payments', 'Insurance', 'Wealth Management'];
export const defaultPillars = ['Engineering', 'Data', 'Cloud', 'Security'];

export const dummyTeams: TeamData[] = [
  { name: 'Team Alpha', maturity: 7.2, performance: 6.8, agility: 7.0, stability: 80, platform: 'Digital Banking', pillar: 'Engineering' },
  { name: 'Team Beta', maturity: 5.5, performance: 6.0, agility: 5.8, stability: 65, platform: 'Digital Banking', pillar: 'Data' },
  { name: 'Team Gamma', maturity: 8.1, performance: 7.5, agility: 7.8, stability: 85, platform: 'Payments', pillar: 'Engineering' },
  { name: 'Team Delta', maturity: 4.3, performance: 5.2, agility: 4.8, stability: 55, platform: 'Payments', pillar: 'Cloud' },
  { name: 'Team Epsilon', maturity: 6.7, performance: 7.1, agility: 6.9, stability: 72, platform: 'Insurance', pillar: 'Security' },
  { name: 'Team Zeta', maturity: 3.8, performance: 4.5, agility: 4.2, stability: 48, platform: 'Insurance', pillar: 'Data' },
  { name: 'Team Eta', maturity: 7.9, performance: 8.0, agility: 7.9, stability: 88, platform: 'Wealth Management', pillar: 'Engineering' },
  { name: 'Team Theta', maturity: 6.1, performance: 5.8, agility: 6.0, stability: 70, platform: 'Wealth Management', pillar: 'Cloud' },
];

export const dummyMaturityDimensions: DimensionScore[] = [
  { name: 'Clarity', weight: 25, scores: [7, 5, 8, 4, 7, 3, 8, 6], average: 6.0 },
  { name: 'Leadership', weight: 25, scores: [6, 5, 7, 5, 6, 4, 8, 6], average: 5.9 },
  { name: 'Culture', weight: 25, scores: [7, 6, 8, 4, 7, 4, 8, 6], average: 6.3 },
  { name: 'Foundation', weight: 25, scores: [8, 5, 9, 4, 7, 4, 7, 6], average: 6.3 },
];

export const dummyPerformanceMetrics: DimensionScore[] = [
  { name: 'Throughput', weight: 16, scores: [6, 5, 8, 4, 7, 3, 8, 5], average: 5.8 },
  { name: 'Predictability', weight: 16, scores: [7, 6, 7, 5, 6, 5, 8, 6], average: 6.3 },
  { name: 'Change Fail Rate', weight: 16, scores: [5, 4, 7, 6, 5, 4, 7, 5], average: 5.4 },
  { name: 'Deployment Frequency', weight: 16, scores: [8, 6, 9, 5, 7, 4, 9, 7], average: 6.9 },
  { name: 'Mean Time to Deploy', weight: 16, scores: [7, 5, 8, 4, 6, 3, 8, 6], average: 5.9 },
  { name: 'Lead Time', weight: 20, scores: [6, 5, 7, 5, 6, 4, 7, 6], average: 5.8 },
];

export const dummyTimeSeries: TimeSeriesPoint[] = [
  { period: '3 months ago', maturity: 3.2, performance: 3.5, agility: 3.0 },
  { period: '2 months ago', maturity: 4.5, performance: 4.8, agility: 4.2 },
  { period: 'Last month', maturity: 5.2, performance: 5.5, agility: 5.0 },
  { period: 'This month', maturity: 6.2, performance: 6.3, agility: 5.9 },
];
