import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole | ''>('');
  const [cioId, setCioId] = useState('');

  const handleLogin = () => {
    if (!name.trim() || !role) return;
    const profile: UserProfile = {
      name: name.trim(),
      role: role as UserRole,
      cioId: role === 'supervisor' ? cioId : undefined,
    };
    onLogin(profile);
  };

  const selectedRoleConfig = roleConfig.find(r => r.value === role);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Platform Maturity Dashboard</h1>
          <p className="text-muted-foreground mt-1">Organisation Health & Performance Overview</p>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-5">
          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">Your Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your name"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-card-foreground mb-1.5 block">Role</label>
            <Select value={role} onValueChange={(v) => { setRole(v as UserRole); setCioId(''); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
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
              <p className="text-xs text-muted-foreground mt-1.5">{selectedRoleConfig.description}</p>
            )}
          </div>

          {role === 'supervisor' && (
            <div>
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
            className="w-full"
            size="lg"
            disabled={!name.trim() || !role || (role === 'supervisor' && !cioId)}
          >
            Sign In
          </Button>

          <div className="bg-muted rounded-lg p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Quick Access:</p>
            <p>• <strong>Ron</strong> — Super User (full org view)</p>
            <p>• <strong>Martin</strong> — Supervisor / CIO (Consumer only)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
