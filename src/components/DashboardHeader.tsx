import React from 'react';
import { useAppState } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Eye, Shield, User, Building2, LayoutDashboard, ClipboardList, FileSearch } from 'lucide-react';

const roleIcons: Record<string, React.ReactNode> = {
  ltc_ceo: <Building2 className="w-4 h-4" />,
  superuser: <Crown className="w-4 h-4" />,
  supervisor: <Eye className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
};

const DashboardHeader: React.FC = () => {
  const {
    user, setUser,
    selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar,
    selectedQuarter, setSelectedQuarter,
    platforms, pillars, availableQuarters,
    activeTab, setActiveTab,
  } = useAppState();

  const isSuperUser = user?.role === 'superuser';
  const isSupervisor = user?.role === 'supervisor';
  const isTPL = user?.role === 'user';
  const isLTCCEO = user?.role === 'ltc_ceo';
  const showAssessmentTabs = isSuperUser || isSupervisor || isTPL || isLTCCEO;

  return (
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Platform Maturity Dashboard</h1>
            <p className="text-sm opacity-80">
              {user ? (
                <span className="flex items-center gap-1.5">
                  {roleIcons[user.role]} {user.role === 'ltc_ceo' ? 'LTC CEO' : user.role === 'superuser' ? 'Super User' : user.role === 'supervisor' ? 'Supervisor (CIO)' : user.role === 'admin' ? 'Admin' : `Platform Lead${user.platformId ? ` — ${user.platformId}` : ''}`}
                </span>
              ) : 'Organisation Health & Performance Overview'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[130px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>

            {(isSuperUser || user?.role === 'admin') && activeTab === 'dashboard' && (
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[160px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Platforms</SelectItem>
                  {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            {activeTab === 'dashboard' && (
              <Select value={selectedPillar} onValueChange={setSelectedPillar}>
                <SelectTrigger className="w-[200px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground">
                  <SelectValue placeholder="Pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Pillars</SelectItem>
                  {pillars.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUser(null)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        {showAssessmentTabs && (
          <div className="flex gap-1 mt-3 border-t border-primary-foreground/20 pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className={`text-primary-foreground gap-1.5 ${activeTab === 'dashboard' ? 'bg-primary-foreground/20 font-semibold' : 'hover:bg-primary-foreground/10 opacity-70'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Button>
            {isTPL && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('submit-assessment')}
                className={`text-primary-foreground gap-1.5 ${activeTab === 'submit-assessment' ? 'bg-primary-foreground/20 font-semibold' : 'hover:bg-primary-foreground/10 opacity-70'}`}
              >
                <ClipboardList className="w-4 h-4" /> Submit Assessment
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('view-assessments')}
              className={`text-primary-foreground gap-1.5 ${activeTab === 'view-assessments' ? 'bg-primary-foreground/20 font-semibold' : 'hover:bg-primary-foreground/10 opacity-70'}`}
            >
              <FileSearch className="w-4 h-4" /> View Assessments
            </Button>
            {isTPL && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab('review-assessment')}
                className={`text-primary-foreground gap-1.5 ${activeTab === 'review-assessment' ? 'bg-primary-foreground/20 font-semibold' : 'hover:bg-primary-foreground/10 opacity-70'}`}
              >
                <Eye className="w-4 h-4" /> Peer Review
              </Button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
