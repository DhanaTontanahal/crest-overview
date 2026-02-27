import React, { createContext, useContext, useState, useMemo } from 'react';
import { AppState, UserRole, UserProfile, TeamData, DimensionScore, TimeSeriesPoint } from '@/types/maturity';
import { Assessment, AssessmentQuestion, assessmentQuestions as defaultQuestions } from '@/data/assessmentQuestions';
import { sampleAssessments } from '@/data/assessmentQuestions';
import {
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyStabilityDimensions, dummyAgilityDimensions,
  dummyTimeSeries, defaultPlatforms, defaultPillars, cios, quarterlyTrends, availableQuarters, currentQuarter,
} from '@/data/dummyData';

export type CalculationMethod = 'simple' | 'weighted' | 'median' | 'trimmed';

interface ExtendedAppState extends AppState {
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  assessmentQuestions: AssessmentQuestion[];
  setAssessmentQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>>;
  publishedQuestions: AssessmentQuestion[];
  publishQuestions: () => void;
  isQuestionsPublished: boolean;
  calculationMethod: CalculationMethod;
  setCalculationMethod: (method: CalculationMethod) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<ExtendedAppState | null>(null);

export const useAppState = (): ExtendedAppState => {
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
  const [assessments, setAssessments] = useState<Assessment[]>(sampleAssessments);
  const [assessmentQuestionsState, setAssessmentQuestionsRaw] = useState<AssessmentQuestion[]>(defaultQuestions);
  const [publishedQuestions, setPublishedQuestions] = useState<AssessmentQuestion[]>(defaultQuestions);
  const [isQuestionsPublished, setIsQuestionsPublished] = useState(true);

  const publishQuestions = () => {
    setPublishedQuestions([...assessmentQuestionsState]);
    setIsQuestionsPublished(true);
  };

  const setAssessmentQuestions: React.Dispatch<React.SetStateAction<AssessmentQuestion[]>> = (action) => {
    setAssessmentQuestionsRaw(action);
    setIsQuestionsPublished(false);
  };
  const [calculationMethod, setCalculationMethodState] = useState<CalculationMethod>(
    () => (localStorage.getItem('calculationMethod') as CalculationMethod) || 'simple'
  );
  const setCalculationMethod = (method: CalculationMethod) => {
    setCalculationMethodState(method);
    localStorage.setItem('calculationMethod', method);
  };
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const filteredTeams = useMemo(() => {
    return teams.filter(t => {
      if (t.quarter !== selectedQuarter) return false;
      if (user?.role === 'supervisor' && user.cioId) {
        const cio = cios.find(c => c.id === user.cioId);
        if (cio && t.platform !== cio.platform) return false;
      }
      if (selectedPlatform !== 'All' && t.platform !== selectedPlatform) return false;
      if (selectedPillar !== 'All' && t.pillar !== selectedPillar) return false;
      return true;
    });
  }, [teams, selectedPlatform, selectedPillar, selectedQuarter, user]);

  // Compute dimension scores from assessment answers
  const assessmentDerivedDimensions = useMemo(() => {
    let quarterAssessments = assessments.filter(a => a.quarter === selectedQuarter && (a.status === 'submitted' || a.status === 'reviewed'));
    if (quarterAssessments.length === 0) return null;

    // Filter by selected platform if not 'All'
    if (selectedPlatform !== 'All') {
      quarterAssessments = quarterAssessments.filter(a => a.platform === selectedPlatform);
      if (quarterAssessments.length === 0) return null;
    }

    const buildScores = (metric: string, fallback: DimensionScore[]): DimensionScore[] => {
      const relevantQuestions = assessmentQuestionsState.filter(q => q.dimensionMetric === metric);
      const subMetrics = [...new Set(relevantQuestions.map(q => q.subMetric))];

      if (subMetrics.length === 0) return fallback;

      return subMetrics.map(sm => {
        const qIds = relevantQuestions.filter(q => q.subMetric === sm).map(q => q.id);
        const allScores: number[] = [];
        quarterAssessments.forEach(a => {
          qIds.forEach(qId => {
            const ans = a.answers.find(an => an.questionId === qId);
            if (ans && ans.score > 0) allScores.push(ans.score * 2); // scale 1-5 to 2-10
          });
        });
        const avg = allScores.length > 0 ? allScores.reduce((s, v) => s + v, 0) / allScores.length : 0;
        const weight = Math.round(100 / subMetrics.length);
        return { name: sm, weight, scores: allScores.length > 0 ? allScores : [0], average: Math.round(avg * 10) / 10 };
      });
    };

    return {
      maturity: buildScores('Maturity', dummyMaturityDimensions),
      performance: buildScores('Performance', dummyPerformanceMetrics),
      stability: buildScores('Stability', dummyStabilityDimensions),
      agility: buildScores('Agility', dummyAgilityDimensions),
    };
  }, [assessments, assessmentQuestionsState, selectedQuarter, selectedPlatform]);

  const maturityDimensions = useMemo<DimensionScore[]>(() => {
    if (assessmentDerivedDimensions?.maturity) return assessmentDerivedDimensions.maturity;
    if (filteredTeams.length === 0) return dummyMaturityDimensions;
    return dummyMaturityDimensions.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams, assessmentDerivedDimensions]);

  const performanceMetrics = useMemo<DimensionScore[]>(() => {
    if (assessmentDerivedDimensions?.performance) return assessmentDerivedDimensions.performance;
    if (filteredTeams.length === 0) return dummyPerformanceMetrics;
    return dummyPerformanceMetrics.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams, assessmentDerivedDimensions]);

  const stabilityDimensions = useMemo<DimensionScore[]>(() => {
    if (assessmentDerivedDimensions?.stability) return assessmentDerivedDimensions.stability;
    if (filteredTeams.length === 0) return dummyStabilityDimensions;
    return dummyStabilityDimensions.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams, assessmentDerivedDimensions]);

  const agilityDimensions = useMemo<DimensionScore[]>(() => {
    if (assessmentDerivedDimensions?.agility) return assessmentDerivedDimensions.agility;
    if (filteredTeams.length === 0) return dummyAgilityDimensions;
    return dummyAgilityDimensions.map(d => ({
      ...d,
      scores: filteredTeams.map((_, i) => d.scores[i % d.scores.length]),
      average: filteredTeams.reduce((sum, _, i) => sum + d.scores[i % d.scores.length], 0) / filteredTeams.length,
    }));
  }, [filteredTeams, assessmentDerivedDimensions]);

  const value: ExtendedAppState = {
    user, setUser,
    role, setRole, teams, setTeams,
    platforms, setPlatforms, pillars, setPillars,
    cios,
    maturityDimensions, performanceMetrics,
    stabilityDimensions, agilityDimensions,
    timeSeries, setTimeSeries,
    selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar,
    selectedQuarter, setSelectedQuarter,
    quarterlyTrends,
    availableQuarters,
    assessments, setAssessments,
    assessmentQuestions: assessmentQuestionsState, setAssessmentQuestions,
    publishedQuestions, publishQuestions, isQuestionsPublished,
    calculationMethod, setCalculationMethod,
    activeTab, setActiveTab,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
