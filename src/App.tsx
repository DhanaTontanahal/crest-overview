import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider, useAppState } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import OverviewPage from "@/pages/OverviewPage";
import OrgHealthPage from "@/pages/OrgHealthPage";
import DimensionsPage from "@/pages/DimensionsPage";
import TrendsPage from "@/pages/TrendsPage";
import ImprovementsPage from "@/pages/ImprovementsPage";
import HeatmapPage from "@/pages/HeatmapPage";
import QuarterlyProgressPage from "@/pages/QuarterlyProgressPage";
import ActionPlanPage from "@/pages/ActionPlanPage";
import PlatformAssessmentsPage from "@/pages/PlatformAssessmentsPage";
import TeamDataPage from "@/pages/TeamDataPage";
import { SubmitAssessmentPage, ViewAssessmentsPage, ReviewAssessmentPage } from "@/pages/AssessmentPages";
import { AdminUploadPage, AdminSettingsPage } from "@/pages/AdminPages";
import PersonasPage from "@/pages/PersonasPage";
import PlatformComparisonPage from "@/pages/PlatformComparisonPage";
import NotFound from "./pages/NotFound";
import LoginPage from "@/pages/LoginPage";
// v0 imports
import V0LoginPage from "@/pages/v0/V0LoginPage";
import V0DashboardLayout from "@/components/v0/V0DashboardLayout";
import { V0CreateAssessmentPage, V0SelfAssessmentPage, V0PeerReviewPage, V0ViewAssessmentsPage } from "@/pages/v0/V0AssessmentPages";
import V0PersonasPage from "@/pages/v0/V0PersonasPage";

const queryClient = new QueryClient();

const AppRoutes: React.FC = () => {
  const { user, setUser } = useAppState();

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <Routes>
      {/* v1 routes (existing 5-role) */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/org-health" element={<OrgHealthPage />} />
        <Route path="/dimensions" element={<DimensionsPage />} />
        <Route path="/platform-comparison" element={<PlatformComparisonPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/improvements" element={<ImprovementsPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
        <Route path="/quarterly-progress" element={<QuarterlyProgressPage />} />
        <Route path="/action-plan" element={<ActionPlanPage />} />
        <Route path="/platform-assessments" element={<PlatformAssessmentsPage />} />
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

/* v0 routes component */
const V0Routes: React.FC = () => {
  const { user, setUser } = useAppState();

  if (!user) {
    return <V0LoginPage onLogin={setUser} />;
  }

  return (
    <Routes>
      <Route element={<V0DashboardLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/dimensions" element={<DimensionsPage />} />
        <Route path="/trends" element={<TrendsPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
        <Route path="/quarterly-progress" element={<QuarterlyProgressPage />} />
        <Route path="/action-plan" element={<ActionPlanPage />} />
        <Route path="/team-data" element={<TeamDataPage />} />
        <Route path="/assessments/create" element={<V0CreateAssessmentPage />} />
        <Route path="/assessments/submit" element={<V0SelfAssessmentPage />} />
        <Route path="/assessments/view" element={<V0ViewAssessmentsPage />} />
        <Route path="/assessments/review" element={<V0PeerReviewPage />} />
        <Route path="/admin/personas" element={<V0PersonasPage />} />
        <Route path="/admin/upload" element={<AdminUploadPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>
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
          <Routes>
            <Route path="/v0/*" element={<V0Routes />} />
            <Route path="/*" element={<AppRoutes />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
