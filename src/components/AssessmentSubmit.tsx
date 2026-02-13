import React, { useState, useMemo } from 'react';
import { assessmentQuestions, Assessment, AssessmentAnswer } from '@/data/assessmentQuestions';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClipboardList, ChevronRight, ChevronDown, Send, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { defaultPillars } from '@/data/dummyData';

interface AssessmentSubmitProps {
  platform: string;
  onSubmit: (assessment: Assessment) => void;
  existingAssessment?: Assessment;
}

const AssessmentSubmit: React.FC<AssessmentSubmitProps> = ({ platform, onSubmit, existingAssessment }) => {
  const { selectedQuarter } = useAppState();
  const { toast } = useToast();
  const [expandedPillar, setExpandedPillar] = useState<string | null>(defaultPillars[0]);

  const initAnswers = (): Record<string, { score: number; comments: string }> => {
    const map: Record<string, { score: number; comments: string }> = {};
    assessmentQuestions.forEach(q => {
      const existing = existingAssessment?.answers.find(a => a.questionId === q.id);
      map[q.id] = { score: existing?.score ?? 0, comments: existing?.comments ?? '' };
    });
    return map;
  };

  const [answers, setAnswers] = useState(initAnswers);

  const pillarQuestions = useMemo(() => {
    const grouped: Record<string, typeof assessmentQuestions> = {};
    defaultPillars.forEach(p => { grouped[p] = []; });
    assessmentQuestions.forEach(q => {
      if (grouped[q.pillar]) grouped[q.pillar].push(q);
    });
    return grouped;
  }, []);

  const pillarProgress = useMemo(() => {
    const progress: Record<string, { answered: number; total: number; avg: number }> = {};
    Object.entries(pillarQuestions).forEach(([pillar, questions]) => {
      const answered = questions.filter(q => answers[q.id]?.score > 0).length;
      const scores = questions.map(q => answers[q.id]?.score ?? 0).filter(s => s > 0);
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      progress[pillar] = { answered, total: questions.length, avg };
    });
    return progress;
  }, [answers, pillarQuestions]);

  const totalAnswered = Object.values(pillarProgress).reduce((s, p) => s + p.answered, 0);
  const totalQuestions = assessmentQuestions.length;
  const isComplete = totalAnswered === totalQuestions;

  const handleSubmit = (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !isComplete) {
      toast({ title: 'Incomplete', description: 'Please answer all questions before submitting.', variant: 'destructive' });
      return;
    }
    const assessment: Assessment = {
      id: existingAssessment?.id ?? `assess-${platform.toLowerCase().replace(/\s+/g, '-')}-${selectedQuarter.replace(' ', '')}`,
      platform,
      quarter: selectedQuarter,
      submittedBy: platform,
      submittedAt: new Date().toISOString().split('T')[0],
      reviewedBy: existingAssessment?.reviewedBy ?? null,
      reviewedAt: existingAssessment?.reviewedAt ?? null,
      status,
      answers: assessmentQuestions.map(q => ({
        questionId: q.id,
        score: answers[q.id]?.score ?? 0,
        comments: answers[q.id]?.comments ?? '',
      })),
    };
    onSubmit(assessment);
    toast({ title: status === 'submitted' ? 'Assessment Submitted' : 'Draft Saved', description: `${platform} — ${selectedQuarter}` });
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 2) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (score >= 1) return 'bg-red-100 text-red-800 border-red-300';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Platform Maturity Assessment</h2>
              <p className="text-sm text-muted-foreground">{platform} — {selectedQuarter} • Score 1-5 (1=lowest, 5=highest)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{totalAnswered}/{totalQuestions} answered</p>
            <div className="w-32 h-2 bg-muted rounded-full mt-1">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(totalAnswered / totalQuestions) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Sections */}
      {defaultPillars.map((pillar, pillarIdx) => {
        const questions = pillarQuestions[pillar] ?? [];
        const progress = pillarProgress[pillar];
        const isExpanded = expandedPillar === pillar;

        return (
          <div key={pillar} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedPillar(isExpanded ? null : pillar)}
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">{pillarIdx + 1}</span>
                <span className="font-semibold text-card-foreground">{pillar}</span>
                <span className="text-xs text-muted-foreground">({progress?.answered ?? 0}/{progress?.total ?? 0})</span>
                {progress?.avg > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(progress.avg)}`}>
                    Avg: {progress.avg.toFixed(1)}
                  </span>
                )}
              </div>
              {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
                {questions.map((q, qi) => (
                  <div key={q.id} className="space-y-3 p-4 bg-muted/20 rounded-lg border border-border/50">
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                        {qi + 1}
                      </span>
                      <p className="text-sm font-medium text-card-foreground">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-semibold text-red-700 mb-1">Low Maturity (1)</p>
                        <p className="text-red-600">{q.lowMaturity}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="font-semibold text-green-700 mb-1">High Maturity / North Star (5)</p>
                        <p className="text-green-600">{q.highMaturity}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                      <p className="font-semibold text-blue-700 mb-1">Observable Metrics</p>
                      <p className="text-blue-600">{q.observableMetrics}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-card-foreground">Score:</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(score => (
                          <button
                            key={score}
                            className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all ${
                              answers[q.id]?.score === score
                                ? 'bg-primary text-primary-foreground border-primary scale-110'
                                : 'bg-card text-card-foreground border-border hover:border-primary/50'
                            }`}
                            onClick={() => setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], score } }))}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      {answers[q.id]?.score > 0 && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    <Textarea
                      placeholder="Add comments or evidence..."
                      value={answers[q.id]?.comments ?? ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: { ...prev[q.id], comments: e.target.value } }))}
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => handleSubmit('draft')} className="gap-2">
          <Save className="w-4 h-4" /> Save Draft
        </Button>
        <Button onClick={() => handleSubmit('submitted')} className="gap-2" disabled={!isComplete}>
          <Send className="w-4 h-4" /> Submit Assessment
        </Button>
      </div>
    </div>
  );
};

export default AssessmentSubmit;
