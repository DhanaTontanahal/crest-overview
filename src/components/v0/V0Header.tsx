import React from 'react';
import { useAppState } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Shield, User, Eye, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  reviewer: <Eye className="w-4 h-4" />,
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  user: 'User',
  reviewer: 'Peer Reviewer',
};

const V0Header: React.FC = () => {
  const { user, setUser, selectedQuarter, setSelectedQuarter, selectedPlatform, setSelectedPlatform,
    selectedPillar, setSelectedPillar, platforms, pillars, availableQuarters } = useAppState();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/v0');
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              Platform Maturity
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">v0</span>
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {user && roleIcons[user.role]} {user && roleLabels[user.role]}
              {user?.platformId && ` — ${user.platformId}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
            <SelectTrigger className="w-[120px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>{availableQuarters.map(q => <SelectItem key={q} value={q}>{q}</SelectItem>)}</SelectContent>
          </Select>

          {user?.role === 'admin' && (
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Platforms</SelectItem>
                {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedPillar} onValueChange={setSelectedPillar}>
            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Pillars</SelectItem>
              {pillars.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs gap-1">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default V0Header;
