import React from 'react';
import { useAppState } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle2, Clock } from 'lucide-react';

const V1ReviewCommentsPage: React.FC = () => {
  const { user, assessments, publishedQuestions, selectedQuarter } = useAppState();

  if (user?.role !== 'user' || !user.platformId) {
    return <p className="text-muted-foreground">Users only.</p>;
  }

  const myAssessments = assessments.filter(
    a => a.platform === user.platformId && a.quarter === selectedQuarter
  );

  const reviewedAssessments = myAssessments.filter(a => a.status === 'reviewed');
  const pendingAssessments = myAssessments.filter(a => a.status === 'submitted');

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Reviewer Comments"
        subtitle={`Feedback on your ${user.platformId} assessments for ${selectedQuarter}.`}
      />

      {myAssessments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No assessments found for {selectedQuarter}. Submit an assessment first.
            </p>
          </CardContent>
        </Card>
      ) : reviewedAssessments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Your assessment is pending review. You'll see reviewer comments here once reviewed.
            </p>
            {pendingAssessments.length > 0 && (
              <Badge variant="secondary" className="mt-3">
                {pendingAssessments.length} assessment(s) awaiting review
              </Badge>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviewedAssessments.map(a => {
            const avgScore = a.answers.length > 0
              ? (a.answers.reduce((s, ans) => s + ans.score, 0) / a.answers.length).toFixed(1)
              : '—';

            return (
              <Card key={a.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {a.platform} — {a.quarter}
                    </span>
                    <Badge variant="default">Reviewed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Avg Score: {avgScore}/5</span>
                    <span>Reviewed by: {a.reviewedBy || '—'}</span>
                    <span>Reviewed on: {a.reviewedAt || '—'}</span>
                  </div>

                  {a.reviewerOverallComment && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mt-2">
                      <p className="text-xs font-semibold text-foreground mb-1">Overall Reviewer Comment</p>
                      <p className="text-xs text-muted-foreground">{a.reviewerOverallComment}</p>
                    </div>
                  )}

                  <div className="space-y-2 mt-3">
                    <p className="text-xs font-semibold text-foreground">Your Answers & Reviewer Feedback</p>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {publishedQuestions.map(q => {
                        const ans = a.answers.find(an => an.questionId === q.id);
                        const reviewerComment = a.reviewerComments?.[q.id];
                        return (
                          <div key={q.id} className="p-3 rounded-lg bg-muted/30 border border-border/30">
                            <p className="text-xs font-medium text-foreground">{q.question}</p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">
                                Score: {ans?.score || '—'}/5
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                                {q.dimensionMetric} → {q.subMetric}
                              </span>
                            </div>
                            {ans?.comments && (
                              <p className="mt-1.5 text-xs text-muted-foreground italic border-l-2 border-border pl-2">
                                Your comment: "{ans.comments}"
                              </p>
                            )}
                            {reviewerComment && (
                              <div className="mt-2 p-2 rounded bg-primary/5 border border-primary/20">
                                <p className="text-[10px] font-semibold text-primary mb-0.5">Reviewer Feedback</p>
                                <p className="text-xs text-foreground">{reviewerComment}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default V1ReviewCommentsPage;
