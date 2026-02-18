import React from 'react';
import { useAppState } from '@/context/AppContext';
import AssessmentView from '@/components/AssessmentView';
import { ClipboardList } from 'lucide-react';

const PlatformAssessmentsPage: React.FC = () => {
  const { assessments, selectedQuarter } = useAppState();

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-border relative">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-card-foreground">Platform Assessments — {selectedQuarter}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Review maturity assessments submitted by Platform Leads. Drill into each assessment to see detailed scores, evidence, and reviewer feedback.
        </p>
        <AssessmentView assessments={assessments} canDrillDown />
      </div>
    </div>
  );
};

export default PlatformAssessmentsPage;
