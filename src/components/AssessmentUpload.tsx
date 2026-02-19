import React, { useCallback, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Assessment, AssessmentAnswer, assessmentQuestions as defaultQuestions } from '@/data/assessmentQuestions';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, CheckCircle2, Clock, Eye, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';

const AssessmentUpload: React.FC = () => {
  const { assessments, setAssessments, assessmentQuestions, selectedQuarter, platforms } = useAppState();

  // Download sample assessment Excel
  const downloadSampleTemplate = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Instructions
    const instructions = [
      ['Platform Maturity Assessment — Upload Template'],
      [''],
      ['Instructions:'],
      ['1. Fill in the "Assessments" sheet with one row per question per platform'],
      ['2. Score each question from 1 (lowest maturity) to 5 (highest maturity)'],
      ['3. Add optional comments/evidence for each score'],
      ['4. Upload the completed file using the "Upload Assessment" button'],
      [''],
      ['Columns:'],
      ['  Platform — The platform name (e.g., Consumer, Commercial)'],
      ['  Quarter — The quarter (e.g., Q4 2025)'],
      ['  Question ID — The question identifier (e.g., bt-1, rc-1)'],
      ['  Pillar — The pillar this question belongs to'],
      ['  Dimension Metric — The metric this measures (Maturity/Performance/Stability/Agility)'],
      ['  Sub Metric — The specific sub-metric being measured'],
      ['  Question — The full question text'],
      ['  Score — Your rating from 1-5'],
      ['  Comments — Supporting evidence or comments'],
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Sheet 2: Assessments (pre-filled with all questions for each platform)
    const header = ['Platform', 'Quarter', 'Question ID', 'Pillar', 'Dimension Metric', 'Sub Metric', 'Question', 'Score', 'Comments'];
    const rows: (string | number)[][] = [header];
    platforms.forEach(platform => {
      assessmentQuestions.forEach(q => {
        rows.push([platform, selectedQuarter, q.id, q.pillar, q.dimensionMetric, q.subMetric, q.question, '', '']);
      });
    });
    const wsAssessments = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    wsAssessments['!cols'] = [
      { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 60 }, { wch: 6 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAssessments, 'Assessments');

    // Sheet 3: Question Reference
    const refHeader = ['Question ID', 'Pillar', 'Dimension Metric', 'Sub Metric', 'Question', 'Low Maturity (1)', 'High Maturity (5)', 'Observable Metrics'];
    const refRows: string[][] = [refHeader];
    assessmentQuestions.forEach(q => {
      refRows.push([q.id, q.pillar, q.dimensionMetric, q.subMetric, q.question, q.lowMaturity, q.highMaturity, q.observableMetrics]);
    });
    const wsRef = XLSX.utils.aoa_to_sheet(refRows);
    wsRef['!cols'] = [
      { wch: 12 }, { wch: 28 }, { wch: 16 }, { wch: 20 }, { wch: 60 }, { wch: 50 }, { wch: 50 }, { wch: 50 },
    ];
    XLSX.utils.book_append_sheet(wb, wsRef, 'Question Reference');

    XLSX.writeFile(wb, 'Assessment_Upload_Template.xlsx');
    toast({ title: 'Template Downloaded', description: 'Fill in the Assessments sheet and upload it back.' });
  }, [assessmentQuestions, platforms, selectedQuarter]);

  // Upload assessment Excel
  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Find the Assessments sheet
        const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('assessment')) || workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

        // Group by platform + quarter
        const grouped: Record<string, { platform: string; quarter: string; answers: AssessmentAnswer[] }> = {};

        json.forEach(row => {
          const platform = String(row['Platform'] || '').trim();
          const quarter = String(row['Quarter'] || selectedQuarter).trim();
          const questionId = String(row['Question ID'] || '').trim();
          const score = Number(row['Score'] || 0);
          const comments = String(row['Comments'] || '').trim();

          if (!platform || !questionId) return;

          const key = `${platform}__${quarter}`;
          if (!grouped[key]) {
            grouped[key] = { platform, quarter, answers: [] };
          }
          if (score >= 1 && score <= 5) {
            grouped[key].answers.push({ questionId, score, comments });
          }
        });

        const newAssessments: Assessment[] = Object.values(grouped).map(g => ({
          id: `assess-${g.platform.toLowerCase().replace(/\s+/g, '-')}-${g.quarter.replace(' ', '')}`,
          platform: g.platform,
          quarter: g.quarter,
          submittedBy: 'Admin Upload',
          submittedAt: new Date().toISOString().split('T')[0],
          reviewedBy: null,
          reviewedAt: null,
          status: 'submitted' as const,
          answers: g.answers,
        }));

        if (newAssessments.length === 0) {
          toast({ title: 'No data found', description: 'No valid assessment rows found. Check column names.', variant: 'destructive' });
          return;
        }

        // Merge with existing assessments (replace by platform+quarter)
        setAssessments(prev => {
          const updated = [...prev];
          newAssessments.forEach(na => {
            const idx = updated.findIndex(a => a.platform === na.platform && a.quarter === na.quarter);
            if (idx >= 0) updated[idx] = na;
            else updated.push(na);
          });
          return updated;
        });

        toast({
          title: 'Assessments Uploaded',
          description: `${newAssessments.length} platform assessment(s) imported. Metric dimensions will update accordingly.`,
        });
      } catch {
        toast({ title: 'Upload failed', description: 'Please check your Excel format matches the template.', variant: 'destructive' });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  }, [setAssessments, selectedQuarter]);

  // Current assessments summary
  const quarterAssessments = useMemo(() =>
    assessments.filter(a => a.quarter === selectedQuarter),
    [assessments, selectedQuarter]
  );

  const getStatusIcon = (status: string) => {
    if (status === 'reviewed') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (status === 'submitted') return <Clock className="w-4 h-4 text-amber-500" />;
    return <Eye className="w-4 h-4 text-muted-foreground" />;
  };

  const getAvgScore = (answers: AssessmentAnswer[]) => {
    const scored = answers.filter(a => a.score > 0);
    if (scored.length === 0) return 0;
    return +(scored.reduce((s, a) => s + a.score, 0) / scored.length).toFixed(1);
  };

  // Per-metric breakdown for each assessment
  const getMetricBreakdown = (answers: AssessmentAnswer[]) => {
    const metrics: Record<string, { total: number; count: number }> = {};
    answers.forEach(ans => {
      const q = assessmentQuestions.find(q => q.id === ans.questionId);
      if (q && ans.score > 0) {
        if (!metrics[q.dimensionMetric]) metrics[q.dimensionMetric] = { total: 0, count: 0 };
        metrics[q.dimensionMetric].total += ans.score;
        metrics[q.dimensionMetric].count += 1;
      }
    });
    return Object.entries(metrics).map(([metric, { total, count }]) => ({
      metric,
      avg: +(total / count).toFixed(1),
      scaledAvg: +((total / count) * 2).toFixed(1), // scaled to 10
    }));
  };

  const metricColorMap: Record<string, string> = {
    'Maturity': 'bg-emerald-100 text-emerald-700',
    'Performance': 'bg-green-100 text-green-700',
    'Stability': 'bg-cyan-100 text-cyan-700',
    'Agility': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">Assessment Data Upload</h3>
            <p className="text-sm text-muted-foreground">Upload platform assessments via Excel. Scores flow into Metric Dimensions automatically.</p>
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-4 border border-border/50 mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            <strong>How it works:</strong> Each assessment question maps to a specific <span className="text-primary font-medium">Dimension Metric</span> and <span className="text-primary font-medium">Sub-Metric</span>.
            When scores are uploaded, they're scaled (1-5 → 2-10) and averaged per sub-metric to produce the dimension chart values.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Maturity', 'Performance', 'Stability', 'Agility'].map(m => (
              <span key={m} className={`text-xs px-2 py-1 rounded-full font-medium ${metricColorMap[m]}`}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <label>
            <Button variant="default" className="cursor-pointer" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Assessment Excel
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
              </span>
            </Button>
          </label>
          <Button variant="secondary" onClick={downloadSampleTemplate}>
            <Download className="w-4 h-4 mr-2" />
            Download Sample Template
          </Button>
        </div>
      </div>

      {/* Current Assessments */}
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border opacity-0 animate-slide-up" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-card-foreground">Current Assessments — {selectedQuarter}</h3>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{quarterAssessments.length} platforms</span>
        </div>

        {quarterAssessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No assessments for {selectedQuarter}. Upload or have TPLs submit assessments.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quarterAssessments.map((a, idx) => {
              const avgScore = getAvgScore(a.answers);
              const answered = a.answers.filter(ans => ans.score > 0).length;
              const breakdown = getMetricBreakdown(a.answers);

              return (
                <div
                  key={a.id}
                  className="border border-border/50 rounded-lg p-4 hover:shadow-sm transition-shadow opacity-0 animate-fade-in"
                  style={{ animationDelay: `${200 + idx * 80}ms`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(a.status)}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{a.platform}</h4>
                        <p className="text-xs text-muted-foreground">
                          {a.submittedBy} • {a.submittedAt}
                          {a.reviewedBy && ` • Reviewed by ${a.reviewedBy}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{avgScore}<span className="text-xs text-muted-foreground font-normal">/5</span></p>
                      <p className="text-xs text-muted-foreground">{answered}/{assessmentQuestions.length} answered</p>
                    </div>
                  </div>

                  {/* Metric breakdown badges */}
                  <div className="flex flex-wrap gap-2">
                    {breakdown.map(b => (
                      <div key={b.metric} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${metricColorMap[b.metric] || 'bg-muted text-foreground'}`}>
                        <span>{b.metric}</span>
                        <span className="font-bold">{b.avg}</span>
                        <span className="opacity-60">→ {b.scaledAvg}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentUpload;
