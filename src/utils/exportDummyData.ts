import * as XLSX from 'xlsx';
import {
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyTimeSeries, quarterlyTrends, cios, defaultPlatforms, defaultPillars, availableQuarters,
} from '@/data/dummyData';

export function downloadDummyDataExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Teams
  const teamsData = dummyTeams.map(t => ({
    Team: t.name,
    Maturity: t.maturity,
    Performance: t.performance,
    Agility: t.agility,
    'Stability (%)': t.stability,
    Platform: t.platform,
    Pillar: t.pillar,
    Quarter: t.quarter,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teamsData), 'Teams');

  // Sheet 2: Maturity Dimensions
  const matDims = dummyMaturityDimensions.map(d => ({
    Dimension: d.name,
    Weight: d.weight,
    Average: d.average,
    ...Object.fromEntries(d.scores.map((s, i) => [`Score ${i + 1}`, s])),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(matDims), 'Maturity Dimensions');

  // Sheet 3: Performance Metrics
  const perfMetrics = dummyPerformanceMetrics.map(d => ({
    Metric: d.name,
    Weight: d.weight,
    Average: d.average,
    ...Object.fromEntries(d.scores.map((s, i) => [`Score ${i + 1}`, s])),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(perfMetrics), 'Performance Metrics');

  // Sheet 4: Time Series
  const ts = dummyTimeSeries.map(t => ({
    Period: t.period,
    Maturity: t.maturity,
    Performance: t.performance,
    Agility: t.agility,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ts), 'Time Series');

  // Sheet 5: Quarterly Trends
  const qt = quarterlyTrends.map(q => ({
    Quarter: q.quarter,
    'Stability (%)': q.stability,
    Maturity: q.maturity,
    Performance: q.performance,
    Agility: q.agility,
    'Weighted Average': q.weightedAverage,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(qt), 'Quarterly Trends');

  // Sheet 6: Reference (CIOs, Platforms, Pillars, Quarters)
  const maxLen = Math.max(cios.length, defaultPlatforms.length, defaultPillars.length, availableQuarters.length);
  const refData = Array.from({ length: maxLen }, (_, i) => ({
    'CIO ID': cios[i]?.id ?? '',
    'CIO Platform': cios[i]?.platform ?? '',
    Platform: defaultPlatforms[i] ?? '',
    Pillar: defaultPillars[i] ?? '',
    Quarter: availableQuarters[i] ?? '',
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refData), 'Reference');

  XLSX.writeFile(wb, 'Platform_Maturity_Data.xlsx');
}
