import React from 'react';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';
import AdminAssessmentQuestions from '@/components/AdminAssessmentQuestions';
import AssessmentUpload from '@/components/AssessmentUpload';

export const AdminUploadPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
    <ExcelUpload />
    <AssessmentUpload />
  </div>
);

export const AdminSettingsPage: React.FC = () => (
  <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
    <AdminSettings />
    <AdminAssessmentQuestions />
  </div>
);
