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
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8 gap-6 overflow-y-auto">
      {/* Header + Login Card side by side */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-6 animate-fade-in">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-scale-in">
              <Crown className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Platform 4.0 Maturity Measurement</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg">
            A unified framework ensuring consistent understanding of capability, gaps and what 'good' looks like
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-sm animate-scale-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div className="bg-card rounded-xl p-5 shadow-lg border border-border space-y-4">
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

      {/* Circular Framework Visual */}
      <div className="w-full max-w-5xl relative animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="relative mx-auto" style={{ maxWidth: 720, aspectRatio: '720/520' }}>
          {/* SVG circle with animated dots */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            viewBox="0 0 720 520"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            {/* Main circle path */}
            <circle
              cx="280"
              cy="240"
              r="180"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              opacity="0.3"
            />
            {/* Animated drawing of circle */}
            <circle
              cx="280"
              cy="240"
              r="180"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              opacity="0.6"
              strokeDasharray="1131"
              strokeDashoffset="1131"
              style={{ animation: 'draw-circle 2s ease-out 0.5s forwards' }}
            />
            {/* Traveling dots */}
            {[0, 1, 2].map((i) => (
              <circle key={i} r="5" fill="hsl(var(--primary))" opacity="0.5">
                <animateMotion
                  dur={`${6 + i * 2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 1.5}s`}
                >
                  <mpath xlinkHref="#circPath" />
                </animateMotion>
              </circle>
            ))}
            <circle
              id="circPath"
              cx="280"
              cy="240"
              r="180"
              fill="none"
              stroke="none"
            />

            {/* Connector lines from circle to cards */}
            {/* Who — top-left: from circle top-left ~(140, 130) toward Who card */}
            <line x1="140" y1="130" x2="40" y2="40" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />
            {/* Why — right: from circle right (460, 160) toward Why card */}
            <line x1="460" y1="160" x2="520" y2="80" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />
            {/* What — right-mid: from circle right (460, 280) toward What card */}
            <line x1="460" y1="280" x2="520" y2="300" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />
            {/* When — bottom-left: from circle bottom-left (140, 370) toward When card */}
            <line x1="140" y1="370" x2="40" y2="430" stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0.2" strokeDasharray="4 4" />

            {/* Icon circles on the ring */}
            {[ 
              { cx: 140, cy: 130 }, // Who position on ring
              { cx: 440, cy: 140 }, // Why position on ring  
              { cx: 440, cy: 340 }, // What position on ring
              { cx: 140, cy: 370 }, // When position on ring
            ].map((pos, i) => (
              <circle key={i} cx={pos.cx} cy={pos.cy} r="20" fill="hsl(var(--primary))" opacity="0.15" />
            ))}
          </svg>

          {/* Central label */}
          <div
            className="absolute z-10 animate-scale-in"
            style={{ left: '28%', top: '38%', transform: 'translate(-50%, -50%)', animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            <p className="text-xl md:text-2xl font-bold text-foreground text-center leading-tight">Maturity</p>
            <p className="text-xl md:text-2xl font-bold text-foreground text-center leading-tight">Framework</p>
          </div>

          {/* Who — top-left */}
          <div
            className="absolute z-10 w-[40%] md:w-[200px] animate-fade-in"
            style={{ left: 0, top: 0, animationDelay: '0.4s', animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-2">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Users className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">Who:</span>
                <p className="text-[11px] text-muted-foreground leading-snug">Completed by Product / Platform leadership, Voice of Engineer, Voice of Customers</p>
              </div>
            </div>
          </div>

          {/* Why — right upper */}
          <div
            className="absolute z-10 w-[40%] md:w-[220px] animate-fade-in"
            style={{ right: 0, top: '10%', animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-2">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">Why:</span>
                <p className="text-[11px] text-muted-foreground leading-snug">Standardise how Platform leadership baseline their current maturity and understand areas of opportunity</p>
              </div>
            </div>
          </div>

          {/* What — right lower */}
          <div
            className="absolute z-10 w-[40%] md:w-[240px] animate-fade-in"
            style={{ right: 0, top: '48%', animationDelay: '0.8s', animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-2">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">What:</span>
                <p className="text-[11px] text-muted-foreground leading-snug">Establish a common language for maturity, helping leaders talk consistently about capability, gaps and progress</p>
              </div>
            </div>
          </div>

          {/* When — bottom-left */}
          <div
            className="absolute z-10 w-[40%] md:w-[200px] animate-fade-in"
            style={{ left: 0, bottom: '5%', animationDelay: '1.0s', animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-2">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">When:</span>
                <p className="text-[11px] text-muted-foreground leading-snug">Maturity is a marathon not a sprint — reviewed every six months</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How steps row */}
      <div className="w-full max-w-5xl relative flex flex-col md:flex-row items-stretch gap-3 justify-center animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }}>
        {/* Connecting line */}
        <div className="hidden md:block absolute top-1/2 left-[8%] right-[8%] h-[2px] bg-primary/15 -translate-y-1/2 z-0">
          <div className="h-full bg-primary/30 origin-left" style={{ animation: 'grow-line 1.8s ease-out 1.4s both' }} />
        </div>
        {howSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div
              className="flex-1 bg-card rounded-xl p-4 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10 relative"
              style={{ animationDelay: `${1.2 + idx * 0.2}s`, animationFillMode: 'both' }}
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</span>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.text}</p>
            </div>
            {idx < howSteps.length - 1 && (
              <div className="hidden md:flex items-center animate-fade-in z-10" style={{ animationDelay: `${1.3 + idx * 0.2}s`, animationFillMode: 'both' }}>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default LoginPage;
