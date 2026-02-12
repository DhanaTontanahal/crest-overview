export type UserRole = 'admin' | 'supervisor' | 'user';

export interface TeamData {
  name: string;
  maturity: number;
  performance: number;
  agility: number;
  stability: number;
  platform: string;
  pillar: string;
}

export interface DimensionScore {
  name: string;
  weight: number;
  scores: number[]; // individual team scores
  average: number;
}

export interface TimeSeriesPoint {
  period: string;
  maturity: number;
  performance: number;
  agility: number;
}

export interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  teams: TeamData[];
  setTeams: (teams: TeamData[]) => void;
  platforms: string[];
  setPlatforms: (p: string[]) => void;
  pillars: string[];
  setPillars: (p: string[]) => void;
  maturityDimensions: DimensionScore[];
  performanceMetrics: DimensionScore[];
  timeSeries: TimeSeriesPoint[];
  setTimeSeries: (ts: TimeSeriesPoint[]) => void;
  selectedPlatform: string;
  setSelectedPlatform: (p: string) => void;
  selectedPillar: string;
  setSelectedPillar: (p: string) => void;
}
