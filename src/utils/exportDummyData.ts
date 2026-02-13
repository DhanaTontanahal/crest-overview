import * as XLSX from 'xlsx';
import {
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyTimeSeries, quarterlyTrends, cios, defaultPlatforms, defaultPillars, availableQuarters,
  currentQuarter, currentMonth,
} from '@/data/dummyData';
import { assessmentQuestions, sampleAssessments } from '@/data/assessmentQuestions';

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

  // Sheet 6: Assessment Question Bank
  const questionData = assessmentQuestions.map(q => ({
    'Question ID': q.id,
    Pillar: q.pillar,
    Question: q.question,
    'Low Maturity': q.lowMaturity,
    'High Maturity (North Star)': q.highMaturity,
    'Observable Metrics': q.observableMetrics,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(questionData), 'Question Bank');

  // Sheet 7: Assessment Submissions
  const assessmentData = sampleAssessments.map(a => ({
    'Assessment ID': a.id,
    Platform: a.platform,
    Quarter: a.quarter,
    'Submitted By': a.submittedBy + ' TPL',
    'Submitted At': a.submittedAt,
    Status: a.status,
    'Reviewed By': a.reviewedBy ? a.reviewedBy + ' TPL' : 'Pending',
    'Reviewed At': a.reviewedAt ?? '',
    'Total Questions': a.answers.length,
    'Avg Score': a.answers.length > 0
      ? +(a.answers.reduce((s, ans) => s + ans.score, 0) / a.answers.length).toFixed(1) : 0,
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(assessmentData), 'Assessment Summary');

  // Sheet 8: Assessment Answers (detailed)
  const answerRows: Record<string, unknown>[] = [];
  sampleAssessments.forEach(a => {
    a.answers.forEach(ans => {
      const q = assessmentQuestions.find(qq => qq.id === ans.questionId);
      answerRows.push({
        Platform: a.platform,
        Quarter: a.quarter,
        Status: a.status,
        'Submitted By': a.submittedBy + ' TPL',
        'Reviewed By': a.reviewedBy ? a.reviewedBy + ' TPL' : 'Pending',
        Pillar: q?.pillar ?? '',
        'Question ID': ans.questionId,
        Question: q?.question ?? '',
        Score: ans.score,
        Comments: ans.comments,
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(answerRows), 'Assessment Answers');

  // Sheet 9: Pillar Score Summary (per platform per pillar)
  const pillarSummary: Record<string, unknown>[] = [];
  defaultPlatforms.forEach(platform => {
    const assessment = sampleAssessments.find(a => a.platform === platform);
    defaultPillars.forEach(pillar => {
      const pillarQs = assessmentQuestions.filter(q => q.pillar === pillar);
      const scores = pillarQs.map(q => assessment?.answers.find(a => a.questionId === q.id)?.score ?? 0).filter(s => s > 0);
      const avg = scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
      pillarSummary.push({
        Platform: platform,
        Pillar: pillar,
        Quarter: assessment?.quarter ?? '',
        'Questions Answered': scores.length,
        'Total Questions': pillarQs.length,
        'Average Score': avg,
        'Submitted By': assessment?.submittedBy ? assessment.submittedBy + ' TPL' : '',
        'Reviewed By': assessment?.reviewedBy ? assessment.reviewedBy + ' TPL' : 'Pending',
      });
    });
  });
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pillarSummary), 'Pillar Scores');

  // Sheet 10: Reference (CIOs, Platforms, Pillars, Quarters)
  const maxLen = Math.max(cios.length, defaultPlatforms.length, defaultPillars.length, availableQuarters.length);
  const refData = Array.from({ length: maxLen }, (_, i) => ({
    'CIO ID': cios[i]?.id ?? '',
    'CIO Platform': cios[i]?.platform ?? '',
    Platform: defaultPlatforms[i] ?? '',
    Pillar: defaultPillars[i] ?? '',
    Quarter: availableQuarters[i] ?? '',
    ...(i === 0 ? { 'Current Quarter': currentQuarter, 'Current Month': currentMonth } : {}),
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(refData), 'Reference');

  XLSX.writeFile(wb, 'Platform_Maturity_Data.xlsx');
}
