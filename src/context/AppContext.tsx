import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppState, UserRole, TeamData, DimensionScore, TimeSeriesPoint } from '@/types/maturity';
import {
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyTimeSeries, defaultPlatforms, defaultPillars
} from '@/data/dummyData';

const AppContext = createContext<AppState | null>(null);

export const useAppState = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('supervisor');
  const [teams, setTeams] = useState<TeamData[]>(dummyTeams);
  const [platforms, setPlatforms] = useState<string[]>(defaultPlatforms);
  const [pillars, setPillars] = useState<string[]>(defaultPillars);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>(dummyTimeSeries);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
      if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
      return true;
    });
  }, [teams, selectedPlatform, selectedPillar]);

  const maturityDimensions = useMemo<DimensionScore[]>(() => {
    if (filteredTeams.length === 0) return dummyMaturityDimensions;
    return dummyMaturityDimensions.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams]);

  const performanceMetrics = useMemo<DimensionScore[]>(() => {
    if (filteredTeams.length === 0) return dummyPerformanceMetrics;
    return dummyPerformanceMetrics.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams]);

  const value: AppState = {
    role, setRole, teams, setTeams,
    platforms, setPlatforms, pillars, setPillars,
    maturityDimensions, performanceMetrics,
    timeSeries, setTimeSeries,
    selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
