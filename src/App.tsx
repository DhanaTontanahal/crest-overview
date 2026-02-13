import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useAppState } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import DimensionsPage from "@/pages/DimensionsPage";
import TrendsPage from "@/pages/TrendsPage";
import ImprovementsPage from "@/pages/ImprovementsPage";
import TeamDataPage from "@/pages/TeamDataPage";
import { SubmitAssessmentPage, ViewAssessmentsPage, ReviewAssessmentPage } from "@/pages/AssessmentPages";
import { AdminUploadPage, AdminSettingsPage } from "@/pages/AdminPages";
import PersonasPage from "@/pages/PersonasPage";
import NotFound from "./pages/NotFound";
import LoginPage from "@/pages/LoginPage";

const queryClient = new QueryClient();

const AppRoutes: React.FC = () => {
  const { user, setUser } = useAppState();

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/dimensions" element={<DimensionsPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/improvements" element={<ImprovementsPage />} />
        <Route path="/team-data" element={<TeamDataPage />} />
        <Route path="/assessments/submit" element={<SubmitAssessmentPage />} />
        <Route path="/assessments/view" element={<ViewAssessmentsPage />} />
        <Route path="/assessments/review" element={<ReviewAssessmentPage />} />
        <Route path="/admin/personas" element={<PersonasPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
