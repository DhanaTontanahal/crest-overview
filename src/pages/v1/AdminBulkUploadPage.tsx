import React from 'react';
import AdminAssessmentQuestions from '@/components/AdminAssessmentQuestions';
import PageHeader from '@/components/PageHeader';
import { useAppState } from '@/context/AppContext';

const AdminBulkUploadPage: React.FC = () => {
  const { user } = useAppState();
  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Bulk Upload Questions"
        subtitle="Upload assessment questions in bulk via Excel/CSV, or manage them individually."
      />
      <AdminAssessmentQuestions />
    </div>
  );
};

export default AdminBulkUploadPage;
