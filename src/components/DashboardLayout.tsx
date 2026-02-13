import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import DashboardHeader from '@/components/DashboardHeader';
import AppSidebar from '@/components/AppSidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-4rem)] w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="flex items-center border-b border-border px-4 h-10">
              <SidebarTrigger />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default DashboardLayout;
