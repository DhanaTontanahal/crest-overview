import React from 'react';
import { useAppState } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogOut, Crown, Eye, Shield, User, FileSearch } from 'lucide-react';

const roleIcons: Record<string, React.ReactNode> = {
  superuser: <Crown className="w-4 h-4" />,
  supervisor: <Eye className="w-4 h-4" />,
  admin: <Shield className="w-4 h-4" />,
  reviewer: <FileSearch className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
};

const roleLabels: Record<string, string> = {
  superuser: 'Super User',
  supervisor: 'Supervisor (CIO)',
  admin: 'Admin',
  reviewer: 'Reviewer',
  user: 'Platform Lead',
};

const DashboardHeader: React.FC = () => {
  const {
    user, setUser,
    selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar,
    selectedQuarter, setSelectedQuarter,
    platforms, pillars, availableQuarters,
  } = useAppState();

  const isSuperUser = user?.role === 'superuser';

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50" role="banner" aria-label="Dashboard header">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Platform Maturity Dashboard</h1>
            <p className="text-sm opacity-80">
              {user ? (
                <span className="flex items-center gap-1.5">
                  {roleIcons[user.role]} {roleLabels[user.role] || user.role}{user.role === 'user' && user.platformId ? ` — ${user.platformId}` : ''}
                </span>
              ) : 'Organisation Health & Performance Overview'}
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-3" aria-label="Dashboard filters">
            <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
              <SelectTrigger className="w-[130px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground" aria-label="Select quarter">
                <SelectValue placeholder="Quarter" />
              </SelectTrigger>
              <SelectContent>
                {availableQuarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}
              </SelectContent>
            </Select>

            {(isSuperUser || user?.role === 'admin') && (
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[160px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground" aria-label="Select platform">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Platforms</SelectItem>
                  {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedPillar} onValueChange={setSelectedPillar}>
              <SelectTrigger className="w-[200px] bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground" aria-label="Select pillar">
                <SelectValue placeholder="Pillar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Pillars</SelectItem>
                {pillars.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setUser(null)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
