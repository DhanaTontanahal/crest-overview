import React from 'react';
import ExcelUpload from '@/components/ExcelUpload';
import AdminSettings from '@/components/AdminSettings';

export const AdminUploadPage: React.FC = () => (
  <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
    <ExcelUpload />
  </div>
);

export const AdminSettingsPage: React.FC = () => (
  <div className="animate-fade-in" style={{ animationFillMode: 'forwards' }}>
    <AdminSettings />
  </div>
);
