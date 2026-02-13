import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppState, UserRole, UserProfile, TeamData, DimensionScore, TimeSeriesPoint } from '@/types/maturity';
import {
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyTimeSeries, defaultPlatforms, defaultPillars, cios, quarterlyTrends, availableQuarters,
} from '@/data/dummyData';

const AppContext = createContext<AppState | null>(null);

export const useAppState = (): AppState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [teams, setTeams] = useState<TeamData[]>(dummyTeams);
  const [platforms, setPlatforms] = useState<string[]>(defaultPlatforms);
  const [pillars, setPillars] = useState<string[]>(defaultPillars);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>(dummyTimeSeries);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4 2025');

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (t.quarter !== selectedQuarter) return false;
      // Supervisor CIO filter
      if (user?.role === 'supervisor' && user.cioId) {
        const cio = cios.find(c => c.id === user.cioId);
        if (cio && t.platform !== cio.platform) return false;
      }
      if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
      if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
      return true;
    });
  }, [teams, selectedPlatform, selectedPillar, selectedQuarter, user]);

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
    user, setUser,
    role, setRole, teams, setTeams,
    platforms, setPlatforms, pillars, setPillars,
    cios,
    maturityDimensions, performanceMetrics,
    timeSeries, setTimeSeries,
    selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar,
    selectedQuarter, setSelectedQuarter,
    quarterlyTrends,
    availableQuarters,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
