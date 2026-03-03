import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { Assessment, AssessmentQuestion } from '@/data/assessmentQuestions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Clock, FileSearch, Settings2, MessageSquare, Send, Plus, ChevronDown, ChevronRight, Pencil, Save, X } from 'lucide-react';
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
  // Filter to only questions selected for this assessment (via questionIds), falling back to all
  const baseQuestions = mode === 'create' ? allQuestions : publishedQuestions;
  const assessmentQuestions = existingAssessment?.questionIds?.length
    ? baseQuestions.filter(q => existingAssessment.questionIds!.includes(q.id))
    : baseQuestions;
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
            {assessmentName || (mode === 'create' ? 'Create Assessment' : 'Self Assessment')} — {platform}
          </h3>
          <p className="text-xs text-muted-foreground">{answered}/{total} questions answered · {assessmentQuarter}</p>
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

/* ─── Admin: Create Assessment (stepped flow) ─── */

export const V1CreateAssessmentPage: React.FC = () => {
  const { user, assessments, setAssessments, platforms, availableQuarters, assessmentQuestions, setAssessmentQuestions, pillars } = useAppState();
  const { toast } = useToast();

  // Step: 'details' → 'questions' → 'platforms'
  const [step, setStep] = useState<'details' | 'questions' | 'platforms'>('details');
  const [assessmentName, setAssessmentName] = useState('');
  const [assessmentQuarter, setAssessmentQuarter] = useState(availableQuarters[0] || 'Q4 2025');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AssessmentQuestion>>({});
  const [showInlineAdd, setShowInlineAdd] = useState<string | null>(null); // pillar name
  const [newQ, setNewQ] = useState({ question: '', lowMaturity: '', highMaturity: '' });

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  const questionsByPillar = pillars.map(pillar => ({
    pillar,
    questions: assessmentQuestions.filter(q => q.pillar === pillar),
  }));

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAllInPillar = (questions: AssessmentQuestion[]) => {
    const ids = questions.map(q => q.id);
    const allSelected = ids.every(id => selectedQuestionIds.has(id));
    setSelectedQuestionIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => allSelected ? next.delete(id) : next.add(id));
      return next;
    });
  };

  const selectAll = () => {
    setSelectedQuestionIds(new Set(assessmentQuestions.map(q => q.id)));
  };

  const deselectAll = () => {
    setSelectedQuestionIds(new Set());
  };

  const handleStartEdit = (q: AssessmentQuestion) => {
    setEditingId(q.id);
    setEditData({ question: q.question, lowMaturity: q.lowMaturity, highMaturity: q.highMaturity });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    setAssessmentQuestions(prev =>
      prev.map(q => q.id === editingId ? { ...q, ...editData } as AssessmentQuestion : q)
    );
    setEditingId(null);
    setEditData({});
  };

  const handleAddQuestion = (pillar: string) => {
    if (!newQ.question.trim()) return;
    const prefix = pillar.slice(0, 2).toLowerCase();
    const id = `${prefix}-new-${Date.now()}`;
    const question: AssessmentQuestion = {
      id,
      pillar,
      question: newQ.question,
      lowMaturity: newQ.lowMaturity,
      highMaturity: newQ.highMaturity,
      observableMetrics: '',
      dimensionMetric: 'Maturity',
      subMetric: 'Culture',
    };
    setAssessmentQuestions(prev => [...prev, question]);
    setSelectedQuestionIds(prev => new Set(prev).add(id));
    setNewQ({ question: '', lowMaturity: '', highMaturity: '' });
    setShowInlineAdd(null);
  };

  const handlePublishAssessment = (platform: string) => {
    const id = `${platform}-${assessmentQuarter}-${Date.now()}`;
    const assessment: Assessment = {
      id,
      name: assessmentName,
      platform,
      quarter: assessmentQuarter,
      submittedBy: 'Admin',
      submittedAt: new Date().toISOString().split('T')[0],
      reviewedBy: null,
      reviewedAt: null,
      status: 'draft',
      questionIds: Array.from(selectedQuestionIds),
      answers: [],
    };
    setAssessments(prev => [...prev, assessment]);
    toast({ title: 'Assessment Created', description: `"${assessmentName}" created for ${platform} with ${selectedQuestionIds.size} questions.` });
  };

  const handlePublishAll = () => {
    platforms.forEach(p => {
      const exists = assessments.some(a => a.name === assessmentName && a.platform === p && a.quarter === assessmentQuarter);
      if (!exists) handlePublishAssessment(p);
    });
    setStep('details');
    setAssessmentName('');
    setSelectedQuestionIds(new Set());
  };

  // ── Step 1: Details ──
  if (step === 'details') {
    return (
      <div className="space-y-6 animate-fade-in max-w-2xl" style={{ animationFillMode: 'forwards' }}>
        <div>
          <h3 className="text-lg font-bold text-foreground">Create Assessment</h3>
          <p className="text-sm text-muted-foreground">Name the assessment and select a quarter, then add questions.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Assessment Name</label>
            <Input
              value={assessmentName}
              onChange={e => setAssessmentName(e.target.value)}
              placeholder="e.g. Q4 2025 Maturity Assessment"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Quarter</label>
            <select
              value={assessmentQuarter}
              onChange={e => setAssessmentQuarter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {availableQuarters.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        </div>

        <Button
          onClick={() => { selectAll(); setStep('questions'); }}
          disabled={!assessmentName.trim()}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Questions
        </Button>
        {!assessmentName.trim() && (
          <p className="text-xs text-muted-foreground italic">Enter an assessment name to continue.</p>
        )}
      </div>
    );
  }

  // ── Step 2: Question Picker ──
  if (step === 'questions') {
    return (
      <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setStep('details')} className="mb-1 text-xs">← Back</Button>
            <h3 className="text-lg font-bold text-foreground">{assessmentName}</h3>
            <p className="text-sm text-muted-foreground">
              Select questions for this assessment · <span className="font-medium text-primary">{selectedQuestionIds.size}/{assessmentQuestions.length} selected</span> · {assessmentQuarter}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
            <Button size="sm" variant="outline" onClick={deselectAll}>Deselect All</Button>
            <Button size="sm" onClick={() => setStep('platforms')} disabled={selectedQuestionIds.size === 0}>
              Next: Assign Platforms →
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {questionsByPillar.map(({ pillar, questions }) => {
            const isExpanded = expandedPillar === pillar;
            const selectedInPillar = questions.filter(q => selectedQuestionIds.has(q.id)).length;
            const allInPillarSelected = questions.length > 0 && selectedInPillar === questions.length;

            return (
              <div key={pillar} className="border border-border/50 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 p-3 hover:bg-muted/30 transition-colors">
                  <Checkbox
                    checked={allInPillarSelected}
                    onCheckedChange={() => toggleAllInPillar(questions)}
                    className="shrink-0"
                  />
                  <button
                    className="flex-1 flex items-center justify-between text-left"
                    onClick={() => setExpandedPillar(isExpanded ? null : pillar)}
                  >
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {pillar}
                    </span>
                    <Badge variant="secondary" className="text-[10px]">
                      {selectedInPillar}/{questions.length} selected
                    </Badge>
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-border/30 divide-y divide-border/20">
                    {questions.map((q, idx) => (
                      <div key={q.id} className="p-3 hover:bg-muted/10 transition-colors">
                        {editingId === q.id ? (
                          <div className="space-y-2 ml-6">
                            <Textarea
                              value={editData.question || ''}
                              onChange={e => setEditData(d => ({ ...d, question: e.target.value }))}
                              placeholder="Question"
                              className="min-h-[60px] text-sm"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <Textarea
                                value={editData.lowMaturity || ''}
                                onChange={e => setEditData(d => ({ ...d, lowMaturity: e.target.value }))}
                                placeholder="Low maturity (score 1)"
                                className="min-h-[50px] text-xs"
                              />
                              <Textarea
                                value={editData.highMaturity || ''}
                                onChange={e => setEditData(d => ({ ...d, highMaturity: e.target.value }))}
                                placeholder="High maturity (score 5)"
                                className="min-h-[50px] text-xs"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={handleSaveEdit}><Save className="w-3 h-3 mr-1" /> Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-3 h-3 mr-1" /> Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedQuestionIds.has(q.id)}
                              onCheckedChange={() => toggleQuestion(q.id)}
                              className="mt-0.5 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground">
                                <span className="text-muted-foreground mr-1 font-medium">{idx + 1}.</span>
                                {q.question}
                              </p>
                              <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground">
                                <span>1 = {q.lowMaturity?.slice(0, 60)}…</span>
                                <span>5 = {q.highMaturity?.slice(0, 60)}…</span>
                              </div>
                              <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">
                                {q.dimensionMetric} → {q.subMetric}
                              </span>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => handleStartEdit(q)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Inline add question */}
                    {showInlineAdd === pillar ? (
                      <div className="p-3 space-y-2 bg-muted/20">
                        <Textarea
                          value={newQ.question}
                          onChange={e => setNewQ(q => ({ ...q, question: e.target.value }))}
                          placeholder="New question text *"
                          className="min-h-[50px] text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Textarea
                            value={newQ.lowMaturity}
                            onChange={e => setNewQ(q => ({ ...q, lowMaturity: e.target.value }))}
                            placeholder="Low maturity (score 1)"
                            className="min-h-[40px] text-xs"
                          />
                          <Textarea
                            value={newQ.highMaturity}
                            onChange={e => setNewQ(q => ({ ...q, highMaturity: e.target.value }))}
                            placeholder="High maturity (score 5)"
                            className="min-h-[40px] text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAddQuestion(pillar)} disabled={!newQ.question.trim()}>
                            <Plus className="w-3 h-3 mr-1" /> Add
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowInlineAdd(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowInlineAdd(pillar)}
                        className="w-full p-2.5 text-xs text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add question to {pillar}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={() => setStep('details')}>← Back</Button>
          <Button onClick={() => setStep('platforms')} disabled={selectedQuestionIds.size === 0}>
            Next: Assign Platforms ({selectedQuestionIds.size} questions) →
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 3: Platform Assignment & Publish ──
  return (
    <div className="space-y-4 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <Button variant="ghost" size="sm" onClick={() => setStep('questions')} className="mb-1 text-xs">← Back to Questions</Button>
      <div>
        <h3 className="text-lg font-bold text-foreground">{assessmentName}</h3>
        <p className="text-sm text-muted-foreground">{selectedQuestionIds.size} questions selected · {assessmentQuarter}</p>
      </div>

      <p className="text-sm text-muted-foreground">Select platforms to publish this assessment to, or publish to all.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {platforms.map(p => {
          const exists = assessments.some(a => a.name === assessmentName && a.platform === p && a.quarter === assessmentQuarter);
          return (
            <div key={p} className="p-4 rounded-xl border border-border bg-card text-left space-y-2">
              <p className="font-semibold text-sm text-foreground">{p}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                {exists ? <><CheckCircle2 className="w-3 h-3 text-primary" /> Created</> : <><Clock className="w-3 h-3" /> Not created</>}
              </p>
              {!exists && (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handlePublishAssessment(p)}>
                  Create for {p}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={() => setStep('questions')}>← Back</Button>
        <Button onClick={handlePublishAll}>
          <Send className="w-4 h-4 mr-2" /> Save & Publish to All Platforms
        </Button>
      </div>
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
      <AssessmentForm
        platform={user.platformId}
        assessmentName={existing?.name || 'Self Assessment'}
        assessmentQuarter={selectedQuarter}
        existingAssessment={existing}
        onSubmit={handleSubmit}
        mode="self-assess"
      />
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
                  <span className="font-bold">{a.name || a.platform}</span>
                  <Badge variant="outline" className="text-[10px]">{a.platform}</Badge>
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
                <span>Quarter: {a.quarter}</span>
                <span>Submitted: {a.submittedAt}</span>
                <span>{a.answers.length} questions</span>
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
                {isExpanded ? 'Collapse' : `Review & Comment (${a.answers.length} questions)`}
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
  const { assessments, availableQuarters, publishedQuestions: allQuestions } = useAppState();
  const [filterQuarter, setFilterQuarter] = useState(availableQuarters[0] || 'Q4 2025');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'submitted' | 'reviewed'>('all');

  const filtered = assessments.filter(a => {
    if (a.quarter !== filterQuarter) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  // Group by assessment name
  const grouped = useMemo(() => {
    const map: Record<string, Assessment[]> = {};
    filtered.forEach(a => {
      const key = a.name || 'Untitled';
      (map[key] ??= []).push(a);
    });
    return Object.entries(map);
  }, [filtered]);

  const statusColor = (s: string) =>
    s === 'reviewed' ? 'default' : s === 'submitted' ? 'secondary' : 'outline';

  return (
    <div className="space-y-5 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-lg font-bold text-foreground">Assessments</h3>
        <div className="flex gap-2">
          <select
            value={filterQuarter}
            onChange={e => setFilterQuarter(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {availableQuarters.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as any)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </div>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileSearch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No assessments found for {filterQuarter}.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([name, items]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{name}</CardTitle>
                <Badge variant="outline" className="text-[10px]">{items[0].quarter} · {items.length} platform{items.length > 1 ? 's' : ''}</Badge>
              </div>
              {items[0].questionIds && (
                <p className="text-[11px] text-muted-foreground">{items[0].questionIds.length} questions in this assessment</p>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(a => {
                  const totalQ = a.questionIds?.length || allQuestions.length;
                  const answeredCount = a.answers.filter(an => an.score > 0).length;
                  const avg = answeredCount > 0
                    ? (a.answers.filter(an => an.score > 0).reduce((s, an) => s + an.score, 0) / answeredCount).toFixed(1)
                    : '—';

                  return (
                    <div key={a.id} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">{a.platform}</p>
                        <Badge variant={statusColor(a.status) as any} className="text-[10px] capitalize">{a.status}</Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        {answeredCount > 0 ? (
                          <p>Avg Score: {avg}/5 · {answeredCount}/{totalQ} answered</p>
                        ) : (
                          <p>Not yet started · {totalQ} questions</p>
                        )}
                        <p>Created: {a.submittedAt}{a.reviewedBy ? ` · Reviewed by ${a.reviewedBy}` : ''}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
