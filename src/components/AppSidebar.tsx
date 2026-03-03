import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Gauge, BarChart3, TrendingUp, Target, ClipboardList, FileSearch, Eye, Download, Upload, Settings, Users,
  Heart, Grid3X3, CalendarCheck, Lightbulb, GitCompare,
} from 'lucide-react';

const AppSidebar: React.FC = () => {
  const { user } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === 'collapsed';

  const isTPL = user?.role === 'user';
  const isAdmin = user?.role === 'admin';
  const isReviewer = user?.role === 'reviewer';
  const isSuperUser = user?.role === 'superuser';
  const showDashboard = isSuperUser || isAdmin;
  const showSupervisor = user?.role === 'supervisor';

  const dashboardItems = [
    { title: 'Overview', url: '/version_2', icon: Gauge },
    { title: 'Metric Dimensions', url: '/version_2/dimensions', icon: BarChart3 },
    ...(showDashboard || showSupervisor || isTPL ? [{ title: 'Organisation Health', url: '/version_2/org-health', icon: Heart }] : []),
    ...(isTPL ? [{ title: 'Platform vs Organisation', url: '/version_2/platform-comparison', icon: GitCompare }] : []),
    { title: 'Trends', url: '/version_2/trends', icon: TrendingUp },
    ...(showDashboard || showSupervisor || isTPL ? [{ title: 'Cross-Platform Analysis', url: '/version_2/heatmap', icon: Grid3X3 }] : []),
    ...(showDashboard || showSupervisor || isTPL ? [{ title: 'Quarterly Progress', url: '/version_2/quarterly-progress', icon: CalendarCheck }] : []),
    ...(showDashboard || showSupervisor || isTPL ? [{ title: 'Action Plan', url: '/version_2/action-plan', icon: Lightbulb }] : []),
    { title: 'Team Data', url: '/version_2/team-data', icon: Download },
  ];

  const assessmentItems = [
    ...(isTPL ? [{ title: 'Submit Assessment', url: '/version_2/assessments/submit', icon: ClipboardList }] : []),
    ...((isTPL || isReviewer) ? [{ title: 'View Assessments', url: '/version_2/assessments/view', icon: FileSearch }] : []),
    ...((isTPL || isReviewer) ? [{ title: 'Peer Review', url: '/version_2/assessments/review', icon: Eye }] : []),
    ...((isSuperUser || showSupervisor) ? [{ title: 'Platform Assessments', url: '/version_2/platform-assessments', icon: ClipboardList }] : []),
  ];

  const adminItems = isAdmin ? [
    { title: 'Personas', url: '/version_2/admin/personas', icon: Users },
    { title: 'Data Upload', url: '/version_2/admin/upload', icon: Upload },
    { title: 'Settings', url: '/version_2/admin/settings', icon: Settings },
  ] : [];

  const isActive = (url: string) => location.pathname === url;

  const renderItems = (items: { title: string; url: string; icon: React.FC<any> }[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          onClick={() => navigate(item.url)}
          className={`cursor-pointer transition-colors ${
            isActive(item.url)
              ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
          }`}
          tooltip={item.title}
        >
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{item.title}</span>}
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-24">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(showDashboard || showSupervisor || isTPL) && renderItems(dashboardItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {assessmentItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Assessments</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {renderItems(assessmentItems)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {renderItems(adminItems)}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
