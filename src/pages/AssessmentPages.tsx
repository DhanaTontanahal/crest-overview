import React from 'react';
import { useAppState } from '@/context/AppContext';
import AssessmentSubmit from '@/components/AssessmentSubmit';
import AssessmentView from '@/components/AssessmentView';
import { Assessment } from '@/data/assessmentQuestions';

export const SubmitAssessmentPage: React.FC = () => {
  const { user, assessments, setAssessments, selectedQuarter } = useAppState();

  if (user?.role !== 'user' || !user.platformId) {
    return <p className="text-muted-foreground">Only Platform Leads can submit assessments.</p>;
  }

  const existing = assessments.find(a => a.platform === user.platformId && a.quarter === selectedQuarter);

  const handleSubmit = (assessment: Assessment) => {
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === assessment.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = assessment;
        return updated;
      }
      return [...prev, assessment];
    });
  };

  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <AssessmentSubmit platform={user.platformId} onSubmit={handleSubmit} existingAssessment={existing} />
    </div>
  );
};

export const ViewAssessmentsPage: React.FC = () => {
  const { user, assessments, cios } = useAppState();
  const isTPL = user?.role === 'user';
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;
  const platformFilter = isTPL ? user?.platformId : supervisorPlatform;

  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <AssessmentView
        assessments={assessments}
        canDrillDown={user?.role === 'superuser' || user?.role === 'reviewer' || user?.role === 'supervisor'}
        platformFilter={isTPL ? platformFilter : undefined}
        reviewerPlatform={isTPL ? user?.platformId : undefined}
      />
    </div>
  );
};

export const ReviewAssessmentPage: React.FC = () => {
  const { user, assessments, setAssessments } = useAppState();

  if (user?.role !== 'user' || !user.platformId) {
    return <p className="text-muted-foreground">Only Platform Leads can peer review assessments.</p>;
  }

  const peerAssessments = assessments.filter(a => a.platform !== user.platformId && a.status === 'submitted');
  const displayAssessments = peerAssessments.length > 0 ? peerAssessments : assessments.filter(a => a.platform !== user.platformId);

  const handleReview = (assessmentId: string, reviewerPlatform: string) => {
    setAssessments(prev => prev.map(a =>
      a.id === assessmentId ? { ...a, reviewedBy: reviewerPlatform, reviewedAt: new Date().toISOString().split('T')[0], status: 'reviewed' as const } : a
    ));
  };

  return (
    <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <AssessmentView
        assessments={displayAssessments}
        canDrillDown
        onReview={handleReview}
        reviewerPlatform={user.platformId}
      />
    </div>
  );
};
