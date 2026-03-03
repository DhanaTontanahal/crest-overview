import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import V1Sidebar from './V1Sidebar';
import V1Header from './V1Header';

const V1DashboardLayout: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col w-full">
    <V1Header />
    <SidebarProvider>
      <div className="flex flex-1 w-full">
        <V1Sidebar />
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

export default V1DashboardLayout;
