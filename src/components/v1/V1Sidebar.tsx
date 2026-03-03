import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '@/context/AppContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar,
} from '@/components/ui/sidebar';
import {
  Gauge, BarChart3, TrendingUp, Grid3X3, CalendarCheck, Lightbulb, Download,
  ClipboardList, FileSearch, Eye, Upload, Settings, Users, type LucideIcon,
} from 'lucide-react';

const V1Sidebar: React.FC = () => {
  const { user } = useAppState();
  const location = useLocation();
  const navigate = useNavigate();
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === 'collapsed';

  const isAdmin = user?.role === 'admin';
  const isUser = user?.role === 'user';
  const isReviewer = user?.role === 'reviewer';

  const dashboardItems = [
    { title: 'Overview', url: '/', icon: Gauge },
    { title: 'Metric Dimensions', url: '/dimensions', icon: BarChart3 },
    { title: 'Trends', url: '/trends', icon: TrendingUp },
    ...(isAdmin || isUser ? [{ title: 'Cross-Platform Analysis', url: '/heatmap', icon: Grid3X3 }] : []),
    ...(isAdmin || isUser ? [{ title: 'Quarterly Progress', url: '/quarterly-progress', icon: CalendarCheck }] : []),
    ...(isAdmin || isUser ? [{ title: 'Action Plan', url: '/action-plan', icon: Lightbulb }] : []),
    { title: 'Team Data', url: '/team-data', icon: Download },
  ];

  const assessmentItems = [
    ...(isUser ? [{ title: 'Self Assessment', url: '/assessments/submit', icon: ClipboardList }] : []),
    ...(isAdmin ? [{ title: 'Create Assessment', url: '/assessments/create', icon: ClipboardList }] : []),
    { title: 'View Assessments', url: '/assessments/view', icon: FileSearch },
    ...(isReviewer ? [{ title: 'Peer Review', url: '/assessments/review', icon: Eye }] : []),
  ];

  const adminItems = isAdmin ? [
    { title: 'Personas', url: '/admin/personas', icon: Users },
    { title: 'Data Upload', url: '/admin/upload', icon: Upload },
    { title: 'Settings', url: '/admin/settings', icon: Settings },
  ] : [];

  const isActive = (url: string) => location.pathname === url;

  const renderItems = (items: { title: string; url: string; icon: LucideIcon }[]) =>
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
          <SidebarGroupContent><SidebarMenu>{renderItems(dashboardItems)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>

        {assessmentItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Assessments</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{renderItems(assessmentItems)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        )}

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>Admin</SidebarGroupLabel>
            <SidebarGroupContent><SidebarMenu>{renderItems(adminItems)}</SidebarMenu></SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default V1Sidebar;
