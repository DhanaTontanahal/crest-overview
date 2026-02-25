import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import V0Sidebar from './V0Sidebar';
import V0Header from './V0Header';

const V0DashboardLayout: React.FC = () => (
  <div className="min-h-screen bg-background flex flex-col w-full">
    <V0Header />
    <SidebarProvider>
      <div className="flex flex-1 w-full">
        <V0Sidebar />
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

export default V0DashboardLayout;
