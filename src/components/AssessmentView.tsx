import React, { useMemo, useState } from 'react';
import { Assessment, assessmentQuestions } from '@/data/assessmentQuestions';
import { defaultPillars, defaultPlatforms } from '@/data/dummyData';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartChatBox from '@/components/ChartChatBox';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell,
} from 'recharts';
import { Eye, ChevronRight, ChevronDown, UserCheck, Clock, CheckCircle2, FileText, Building2, ArrowLeft } from 'lucide-react';

const PILLAR_COLORS = [
  'hsl(163, 100%, 21%)', 'hsl(155, 60%, 40%)', 'hsl(185, 70%, 50%)',
  'hsl(145, 50%, 55%)', 'hsl(170, 55%, 45%)', 'hsl(140, 45%, 70%)',
];

interface AssessmentViewProps {
  assessments: Assessment[];
  canDrillDown?: boolean;
  platformFilter?: string;
  onReview?: (assessmentId: string, reviewerPlatform: string) => void;
  reviewerPlatform?: string;
}

const AssessmentView: React.FC<AssessmentViewProps> = ({
  assessments, canDrillDown = false, platformFilter, onReview, reviewerPlatform,
}) => {
  const { selectedQuarter } = useAppState();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = assessments.filter(a => a.quarter === selectedQuarter);
    if (platformFilter) list = list.filter(a => a.platform === platformFilter);
    return list;
  }, [assessments, selectedQuarter, platformFilter]);

  const selectedAssessment = selectedPlatform ? filtered.find(a => a.platform === selectedPlatform) : null;

  // Radar data per pillar
  const radarData = useMemo(() => {
    if (!filtered.length) return [];
    return defaultPillars.map(pillar => {
      const pillarQs = assessmentQuestions.filter(q => q.pillar === pillar);
      const entry: Record<string, unknown> = { pillar };
      filtered.forEach(a => {
        const scores = pillarQs.map(q => a.answers.find(ans => ans.questionId === q.id)?.score ?? 0).filter(s => s > 0);
        entry[a.platform] = scores.length > 0 ? +(scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1) : 0;
      });
      return entry;
    });
  }, [filtered]);

  // Bar chart for pillar averages
  const pillarBarData = useMemo(() => {
    if (!selectedAssessment) return [];
    return defaultPillars.map(pillar => {
      const pillarQs = assessmentQuestions.filter(q => q.pillar === pillar);
      const scores = pillarQs.map(q => selectedAssessment.answers.find(a => a.questionId === q.id)?.score ?? 0).filter(s => s > 0);
      const avg = scores.length > 0 ? +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0;
      return { pillar, average: avg };
    });
  }, [selectedAssessment]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3" /> Reviewed</span>;
      case 'submitted': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3" /> Submitted</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><FileText className="w-3 h-3" /> Draft</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'bg-green-100 text-green-800';
    if (score >= 3) return 'bg-yellow-100 text-yellow-800';
    if (score >= 2) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Detail view for a selected platform's assessment
  if (selectedAssessment && canDrillDown) {
    return (
      <div className="space-y-5">
        <Button variant="outline" size="sm" onClick={() => { setSelectedPlatform(null); setExpandedPillar(null); }} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Overview
        </Button>

        {/* Assessment Header */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold text-card-foreground">{selectedAssessment.platform} Assessment — {selectedQuarter}</h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span>Submitted: {selectedAssessment.submittedAt}</span>
                <span>By: {selectedAssessment.submittedBy} TPL</span>
                {selectedAssessment.reviewedBy && <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Reviewed by: {selectedAssessment.reviewedBy} TPL</span>}
              </div>
            </div>
            {getStatusBadge(selectedAssessment.status)}
          </div>
        </div>

        {/* Radar Chart for this platform */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border relative">
          <ChartChatBox chartTitle={`${selectedAssessment.platform} Maturity Radar`} />
          <h3 className="text-base font-semibold text-card-foreground text-center">Pillar Maturity Scores</h3>
          <ResponsiveContainer width="100%" height={320}>
            <RadarChart data={pillarBarData.map(d => ({ pillar: d.pillar, Score: d.average }))}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
              <Tooltip />
              <Radar name={selectedAssessment.platform} dataKey="Score" stroke="hsl(163, 100%, 21%)" fill="hsl(163, 100%, 21%)" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Pillar Bar */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border relative">
          <ChartChatBox chartTitle="Pillar Averages" />
          <h3 className="text-base font-semibold text-card-foreground text-center mb-4">Pillar Average Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pillarBarData} margin={{ left: 10, right: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pillar" fontSize={9} angle={-15} textAnchor="end" height={60} />
              <YAxis domain={[0, 5]} fontSize={11} />
              <Tooltip />
              <Bar dataKey="average" name="Avg Score" radius={[4, 4, 0, 0]} barSize={36}>
                {pillarBarData.map((_, i) => (
                  <Cell key={i} fill={PILLAR_COLORS[i % PILLAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Question-level detail */}
        {defaultPillars.map((pillar, pillarIdx) => {
          const pillarQs = assessmentQuestions.filter(q => q.pillar === pillar);
          const isExpanded = expandedPillar === pillar;
          const pillarAnswers = pillarQs.map(q => selectedAssessment.answers.find(a => a.questionId === q.id));
          const avgScore = pillarAnswers.filter(a => a && a.score > 0).length > 0
            ? +(pillarAnswers.reduce((s, a) => s + (a?.score ?? 0), 0) / pillarAnswers.filter(a => a && a.score > 0).length).toFixed(1) : 0;

          return (
            <div key={pillar} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors" onClick={() => setExpandedPillar(isExpanded ? null : pillar)}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground" style={{ backgroundColor: PILLAR_COLORS[pillarIdx] }}>{pillarIdx + 1}</span>
                  <span className="font-semibold text-card-foreground">{pillar}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getScoreColor(avgScore)}`}>Avg: {avgScore}</span>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  {pillarQs.map((q, qi) => {
                    const answer = selectedAssessment.answers.find(a => a.questionId === q.id);
                    return (
                      <div key={q.id} className="p-4 bg-muted/20 rounded-lg border border-border/50 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">{qi + 1}</span>
                            <p className="text-sm font-medium text-card-foreground">{q.question}</p>
                          </div>
                          <span className={`text-sm font-bold px-3 py-1 rounded-lg ${getScoreColor(answer?.score ?? 0)}`}>
                            {answer?.score ?? '-'}/5
                          </span>
                        </div>
                        {answer?.comments && <p className="text-xs text-muted-foreground ml-8 italic">"{answer.comments}"</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Review Action */}
        {onReview && selectedAssessment.status === 'submitted' && reviewerPlatform && reviewerPlatform !== selectedAssessment.platform && (
          <div className="flex justify-end">
            <Button onClick={() => onReview(selectedAssessment.id, reviewerPlatform)} className="gap-2">
              <UserCheck className="w-4 h-4" /> Mark as Reviewed
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Overview list
  return (
    <div className="space-y-5">
      {/* Multi-platform Radar */}
      {filtered.length > 1 && (
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border relative">
          <ChartChatBox chartTitle="Cross-Platform Maturity Radar" />
          <h3 className="text-base font-semibold text-card-foreground text-center">Cross-Platform Maturity Radar — {selectedQuarter}</h3>
          <p className="text-xs text-muted-foreground text-center mb-4">Assessment scores by pillar across all platforms</p>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="pillar" tick={{ fontSize: 9, fill: 'hsl(var(--foreground))' }} />
              <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 9 }} />
              <Tooltip />
              {filtered.map((a, i) => (
                <Radar key={a.platform} name={a.platform} dataKey={a.platform} stroke={PILLAR_COLORS[i % PILLAR_COLORS.length]} fill={PILLAR_COLORS[i % PILLAR_COLORS.length]} fillOpacity={0.1} strokeWidth={2} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Assessment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((a, i) => {
          const totalScore = a.answers.reduce((s, ans) => s + ans.score, 0);
          const avgScore = a.answers.length > 0 ? +(totalScore / a.answers.length).toFixed(1) : 0;

          return (
            <div
              key={a.id}
              className={`bg-card rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-all ${canDrillDown ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
              onClick={() => canDrillDown && setSelectedPlatform(a.platform)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-card-foreground">{a.platform}</h4>
                </div>
                {getStatusBadge(a.status)}
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{avgScore}</p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{a.answers.filter(ans => ans.score > 0).length}</p>
                  <p className="text-xs text-muted-foreground">Answered</p>
                </div>
                <div className="text-center p-2 bg-muted/30 rounded-lg">
                  <p className="text-lg font-bold text-foreground">{assessmentQuestions.length}</p>
                  <p className="text-xs text-muted-foreground">Total Qs</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Submitted: {a.submittedAt} by {a.submittedBy} TPL</p>
                {a.reviewedBy && <p className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Reviewed by: {a.reviewedBy} TPL ({a.reviewedAt})</p>}
              </div>
              {canDrillDown && (
                <div className="flex justify-end mt-2">
                  <span className="text-xs text-primary flex items-center gap-1">View Details <ChevronRight className="w-3 h-3" /></span>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No assessments found for {selectedQuarter}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentView;
