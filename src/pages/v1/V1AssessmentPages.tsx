import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Assessment, AssessmentQuestion } from '@/data/assessmentQuestions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock, FileSearch, Settings2, MessageSquare, Send } from 'lucide-react';
import AdminAssessmentQuestions from '@/components/AdminAssessmentQuestions';

/* ─── Tab-wise Assessment Form (shared by Create + Self-Assess) ─── */

interface AssessmentFormProps {
  platform: string;
  assessmentName: string;
  assessmentQuarter: string;
  existingAssessment?: Assessment;
  onSubmit: (assessment: Assessment) => void;
  mode: 'create' | 'self-assess';
}

/* Dimension metric types used by questions */

const AssessmentForm: React.FC<AssessmentFormProps> = ({ platform, assessmentName, assessmentQuarter, existingAssessment, onSubmit, mode }) => {
  const { assessmentQuestions: allQuestions, publishedQuestions } = useAppState();
  // Admin sees all draft questions; users see only published
  const assessmentQuestions = mode === 'create' ? allQuestions : publishedQuestions;
  const { toast } = useToast();
  const [tabView, setTabView] = useState<'pillar' | 'dimension'>('pillar');

  const initAnswers = () => {
    const map: Record<string, { score: number; comments: string }> = {};
    assessmentQuestions.forEach(q => {
      const existing = existingAssessment?.answers.find(a => a.questionId === q.id);
      map[q.id] = existing ? { score: existing.score, comments: existing.comments } : { score: 0, comments: '' };
    });
    return map;
  };

  const [answers, setAnswers] = useState(initAnswers);

  const questionsByPillar = useMemo(() => {
    const map: Record<string, AssessmentQuestion[]> = {};
    assessmentQuestions.forEach(q => {
      (map[q.pillar] ??= []).push(q);
    });
    return map;
  }, [assessmentQuestions]);

  const questionsByDimension = useMemo(() => {
    const map: Record<string, AssessmentQuestion[]> = {};
    assessmentQuestions.forEach(q => {
      (map[q.dimensionMetric] ??= []).push(q);
    });
    return map;
  }, [assessmentQuestions]);

  const setScore = (qId: string, score: number) =>
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], score } }));

  const setComment = (qId: string, comments: string) =>
    setAnswers(prev => ({ ...prev, [qId]: { ...prev[qId], comments } }));

  const answered = Object.values(answers).filter(a => a.score > 0).length;
  const total = assessmentQuestions.length;
  const allDone = answered === total;

  const handleSubmit = (status: 'draft' | 'submitted') => {
    if (status === 'submitted' && !allDone) {
      toast({ title: 'Incomplete', description: 'Answer all questions before submitting.', variant: 'destructive' });
      return;
    }
    const assessment: Assessment = {
      id: existingAssessment?.id || `${platform}-${assessmentQuarter}-${Date.now()}`,
      name: existingAssessment?.name || assessmentName,
      platform,
      quarter: assessmentQuarter,
      submittedBy: mode === 'create' ? 'Admin' : platform,
      submittedAt: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewedAt: null,
      status,
      answers: assessmentQuestions.map(q => ({ questionId: q.id, score: answers[q.id]?.score || 0, comments: answers[q.id]?.comments || '' })),
    };
    onSubmit(assessment);
    toast({ title: status === 'draft' ? 'Draft Saved' : 'Assessment Submitted' });
  };

  const getScoreColor = (s: number) =>
    s >= 4 ? 'bg-accent/60 text-accent-foreground border-accent' : s >= 3 ? 'bg-muted text-muted-foreground border-border' : s >= 1 ? 'bg-destructive/10 text-destructive border-destructive/30' : 'bg-muted text-muted-foreground';

  const renderQuestions = (questions: AssessmentQuestion[]) => (
    <div className="space-y-4">
      {questions.map(q => (
        <Card key={q.id} className="border-border/60">
          <CardContent className="p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">{q.question}</p>
              <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground">
                <span>1 = {q.lowMaturity}</span>
                <span>5 = {q.highMaturity}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onClick={() => setScore(q.id, s)}
                  className={`w-9 h-9 rounded-lg border text-sm font-semibold transition-all ${
                    answers[q.id]?.score === s ? getScoreColor(s) + ' ring-2 ring-primary/30' : 'bg-card border-border hover:border-primary/40'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Comments / evidence..."
              value={answers[q.id]?.comments || ''}
              onChange={e => setComment(q.id, e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const pillarKeys = Object.keys(questionsByPillar);
  const dimensionKeys = Object.keys(questionsByDimension);

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {mode === 'create' ? 'Create Assessment' : 'Self Assessment'} — {platform}
          </h3>
          <p className="text-xs text-muted-foreground">{answered}/{total} answered · {selectedQuarter}</p>
        </div>
        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>
      </div>

      {/* Tab view toggle */}
      <div className="flex gap-2">
        <Button variant={tabView === 'pillar' ? 'default' : 'outline'} size="sm" onClick={() => setTabView('pillar')}>By Pillar</Button>
        <Button variant={tabView === 'dimension' ? 'default' : 'outline'} size="sm" onClick={() => setTabView('dimension')}>By Dimension</Button>
      </div>

      {/* Tabs */}
      {tabView === 'pillar' ? (
        <Tabs defaultValue={pillarKeys[0]} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            {pillarKeys.map(p => {
              const qs = questionsByPillar[p];
              const done = qs.filter(q => answers[q.id]?.score > 0).length;
              return (
                <TabsTrigger key={p} value={p} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-1.5">
                  {p} <Badge variant="secondary" className="ml-1.5 text-[10px]">{done}/{qs.length}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {pillarKeys.map(p => (
            <TabsContent key={p} value={p}>{renderQuestions(questionsByPillar[p])}</TabsContent>
          ))}
        </Tabs>
      ) : (
        <Tabs defaultValue={dimensionKeys[0]} className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
            {dimensionKeys.map(d => {
              const qs = questionsByDimension[d];
              const done = qs.filter(q => answers[q.id]?.score > 0).length;
              return (
                <TabsTrigger key={d} value={d} className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-3 py-1.5">
                  {d} <Badge variant="secondary" className="ml-1.5 text-[10px]">{done}/{qs.length}</Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>
          {dimensionKeys.map(d => (
            <TabsContent key={d} value={d}>{renderQuestions(questionsByDimension[d])}</TabsContent>
          ))}
        </Tabs>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => handleSubmit('draft')}>Save Draft</Button>
        <Button onClick={() => handleSubmit('submitted')} disabled={!allDone}>Submit Assessment</Button>
      </div>
    </div>
  );
};

/* ─── Admin: Create Assessment (picks platform) ─── */

export const V1CreateAssessmentPage: React.FC = () => {
  const { user, assessments, setAssessments, platforms, selectedQuarter } = useAppState();
  const [selectedPlatform, setSelectedPlatform] = useState('');

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  const existing = selectedPlatform ? assessments.find(a => a.platform === selectedPlatform && a.quarter === selectedQuarter) : undefined;

  const handleSubmit = (assessment: Assessment) => {
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === assessment.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = assessment; return u; }
      return [...prev, assessment];
    });
  };

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      {selectedPlatform === '__manage__' ? (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlatform('')} className="mb-2 text-xs">← Back to platforms</Button>
          <AdminAssessmentQuestions />
        </div>
      ) : !selectedPlatform ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Create Assessment</h3>
          <p className="text-sm text-muted-foreground">Select a platform to create or edit its assessment for {selectedQuarter}.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Common for All Platforms */}
            <button onClick={() => setSelectedPlatform('__manage__')}
              className="p-4 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all text-left col-span-2 md:col-span-4">
              <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" /> Common for All Platforms
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">Manage questionnaire — add, edit, delete, upload &amp; publish questions</p>
            </button>
            {platforms.map(p => {
              const exists = assessments.some(a => a.platform === p && a.quarter === selectedQuarter);
              return (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all text-left">
                  <p className="font-semibold text-sm text-foreground">{p}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                    {exists ? <><CheckCircle2 className="w-3 h-3 text-primary" /> Exists</> : <><Clock className="w-3 h-3" /> Not created</>}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <Button variant="ghost" size="sm" onClick={() => setSelectedPlatform('')} className="mb-2 text-xs">← Back to platforms</Button>
          <AssessmentForm platform={selectedPlatform} existingAssessment={existing} onSubmit={handleSubmit} mode="create" />
        </div>
      )}
    </div>
  );
};

/* ─── User: Self Assessment ─── */

export const V1SelfAssessmentPage: React.FC = () => {
  const { user, assessments, setAssessments, selectedQuarter, publishedQuestions } = useAppState();

  if (user?.role !== 'user' || !user.platformId) return <p className="text-muted-foreground">Only Users can self-assess.</p>;
  if (publishedQuestions.length === 0) return <p className="text-muted-foreground">No questionnaire has been published yet. Please wait for the Admin to publish.</p>;

  const existing = assessments.find(a => a.platform === user.platformId && a.quarter === selectedQuarter);

  const handleSubmit = (assessment: Assessment) => {
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === assessment.id);
      if (idx >= 0) { const u = [...prev]; u[idx] = assessment; return u; }
      return [...prev, assessment];
    });
  };

  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <AssessmentForm platform={user.platformId} existingAssessment={existing} onSubmit={handleSubmit} mode="self-assess" />
    </div>
  );
};

/* ─── Peer Review (with per-question commenting) ─── */

export const V1PeerReviewPage: React.FC = () => {
  const { user, assessments, setAssessments, publishedQuestions: assessmentQuestions, selectedQuarter } = useAppState();
  const { toast } = useToast();
  const [reviewComments, setReviewComments] = useState<Record<string, Record<string, string>>>({});
  const [overallComments, setOverallComments] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (user?.role !== 'reviewer') return <p className="text-muted-foreground">Peer Reviewers only.</p>;

  const submitted = assessments.filter(a => a.quarter === selectedQuarter && (a.status === 'submitted' || a.status === 'reviewed'));

  const setQuestionComment = (assessmentId: string, questionId: string, comment: string) => {
    setReviewComments(prev => ({
      ...prev,
      [assessmentId]: { ...(prev[assessmentId] || {}), [questionId]: comment },
    }));
  };

  const handleSubmitReview = (id: string) => {
    const comments = reviewComments[id] || {};
    const overall = overallComments[id] || '';
    setAssessments(prev => prev.map(a =>
      a.id === id ? {
        ...a,
        reviewedBy: 'Reviewer',
        reviewedAt: new Date().toISOString().split('T')[0],
        status: 'reviewed' as const,
        reviewerComments: { ...(a.reviewerComments || {}), ...comments },
        reviewerOverallComment: overall || a.reviewerOverallComment,
      } : a
    ));
    toast({ title: 'Review Submitted', description: `Assessment reviewed with ${Object.keys(comments).length} comment(s).` });
  };

  if (submitted.length === 0) {
    return (
      <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <h3 className="text-lg font-bold text-foreground">Review Assessments</h3>
        <Card>
          <CardContent className="p-8 text-center">
            <FileSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No submitted assessments to review for {selectedQuarter}.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <h3 className="text-lg font-bold text-foreground">Review Assessments</h3>
      <p className="text-sm text-muted-foreground">Review and add comments to submitted assessments for {selectedQuarter}.</p>
      {submitted.map(a => {
        const avgScore = a.answers.length > 0
          ? (a.answers.reduce((s, ans) => s + ans.score, 0) / a.answers.length).toFixed(1)
          : '—';
        const isExpanded = expandedId === a.id;
        const currentComments = reviewComments[a.id] || {};
        const existingComments = a.reviewerComments || {};
        const commentCount = Object.keys({ ...existingComments, ...currentComments }).filter(k => (currentComments[k] || existingComments[k] || '').trim()).length;

        return (
          <Card key={a.id} className={isExpanded ? 'ring-1 ring-primary/30' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {a.platform}
                  <Badge variant={a.status === 'reviewed' ? 'default' : 'secondary'}>
                    {a.status === 'reviewed' ? 'Reviewed' : 'Pending Review'}
                  </Badge>
                  {commentCount > 0 && (
                    <Badge variant="outline" className="text-[10px] gap-1">
                      <MessageSquare className="w-2.5 h-2.5" /> {commentCount}
                    </Badge>
                  )}
                </span>
                <span className="text-xs text-muted-foreground">Avg: {avgScore}/5</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Submitted: {a.submittedAt}</span>
                {a.reviewedAt && <span>Reviewed: {a.reviewedAt}</span>}
                {a.reviewedBy && <span>By: {a.reviewedBy}</span>}
              </div>

              <Button
                variant={isExpanded ? 'secondary' : 'outline'}
                size="sm"
                className="text-xs"
                onClick={() => setExpandedId(isExpanded ? null : a.id)}
              >
                <FileSearch className="w-3.5 h-3.5 mr-1" />
                {isExpanded ? 'Collapse' : 'Review & Comment'} ({a.answers.filter(ans => ans.score > 0).length}/{assessmentQuestions.length})
              </Button>

              {isExpanded && (
                <div className="space-y-3 mt-2">
                  {assessmentQuestions.map((q, idx) => {
                    const ans = a.answers.find(an => an.questionId === q.id);
                    const existingComment = existingComments[q.id] || '';
                    const currentComment = currentComments[q.id] ?? existingComment;

                    return (
                      <div key={q.id} className="p-3 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-medium text-foreground">
                            <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                            {q.question}
                          </p>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {ans?.score || '—'}/5
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {q.dimensionMetric} → {q.subMetric}
                        </p>
                        {ans?.comments && (
                          <p className="text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                            User comment: "{ans.comments}"
                          </p>
                        )}
                        <Textarea
                          placeholder="Add reviewer comment..."
                          value={currentComment}
                          onChange={e => setQuestionComment(a.id, q.id, e.target.value)}
                          className="text-xs min-h-[50px] bg-background"
                        />
                      </div>
                    );
                  })}

                  {/* Overall comment */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" /> Overall Review Comment
                    </p>
                    <Textarea
                      placeholder="Add an overall comment for this assessment..."
                      value={overallComments[a.id] ?? (a.reviewerOverallComment || '')}
                      onChange={e => setOverallComments(prev => ({ ...prev, [a.id]: e.target.value }))}
                      className="text-xs min-h-[60px] bg-background"
                    />
                  </div>

                  <Button onClick={() => handleSubmitReview(a.id)} className="gap-1">
                    <Send className="w-3.5 h-3.5" /> Submit Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

/* ─── View All Assessments ─── */

export const V1ViewAssessmentsPage: React.FC = () => {
  const { assessments, selectedQuarter, publishedQuestions: assessmentQuestions } = useAppState();
  const filtered = assessments.filter(a => a.quarter === selectedQuarter);

  if (filtered.length === 0) return <p className="text-muted-foreground text-sm">No assessments for {selectedQuarter}.</p>;

  return (
    <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <h3 className="text-lg font-bold text-foreground">All Assessments — {selectedQuarter}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map(a => {
          const avg = a.answers.length > 0
            ? (a.answers.reduce((s, ans) => s + ans.score, 0) / a.answers.length).toFixed(1)
            : '—';
          return (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-foreground">{a.platform}</p>
                  <Badge variant={a.status === 'reviewed' ? 'default' : a.status === 'submitted' ? 'secondary' : 'outline'}>
                    {a.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <p>Avg Score: {avg}/5 · Answered: {a.answers.filter(an => an.score > 0).length}/{assessmentQuestions.length}</p>
                  <p>Submitted: {a.submittedAt} {a.reviewedBy && `· Reviewed by ${a.reviewedBy}`}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
