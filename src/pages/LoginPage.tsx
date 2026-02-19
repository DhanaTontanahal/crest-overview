import React, { useState } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios, defaultPlatforms } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, User, Crown, Users, TrendingUp, MessageSquare, Clock, ClipboardList, UserCheck, CheckCircle2, ArrowRight, FileSearch } from 'lucide-react';
import MindMap from '@/components/MindMap';

interface LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

const roleConfig: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'superuser', label: 'Super User', icon: <Crown className="w-5 h-5" />, description: 'Full organization visibility with consolidated views, heatmaps and drill-downs' },
  { value: 'supervisor', label: 'Supervisor (CIO)', icon: <Eye className="w-5 h-5" />, description: 'Platform-level data for your assigned area' },
  { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, description: 'Data upload and settings management' },
  { value: 'reviewer', label: 'Reviewer', icon: <FileSearch className="w-5 h-5" />, description: 'Review assessments and provide peer feedback' },
  { value: 'user', label: 'User (TPL)', icon: <User className="w-5 h-5" />, description: 'Platform lead — view your platform metrics and pillars' },
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
  const [userPlatform, setUserPlatform] = useState('');

  const handleLogin = () => {
    if (!role) return;
    const roleLabel = role === 'superuser' ? 'Super User' : role === 'supervisor' ? 'Supervisor (CIO)' : role === 'admin' ? 'Admin' : role === 'reviewer' ? 'Reviewer' : 'Platform Lead';
    const profile: UserProfile = {
      name: roleLabel,
      role: role as UserRole,
      cioId: role === 'supervisor' ? cioId : undefined,
      platformId: role === 'user' ? userPlatform : undefined,
    };
    onLogin(profile);
  };

  const selectedRoleConfig = roleConfig.find(r => r.value === role);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 md:p-8 gap-6 overflow-y-auto" role="main" aria-label="Login page">
      {/* Header + Login Card side by side */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center gap-6 animate-fade-in">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-scale-in" aria-hidden="true">
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
          <div className="bg-card rounded-xl p-5 shadow-lg border border-border space-y-4" role="form" aria-label="Role selection form">
            <div>
              <label id="role-label" className="text-sm font-medium text-card-foreground mb-1.5 block">Select Role</label>
              <Select value={role} onValueChange={(v) => { setRole(v as UserRole); setCioId(''); setUserPlatform(''); }}>
                <SelectTrigger aria-labelledby="role-label">
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
                <p className="text-xs text-muted-foreground mt-1.5 animate-fade-in" role="status">{selectedRoleConfig.description}</p>
              )}
            </div>

            {role === 'supervisor' && (
              <div className="animate-fade-in">
                <label id="cio-label" className="text-sm font-medium text-card-foreground mb-1.5 block">CIO Assignment</label>
                <Select value={cioId} onValueChange={setCioId}>
                  <SelectTrigger aria-labelledby="cio-label">
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

            {role === 'user' && (
              <div className="animate-fade-in">
                <label id="platform-label" className="text-sm font-medium text-card-foreground mb-1.5 block">Your Platform</label>
                <Select value={userPlatform} onValueChange={setUserPlatform}>
                  <SelectTrigger aria-labelledby="platform-label">
                    <SelectValue placeholder="Select your platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {defaultPlatforms.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={handleLogin}
              className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              size="lg"
              disabled={!role || (role === 'supervisor' && !cioId) || (role === 'user' && !userPlatform)}
              aria-label="Sign in with selected role"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Framework + Assessment Flow — Two Column */}
      <div className="w-full max-w-5xl animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Compact Framework Circle */}
          <div className="relative" style={{ minHeight: 420 }} aria-label="Maturity Framework visualization" role="img">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
              viewBox="0 0 400 420"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {/* Outer glow ring */}
              <circle cx="200" cy="210" r="130" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.1" />
              {/* Main circle */}
              <circle cx="200" cy="210" r="110" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.2" />
              <circle cx="200" cy="210" r="110" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.7" strokeDasharray="691" strokeDashoffset="691" style={{ animation: 'draw-circle 2s ease-out 0.5s forwards' }} />
              {/* Orbiting dots */}
              {[0, 1, 2].map((i) => (
                <circle key={i} r="4" fill="hsl(var(--primary))" opacity="0.6">
                  <animateMotion dur={`${5 + i * 2}s`} repeatCount="indefinite" begin={`${i * 1.2}s`}>
                    <mpath xlinkHref="#circPath2" />
                  </animateMotion>
                </circle>
              ))}
              <circle id="circPath2" cx="200" cy="210" r="110" fill="none" stroke="none" />
              {/* Animated connector lines */}
              {[
                { x1: 120, y1: 130, x2: 30, y2: 50 },
                { x1: 280, y1: 130, x2: 370, y2: 50 },
                { x1: 280, y1: 290, x2: 370, y2: 370 },
                { x1: 120, y1: 290, x2: 30, y2: 370 },
              ].map((l, i) => (
                <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0" strokeDasharray="4 4" style={{ animation: `fade-line 0.6s ease-out ${0.4 + i * 0.2}s forwards` }} />
              ))}
              {/* Glowing endpoint dots */}
              {[{ cx: 120, cy: 130 }, { cx: 280, cy: 130 }, { cx: 280, cy: 290 }, { cx: 120, cy: 290 }].map((p, i) => (
                <React.Fragment key={i}>
                  <circle cx={p.cx} cy={p.cy} r="18" fill="hsl(var(--primary))" opacity="0">
                    <animate attributeName="opacity" from="0" to="0.1" dur="0.5s" begin={`${0.4 + i * 0.2}s`} fill="freeze" />
                  </circle>
                  <circle cx={p.cx} cy={p.cy} r="6" fill="hsl(var(--primary))" opacity="0">
                    <animate attributeName="opacity" from="0" to="0.4" dur="0.5s" begin={`${0.4 + i * 0.2}s`} fill="freeze" />
                    <animate attributeName="r" values="4;7;4" dur="3s" begin={`${1 + i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                </React.Fragment>
              ))}
            </svg>

            {/* Center label — exactly centered */}
            <div className="absolute z-10 animate-scale-in" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', animationDelay: '0.6s', animationFillMode: 'both' }}>
              <p className="text-lg font-bold text-foreground text-center leading-tight">Maturity</p>
              <p className="text-lg font-bold text-foreground text-center leading-tight">Framework</p>
            </div>

            {/* Who — top-left */}
            <div className="absolute z-10 w-[42%] opacity-0" style={{ left: 0, top: 0, animation: 'slide-in-left 0.6s ease-out 0.4s forwards' }}>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-foreground">Who</span>
                    <p className="text-[10px] text-muted-foreground leading-snug">Product / Platform leadership, Voice of Engineer & Customers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Why — top-right */}
            <div className="absolute z-10 w-[42%] opacity-0" style={{ right: 0, top: 0, animation: 'slide-in-right-custom 0.6s ease-out 0.6s forwards' }}>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-foreground">Why</span>
                    <p className="text-[10px] text-muted-foreground leading-snug">Baseline maturity and identify areas of opportunity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* What — bottom-right */}
            <div className="absolute z-10 w-[42%] opacity-0" style={{ right: 0, bottom: '3%', animation: 'slide-in-right-custom 0.6s ease-out 0.8s forwards' }}>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-foreground">What</span>
                    <p className="text-[10px] text-muted-foreground leading-snug">Common language for capability, gaps and progress</p>
                  </div>
                </div>
              </div>
            </div>

            {/* When — bottom-left */}
            <div className="absolute z-10 w-[42%] opacity-0" style={{ left: 0, bottom: '3%', animation: 'slide-in-left 0.6s ease-out 1.0s forwards' }}>
              <div className="bg-card/80 backdrop-blur-sm rounded-lg p-2 border border-border/50 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                <div className="flex items-start gap-1.5">
                  <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-foreground">When</span>
                    <p className="text-[10px] text-muted-foreground leading-snug">Reviewed every six months — a marathon, not a sprint</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Assessment → Metrics Flow */}
          <div className="flex flex-col items-center gap-0 opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            {/* Step 1: Self Assessment */}
            <div className="w-full bg-card border border-border rounded-xl p-4 shadow-sm opacity-0 animate-scale-in" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">Self-Assessment Questionnaires</p>
                  <p className="text-[11px] text-muted-foreground">Platform leaders answer structured questions across all pillars — honest conversations, not tick boxes</p>
                </div>
              </div>
            </div>

            {/* Animated connector */}
            <div className="relative h-10 w-px">
              <div className="absolute inset-0 bg-primary/20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary opacity-0" style={{ animation: 'flow-dot 2s ease-in-out 1s infinite' }} />
            </div>

            {/* Step 2: Scoring */}
            <div className="w-full bg-card border border-border rounded-xl p-4 shadow-sm opacity-0 animate-scale-in" style={{ animationDelay: '0.9s', animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">Peer Review & Calibration</p>
                  <p className="text-[11px] text-muted-foreground">Responses reviewed with SME leaders and BUMD for consistency and honest reflection</p>
                </div>
              </div>
            </div>

            {/* Animated connector */}
            <div className="relative h-10 w-px">
              <div className="absolute inset-0 bg-primary/20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary opacity-0" style={{ animation: 'flow-dot 2s ease-in-out 1.5s infinite' }} />
            </div>

            {/* Step 3: Metric Outputs */}
            <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 shadow-sm opacity-0 animate-scale-in" style={{ animationDelay: '1.2s', animationFillMode: 'forwards' }}>
              <p className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                Metric Outputs
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Stability', color: 'hsl(185, 70%, 50%)', dims: 'Attrition · Tenure · Role Clarity · Succession' },
                  { name: 'Maturity', color: 'hsl(163, 100%, 21%)', dims: 'Clarity · Leadership · Culture · Foundation' },
                  { name: 'Performance', color: 'hsl(155, 60%, 40%)', dims: 'Throughput · Predictability · Deploy Freq. · Lead Time' },
                  { name: 'Agility', color: 'hsl(45, 80%, 50%)', dims: 'Adaptability · Innovation · Time to Market · Responsiveness' },
                ].map((m, i) => (
                  <div
                    key={m.name}
                    className="bg-card/80 rounded-lg p-2.5 border border-border opacity-0 animate-slide-up hover:-translate-y-0.5 transition-transform duration-200"
                    style={{ animationDelay: `${1.4 + i * 0.12}s`, animationFillMode: 'forwards', borderLeftWidth: 3, borderLeftColor: m.color }}
                  >
                    <p className="text-xs font-bold text-card-foreground">{m.name}</p>
                    <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{m.dims}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How steps row */}
      <div className="w-full max-w-5xl relative flex flex-col md:flex-row items-stretch gap-3 justify-center animate-fade-in" style={{ animationDelay: '1.2s', animationFillMode: 'both' }} role="list" aria-label="How steps">
        <div className="hidden md:block absolute top-1/2 left-[8%] right-[8%] h-[2px] bg-primary/15 -translate-y-1/2 z-0">
          <div className="h-full bg-primary/30 origin-left" style={{ animation: 'grow-line 1.8s ease-out 1.4s both' }} />
        </div>
        {howSteps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div
              className="flex-1 bg-card rounded-xl p-4 border border-border shadow-sm text-center animate-fade-in hover:-translate-y-1 transition-transform duration-300 z-10 relative"
              style={{ animationDelay: `${1.2 + idx * 0.2}s`, animationFillMode: 'both' }}
              role="listitem"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mx-auto mb-2" aria-hidden="true">
                <step.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">{step.label}</span>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{step.text}</p>
            </div>
            {idx < howSteps.length - 1 && (
              <div className="hidden md:flex items-center animate-fade-in z-10" style={{ animationDelay: `${1.3 + idx * 0.2}s`, animationFillMode: 'both' }} aria-hidden="true">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Mind Map */}
      <MindMap />
    </div>
  );
};

export default LoginPage;
