import React, { useState, useRef } from 'react';
import { useAppState } from '@/context/AppContext';
import { AssessmentQuestion, DimensionMetric } from '@/data/assessmentQuestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Save, X, Upload, Send } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const AdminAssessmentQuestions: React.FC = () => {
  const { assessmentQuestions, setAssessmentQuestions, pillars, publishQuestions, isQuestionsPublished } = useAppState();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<Partial<AssessmentQuestion>>({
    pillar: '',
    question: '',
    lowMaturity: '',
    highMaturity: '',
    observableMetrics: '',
    dimensionMetric: undefined,
    subMetric: '',
  });

  const questionsByPillar = pillars.map(pillar => ({
    pillar,
    questions: assessmentQuestions.filter(q => q.pillar === pillar),
  }));

  const resetForm = () => {
    setFormData({ pillar: '', question: '', lowMaturity: '', highMaturity: '', observableMetrics: '', dimensionMetric: undefined, subMetric: '' });
    setShowAddForm(false);
    setEditingId(null);
  };

  const generateId = (pillar: string) => {
    const prefix = pillar.slice(0, 2).toLowerCase();
    const existing = assessmentQuestions.filter(q => q.id.startsWith(prefix));
    return `${prefix}-${existing.length + 1}`;
  };

  const handleAdd = () => {
    if (!formData.pillar || !formData.question || !formData.dimensionMetric || !formData.subMetric) return;
    const newQuestion: AssessmentQuestion = {
      id: generateId(formData.pillar),
      pillar: formData.pillar,
      question: formData.question || '',
      lowMaturity: formData.lowMaturity || '',
      highMaturity: formData.highMaturity || '',
      observableMetrics: formData.observableMetrics || '',
      dimensionMetric: formData.dimensionMetric,
      subMetric: formData.subMetric,
    };
    setAssessmentQuestions(prev => [...prev, newQuestion]);
    resetForm();
  };

  const handleEdit = (q: AssessmentQuestion) => {
    setEditingId(q.id);
    setFormData({ ...q });
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    if (!editingId || !formData.question) return;
    setAssessmentQuestions(prev =>
      prev.map(q => q.id === editingId ? { ...q, ...formData } as AssessmentQuestion : q)
    );
    resetForm();
  };

  const handleDelete = (id: string) => {
    setAssessmentQuestions(prev => prev.filter(q => q.id !== id));
  };

  const dimensionMetrics = ['Maturity', 'Performance', 'Stability', 'Agility'] as const;
  const validDimensionMetrics: string[] = [...dimensionMetrics];

  const subMetricOptions: Record<string, string[]> = {
    'Maturity': ['Clarity', 'Leadership', 'Culture', 'Foundation'],
    'Performance': ['Throughput', 'Predictability', 'Change Fail Rate', 'Deployment Frequency', 'Mean Time to Deploy', 'Lead Time'],
    'Stability': ['Attrition Rate', 'Tenure', 'Role Clarity', 'Succession Plan'],
    'Agility': ['Adaptability', 'Innovation', 'Time to Market', 'Responsiveness', 'Continuous Improvement'],
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);
        const newQuestions: AssessmentQuestion[] = [];
        let skipped = 0;
        rows.forEach((row, i) => {
          const pillar = (row['Pillar'] || '').trim();
          const question = (row['Question'] || '').trim();
          const dim = (row['Dimension Metric'] || '').trim();
          const sub = (row['Sub-Metric'] || row['Sub Metric'] || '').trim();
          if (!pillar || !question || !dim || !sub) { skipped++; return; }
          if (!validDimensionMetrics.includes(dim)) { skipped++; return; }
          const prefix = pillar.slice(0, 2).toLowerCase();
          const id = `${prefix}-upload-${Date.now()}-${i}`;
          newQuestions.push({
            id,
            pillar,
            question,
            lowMaturity: (row['Low Maturity'] || '').trim(),
            highMaturity: (row['High Maturity'] || '').trim(),
            observableMetrics: (row['Observable Metrics'] || '').trim(),
            dimensionMetric: dim as DimensionMetric,
            subMetric: sub,
          });
        });
        if (newQuestions.length > 0) {
          setAssessmentQuestions(prev => [...prev, ...newQuestions]);
          toast.success(`Added ${newQuestions.length} questions${skipped > 0 ? ` (${skipped} skipped)` : ''}`);
        } else {
          toast.error('No valid questions found. Required columns: Pillar, Question, Dimension Metric, Sub-Metric');
        }
      } catch {
        toast.error('Failed to parse Excel file');
      }
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  const handlePublish = () => {
    publishQuestions();
    toast.success(`Published ${assessmentQuestions.length} questions. Users can now self-assess.`);
  };

  const renderForm = (onSave: () => void, saveLabel: string) => (
    <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border" role="form" aria-label={saveLabel === 'Add Question' ? 'Add new question form' : 'Edit question form'}>
      <Select value={formData.pillar} onValueChange={v => setFormData(f => ({ ...f, pillar: v }))}>
        <SelectTrigger aria-label="Select pillar">
          <SelectValue placeholder="Select Pillar" />
        </SelectTrigger>
        <SelectContent>
          {pillars.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
        </SelectContent>
      </Select>
      <div className="grid grid-cols-2 gap-3">
        <Select value={formData.dimensionMetric || ''} onValueChange={v => setFormData(f => ({ ...f, dimensionMetric: v as any, subMetric: '' }))}>
          <SelectTrigger aria-label="Select dimension metric">
            <SelectValue placeholder="Dimension Metric" />
          </SelectTrigger>
          <SelectContent>
            {dimensionMetrics.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={formData.subMetric || ''} onValueChange={v => setFormData(f => ({ ...f, subMetric: v }))} disabled={!formData.dimensionMetric}>
          <SelectTrigger aria-label="Select sub-metric">
            <SelectValue placeholder="Sub-Metric" />
          </SelectTrigger>
          <SelectContent>
            {(subMetricOptions[formData.dimensionMetric || ''] || []).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        placeholder="Question *"
        value={formData.question || ''}
        onChange={e => setFormData(f => ({ ...f, question: e.target.value }))}
        className="min-h-[60px]"
        aria-label="Assessment question"
      />
      <Textarea
        placeholder="Low maturity description"
        value={formData.lowMaturity || ''}
        onChange={e => setFormData(f => ({ ...f, lowMaturity: e.target.value }))}
        className="min-h-[50px]"
        aria-label="Low maturity description"
      />
      <Textarea
        placeholder="High maturity description"
        value={formData.highMaturity || ''}
        onChange={e => setFormData(f => ({ ...f, highMaturity: e.target.value }))}
        className="min-h-[50px]"
        aria-label="High maturity description"
      />
      <Textarea
        placeholder="Observable metrics"
        value={formData.observableMetrics || ''}
        onChange={e => setFormData(f => ({ ...f, observableMetrics: e.target.value }))}
        className="min-h-[50px]"
        aria-label="Observable metrics"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} disabled={!formData.pillar || !formData.question || !formData.dimensionMetric || !formData.subMetric}>
          <Save className="w-4 h-4 mr-1" /> {saveLabel}
        </Button>
        <Button size="sm" variant="outline" onClick={resetForm}>
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-4" role="region" aria-label="Assessment questions management">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
            Assessment Questions
            {isQuestionsPublished ? (
              <Badge variant="default" className="text-[10px]">Published</Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] border-yellow-400 text-yellow-700 bg-yellow-50">Draft — unpublished changes</Badge>
            )}
          </h3>
          <p className="text-xs text-muted-foreground">{assessmentQuestions.length} questions across {pillars.length} pillars</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
          <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} aria-label="Upload questions from Excel">
            <Upload className="w-4 h-4 mr-1" /> Upload Excel
          </Button>
          <Button size="sm" onClick={() => { setShowAddForm(true); setEditingId(null); }} aria-label="Add new question">
            <Plus className="w-4 h-4 mr-1" /> Add Question
          </Button>
          <Button size="sm" variant={isQuestionsPublished ? 'outline' : 'default'} onClick={handlePublish} disabled={isQuestionsPublished} aria-label="Publish questions">
            <Send className="w-4 h-4 mr-1" /> Publish
          </Button>
        </div>
      </div>

      {showAddForm && renderForm(handleAdd, 'Add Question')}

      <div className="space-y-2">
        {questionsByPillar.map(({ pillar, questions }) => (
          <div key={pillar} className="border border-border/50 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
              onClick={() => setExpandedPillar(expandedPillar === pillar ? null : pillar)}
              aria-expanded={expandedPillar === pillar}
              aria-label={`${pillar} - ${questions.length} questions`}
            >
              <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                {expandedPillar === pillar ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                {pillar}
              </span>
              <span className="text-xs text-muted-foreground">{questions.length} questions</span>
            </button>

            {expandedPillar === pillar && (
              <div className="border-t border-border/30 divide-y divide-border/20">
                {questions.map((q, idx) => (
                  <div key={q.id} className="p-3 hover:bg-muted/10 transition-colors">
                    {editingId === q.id ? (
                      renderForm(handleSaveEdit, 'Save Changes')
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground font-medium">
                            <span className="text-muted-foreground mr-1">{idx + 1}.</span>
                            {q.question}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            <span className="font-medium">Metrics:</span> {q.observableMetrics}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-semibold">{q.dimensionMetric} → {q.subMetric}</span>
                          </p>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(q)} aria-label={`Edit question ${idx + 1}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(q.id)} aria-label={`Delete question ${idx + 1}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {questions.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground italic">No questions for this pillar yet.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAssessmentQuestions;
