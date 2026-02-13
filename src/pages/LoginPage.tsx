import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, User, Crown, Users, TrendingUp, MessageSquare, Clock, ClipboardList, UserCheck, CheckCircle2, ArrowRight, ChevronRight } from 'lucide-react';

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

        {/* Circular flow — Who/Why/What/When around a central label */}
        <div className="relative mb-6">
          {/* SVG connecting ring */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 800 320"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <ellipse
              cx="400"
              cy="160"
              rx="340"
              ry="120"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray="8 6"
              opacity="0.25"
              className="animate-[spin_60s_linear_infinite] origin-center"
              style={{ transformOrigin: '400px 160px' }}
            />
            {/* Animated dots traveling along the ring */}
            {[0, 1, 2].map((i) => (
              <circle key={i} r="4" fill="hsl(var(--primary))" opacity="0.4">
                <animateMotion
                  dur={`${8 + i * 2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 2}s`}
                >
                  <mpath xlinkHref="#orbitPath" />
                </animateMotion>
              </circle>
            ))}
            <ellipse
              id="orbitPath"
              cx="400"
              cy="160"
              rx="340"
              ry="120"
              fill="none"
              stroke="none"
            />
          </svg>

          {/* Central label */}
          <div className="flex items-center justify-center h-[280px] md:h-[300px]">
            <div className="text-center animate-scale-in z-10" style={{ animationDelay: '0.25s', animationFillMode: 'both' }}>
              <p className="text-lg font-bold text-foreground">Maturity</p>
              <p className="text-lg font-bold text-foreground">Framework</p>
            </div>
          </div>

          {/* Cards positioned around the ellipse */}
          {/* Who — top-left */}
          <div
            className="absolute top-2 left-0 md:left-4 w-[45%] md:w-[220px] bg-card rounded-xl p-3 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Who</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Completed by Product / Platform leadership, Voice of Engineer, Voice of Customers</p>
          </div>

          {/* Why — top-right */}
          <div
            className="absolute top-2 right-0 md:right-4 w-[45%] md:w-[220px] bg-card rounded-xl p-3 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10"
            style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Why</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Standardise how Platform leadership baseline their current maturity and understand areas of opportunity</p>
          </div>

          {/* What — bottom-right */}
          <div
            className="absolute bottom-2 right-0 md:right-4 w-[45%] md:w-[220px] bg-card rounded-xl p-3 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10"
            style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">What</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Common language for maturity, helping leaders talk consistently about capability, gaps and progress</p>
          </div>

          {/* When — bottom-left */}
          <div
            className="absolute bottom-2 left-0 md:left-4 w-[45%] md:w-[220px] bg-card rounded-xl p-3 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10"
            style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
          >
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">When</span>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Maturity is a marathon not a sprint — reviewed every six months</p>
          </div>
        </div>

        {/* How steps row with connecting line + arrows */}
        <div className="relative flex flex-col md:flex-row items-stretch gap-3 justify-center">
          {/* Connecting line behind cards */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] bg-primary/15 -translate-y-1/2 z-0">
            <div
              className="h-full bg-primary/30 origin-left"
              style={{ animation: 'grow-line 1.8s ease-out 1.2s both' }}
            />
          </div>
          {howSteps.map((step, idx) => (
            <React.Fragment key={step.label}>
              <div
                className="flex-1 bg-card rounded-xl p-4 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10 relative"
                style={{ animationDelay: step.delay, animationFillMode: 'both' }}
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</span>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.text}</p>
              </div>
              {idx < howSteps.length - 1 && (
                <div className="hidden md:flex items-center animate-fade-in z-10" style={{ animationDelay: step.delay, animationFillMode: 'both' }}>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
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
