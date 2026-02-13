import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, User, Crown } from 'lucide-react';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

const roleConfig: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'superuser', label: 'Super User', icon: <Crown className="w-5 h-5" />, description: 'Full organization visibility across all CIOs and platforms' },
  { value: 'supervisor', label: 'Supervisor (CIO)', icon: <Eye className="w-5 h-5" />, description: 'Platform-level data for your assigned area' },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, description: 'Data upload and settings management' },
  { value: 'user', label: 'User', icon: <User className="w-5 h-5" />, description: 'Read-only access to permitted dashboards' },
];

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole | ''>('');
  const [cioId, setCioId] = useState('');

  const handleLogin = () => {
    if (!role) return;
    const roleName = role === 'superuser' ? 'Ron' : role === 'supervisor' ? (cios.find(c => c.id === cioId)?.name || 'Supervisor') : role.charAt(0).toUpperCase() + role.slice(1);
    const profile: UserProfile = {
      name: roleName,
      role: role as UserRole,
      cioId: role === 'supervisor' ? cioId : undefined,
    };
    onLogin(profile);
  };

  const selectedRoleConfig = roleConfig.find(r => r.value === role);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Platform Maturity Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organisation Health & Performance Overview</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-5 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">Select Role</label>
            <Select value={role} onValueChange={(v) => { setRole(v as UserRole); setCioId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your role" />
              </SelectTrigger>
              <SelectContent>
                {roleConfig.map(r => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className="flex items-center gap-2">{r.icon}{r.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedRoleConfig && (
              <p className="text-xs text-muted-foreground mt-1.5 animate-fade-in">{selectedRoleConfig.description}</p>
            )}
          </div>

          {role === 'supervisor' && (
            <div className="animate-fade-in">
              <label className="text-sm font-medium text-card-foreground mb-1.5 block">CIO Assignment</label>
              <Select value={cioId} onValueChange={setCioId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select CIO platform" />
                </SelectTrigger>
                <SelectContent>
                  {cios.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} — {c.platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            onClick={handleLogin}
            className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            disabled={!role || (role === 'supervisor' && !cioId)}
          >
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
