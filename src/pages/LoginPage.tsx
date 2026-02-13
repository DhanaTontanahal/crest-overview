import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, User, Crown, Users, TrendingUp, MessageSquare, Clock, ClipboardList, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

const roleConfig: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'superuser', label: 'Super User', icon: <Crown className="w-5 h-5" />, description: 'Full organization visibility across all CIOs and platforms' },
  { value: 'supervisor', label: 'Supervisor (CIO)', icon: <Eye className="w-5 h-5" />, description: 'Platform-level data for your assigned area' },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, description: 'Data upload and settings management' },
  { value: 'user', label: 'User', icon: <User className="w-5 h-5" />, description: 'Read-only access to permitted dashboards' },
];

const frameworkSteps = [
  {
    icon: Users,
    label: 'Who',
    text: 'Completed by Product / Platform leadership, Voice of Engineer, Voice of Customers',
    delay: '0.3s',
  },
  {
    icon: TrendingUp,
    label: 'Why',
    text: 'Standardise how Platform leadership baseline their current maturity and understand areas of opportunity',
    delay: '0.5s',
  },
  {
    icon: MessageSquare,
    label: 'What',
    text: 'Establish a common language for maturity, helping leaders talk consistently about capability, gaps and progress',
    delay: '0.7s',
  },
  {
    icon: Clock,
    label: 'When',
    text: 'Maturity is a marathon not a sprint — reviewed every six months',
    delay: '0.9s',
  },
];

const howSteps = [
  {
    icon: ClipboardList,
    label: 'How 1',
    text: 'Platform LT review the question bank and answer honestly — a conversation, not a tick box',
    delay: '1.1s',
  },
  {
    icon: UserCheck,
    label: 'How 2',
    text: 'Outputs discussed with a peer leader (SME Leader), BUMD and HBAL to understand challenges',
    delay: '1.3s',
  },
  {
    icon: CheckCircle2,
    label: 'How 3',
    text: 'Platform Leadership review areas of opportunity and consider actions to accelerate maturity',
    delay: '1.5s',
  },
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-8">
      {/* Framework Overview */}
      <div className="w-full max-w-4xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            Platform 4.0 Maturity Measurement
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            A unified framework ensuring consistent understanding of capability, gaps and what 'good' looks like
          </p>
        </div>

        {/* Framework circular flow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {frameworkSteps.map((step) => (
            <div
              key={step.label}
              className="bg-card rounded-xl p-4 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: step.delay, animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</span>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        {/* How steps row with arrows */}
        <div className="flex flex-col md:flex-row items-stretch gap-3 justify-center">
          {howSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div
                className="flex-1 bg-card rounded-xl p-4 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: step.delay, animationFillMode: 'both' }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</span>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.text}</p>
              </div>
              {idx < howSteps.length - 1 && (
                <div className="hidden md:flex items-center animate-fade-in" style={{ animationDelay: step.delay, animationFillMode: 'both' }}>
                  <ArrowRight className="w-5 h-5 text-primary/50" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md animate-scale-in" style={{ animationDelay: '1.7s', animationFillMode: 'both' }}>
        <div className="bg-card rounded-xl p-6 shadow-lg border border-border space-y-5">
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
