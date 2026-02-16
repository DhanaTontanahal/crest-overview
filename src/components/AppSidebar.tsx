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
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Gauge, BarChart3, TrendingUp, Target, ClipboardList, FileSearch, Eye, Download, Upload, Settings, Users,
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
  const showDashboard = user?.role === 'superuser' || isAdmin;
  const showSupervisor = user?.role === 'supervisor';

  const dashboardItems = [
    { title: 'Overview', url: '/', icon: Gauge },
    { title: 'Dimensions', url: '/dimensions', icon: BarChart3 },
    { title: 'Trends', url: '/trends', icon: TrendingUp },
    { title: 'Improvements', url: '/improvements', icon: Target },
    { title: 'Team Data', url: '/team-data', icon: Download },
  ];

  const assessmentItems = [
    ...(isTPL ? [{ title: 'Submit Assessment', url: '/assessments/submit', icon: ClipboardList }] : []),
    ...((isTPL || isReviewer) ? [{ title: 'View Assessments', url: '/assessments/view', icon: FileSearch }] : []),
    ...((isTPL || isReviewer) ? [{ title: 'Peer Review', url: '/assessments/review', icon: Eye }] : []),
  ];

  const adminItems = isAdmin ? [
    { title: 'Personas', url: '/admin/personas', icon: Users },
    { title: 'Data Upload', url: '/admin/upload', icon: Upload },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
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
      <SidebarContent className="pt-2">
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
