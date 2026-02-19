import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, UserProfile } from '@/types/maturity';
import { cios, defaultPlatforms } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Eye, User, Crown, Users, TrendingUp, MessageSquare, Clock, ClipboardList, UserCheck, CheckCircle2, FileSearch, ChevronLeft, ChevronRight } from 'lucide-react';
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

/* ── Carousel ── */
const SLIDE_TITLES = ['Framework at a Glance', 'Maturity Framework', 'Assessment to Metrics'];

const LandingCarousel: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const total = 3;
  const goTo = useCallback((i: number) => setCurrent(i), []);
  const next = useCallback(() => setCurrent(c => (c + 1) % total), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + total) % total), []);

  useEffect(() => {
    const t = setInterval(next, 8000);
    return () => clearInterval(t);
  }, [next]);

  const slideStyle = (idx: number): React.CSSProperties => ({
    transform: current === idx ? 'translateX(0)' : current > idx ? 'translateX(-100%)' : 'translateX(100%)',
    opacity: current === idx ? 1 : 0,
    pointerEvents: current === idx ? 'auto' : 'none',
  });

  return (
    <div className="w-full max-w-5xl animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {SLIDE_TITLES.map((t, i) => (
            <button key={i} onClick={() => goTo(i)} className={`text-xs px-3 py-1.5 rounded-full transition-all duration-300 ${i === current ? 'bg-primary text-primary-foreground font-semibold shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
          <button onClick={next} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-sm" style={{ minHeight: 500 }}>
        {/* Slide 0 — Mind Map */}
        <div className="absolute inset-0 p-6 transition-all duration-700 ease-in-out overflow-y-auto" style={slideStyle(0)}>
          <MindMap />
        </div>

        {/* Slide 1 — Framework Circle */}
        <div className="absolute inset-0 p-6 transition-all duration-700 ease-in-out" style={slideStyle(1)}>
          <div className="relative w-full h-full" style={{ minHeight: 460 }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 600 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <circle cx="300" cy="230" r="130" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.1" />
              <circle cx="300" cy="230" r="110" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.2" />
              <circle cx="300" cy="230" r="110" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" opacity="0.7" strokeDasharray="691" strokeDashoffset="691" style={{ animation: current === 1 ? 'draw-circle 2s ease-out 0.2s forwards' : 'none' }} />
              {[0, 1, 2].map(i => (
                <circle key={i} r="4" fill="hsl(var(--primary))" opacity="0.6">
                  <animateMotion dur={`${5 + i * 2}s`} repeatCount="indefinite" begin={`${i * 1.2}s`}><mpath xlinkHref="#cPath" /></animateMotion>
                </circle>
              ))}
              <circle id="cPath" cx="300" cy="230" r="110" fill="none" stroke="none" />
              {[{ x1: 220, y1: 150, x2: 60, y2: 40 }, { x1: 380, y1: 150, x2: 540, y2: 40 }, { x1: 380, y1: 310, x2: 540, y2: 420 }, { x1: 220, y1: 310, x2: 60, y2: 420 }].map((l, i) => (
                <line key={i} {...l} stroke="hsl(var(--primary))" strokeWidth="1.5" opacity="0" strokeDasharray="4 4" style={{ animation: current === 1 ? `fade-line 0.6s ease-out ${0.2 + i * 0.15}s forwards` : 'none' }} />
              ))}
              {[{ cx: 220, cy: 150 }, { cx: 380, cy: 150 }, { cx: 380, cy: 310 }, { cx: 220, cy: 310 }].map((p, i) => (
                <React.Fragment key={i}>
                  <circle cx={p.cx} cy={p.cy} r="16" fill="hsl(var(--primary))" opacity="0"><animate attributeName="opacity" from="0" to="0.1" dur="0.5s" begin={`${0.2 + i * 0.15}s`} fill="freeze" /></circle>
                  <circle cx={p.cx} cy={p.cy} r="5" fill="hsl(var(--primary))" opacity="0">
                    <animate attributeName="opacity" from="0" to="0.4" dur="0.5s" begin={`${0.2 + i * 0.15}s`} fill="freeze" />
                    <animate attributeName="r" values="3;6;3" dur="3s" begin={`${0.8 + i * 0.4}s`} repeatCount="indefinite" />
                  </circle>
                </React.Fragment>
              ))}
            </svg>

            <div className="absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
              <p className="text-xl font-bold text-foreground text-center leading-tight">Maturity</p>
              <p className="text-xl font-bold text-foreground text-center leading-tight">Framework</p>
            </div>

            {[
              { pos: { left: '2%', top: '2%' } as React.CSSProperties, icon: Users, label: 'Who', text: 'Product / Platform leadership, Voice of Engineer & Customers', anim: 'slide-in-left', delay: '0.2s' },
              { pos: { right: '2%', top: '2%' } as React.CSSProperties, icon: TrendingUp, label: 'Why', text: 'Baseline maturity and identify areas of opportunity', anim: 'slide-in-right-custom', delay: '0.4s' },
              { pos: { right: '2%', bottom: '2%' } as React.CSSProperties, icon: MessageSquare, label: 'What', text: 'Common language for capability, gaps and progress', anim: 'slide-in-right-custom', delay: '0.6s' },
              { pos: { left: '2%', bottom: '2%' } as React.CSSProperties, icon: Clock, label: 'When', text: 'Reviewed every six months — a marathon, not a sprint', anim: 'slide-in-left', delay: '0.8s' },
            ].map((item, i) => (
              <div key={i} className="absolute z-10 w-[34%] opacity-0" style={{ ...item.pos, animation: current === 1 ? `${item.anim} 0.6s ease-out ${item.delay} forwards` : 'none' }}>
                <div className="bg-card/90 backdrop-blur-sm rounded-lg p-2.5 border border-border/50 shadow-sm hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0"><item.icon className="w-4 h-4 text-primary-foreground" /></div>
                    <div>
                      <span className="text-xs font-bold text-foreground">{item.label}</span>
                      <p className="text-[11px] text-muted-foreground leading-snug">{item.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slide 2 — Assessment Flow */}
        <div className="absolute inset-0 p-6 transition-all duration-700 ease-in-out" style={slideStyle(2)}>
          <div className="flex flex-col items-center gap-0 max-w-lg mx-auto">
            <h3 className="text-base font-bold text-card-foreground mb-4 text-center">How Assessments Drive Metrics</h3>

            <div className="w-full bg-background border border-border rounded-xl p-4 shadow-sm opacity-0" style={{ animation: current === 2 ? 'scale-in 0.4s ease-out 0.1s forwards' : 'none' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5 text-primary-foreground" /></div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">Self-Assessment Questionnaires</p>
                  <p className="text-[11px] text-muted-foreground">Platform leaders answer structured questions across all pillars</p>
                </div>
              </div>
            </div>

            <div className="relative h-10 w-px">
              <div className="absolute inset-0 bg-primary/20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary opacity-0" style={{ animation: current === 2 ? 'flow-dot 2s ease-in-out 0.5s infinite' : 'none' }} />
            </div>

            <div className="w-full bg-background border border-border rounded-xl p-4 shadow-sm opacity-0" style={{ animation: current === 2 ? 'scale-in 0.4s ease-out 0.3s forwards' : 'none' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center shrink-0"><UserCheck className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-bold text-card-foreground">Peer Review & Calibration</p>
                  <p className="text-[11px] text-muted-foreground">Reviewed with SME leaders and BUMD for consistency</p>
                </div>
              </div>
            </div>

            <div className="relative h-10 w-px">
              <div className="absolute inset-0 bg-primary/20" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary opacity-0" style={{ animation: current === 2 ? 'flow-dot 2s ease-in-out 0.9s infinite' : 'none' }} />
            </div>

            <div className="w-full bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 shadow-sm opacity-0" style={{ animation: current === 2 ? 'scale-in 0.4s ease-out 0.5s forwards' : 'none' }}>
              <p className="text-sm font-bold text-card-foreground mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Metric Outputs</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Stability', color: 'hsl(185, 70%, 50%)', dims: 'Attrition · Tenure · Role Clarity · Succession' },
                  { name: 'Maturity', color: 'hsl(163, 100%, 21%)', dims: 'Clarity · Leadership · Culture · Foundation' },
                  { name: 'Performance', color: 'hsl(155, 60%, 40%)', dims: 'Throughput · Predictability · Deploy Freq. · Lead Time' },
                  { name: 'Agility', color: 'hsl(45, 80%, 50%)', dims: 'Adaptability · Innovation · Time to Market · Responsiveness' },
                ].map((m, i) => (
                  <div key={m.name} className="bg-card/80 rounded-lg p-2.5 border border-border opacity-0 hover:-translate-y-0.5 transition-transform duration-200" style={{ animation: current === 2 ? `slide-up 0.4s ease-out ${0.7 + i * 0.1}s forwards` : 'none', borderLeftWidth: 3, borderLeftColor: m.color }}>
                    <p className="text-xs font-bold text-card-foreground">{m.name}</p>
                    <p className="text-[9px] text-muted-foreground leading-snug mt-0.5">{m.dims}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mt-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full bg-muted overflow-hidden cursor-pointer" onClick={() => goTo(i)}>
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: i <= current ? '100%' : '0%', opacity: i <= current ? 1 : 0.3 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Login Page ── */
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
      {/* Header + Login Card */}
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

        <div className="w-full max-w-sm animate-scale-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
          <div className="bg-card rounded-xl p-5 shadow-lg border border-border space-y-4" role="form" aria-label="Role selection form">
            <div>
              <label id="role-label" className="text-sm font-medium text-card-foreground mb-1.5 block">Select Role</label>
              <Select value={role} onValueChange={(v) => { setRole(v as UserRole); setCioId(''); setUserPlatform(''); }}>
                <SelectTrigger aria-labelledby="role-label"><SelectValue placeholder="Choose your role" /></SelectTrigger>
                <SelectContent>
                  {roleConfig.map(r => (
                    <SelectItem key={r.value} value={r.value}><span className="flex items-center gap-2">{r.icon}{r.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRoleConfig && <p className="text-xs text-muted-foreground mt-1.5 animate-fade-in" role="status">{selectedRoleConfig.description}</p>}
            </div>

            {role === 'supervisor' && (
              <div className="animate-fade-in">
                <label id="cio-label" className="text-sm font-medium text-card-foreground mb-1.5 block">CIO Assignment</label>
                <Select value={cioId} onValueChange={setCioId}>
                  <SelectTrigger aria-labelledby="cio-label"><SelectValue placeholder="Select CIO platform" /></SelectTrigger>
                  <SelectContent>{cios.map(c => <SelectItem key={c.id} value={c.id}>{c.name} — {c.platform}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            {role === 'user' && (
              <div className="animate-fade-in">
                <label id="platform-label" className="text-sm font-medium text-card-foreground mb-1.5 block">Your Platform</label>
                <Select value={userPlatform} onValueChange={setUserPlatform}>
                  <SelectTrigger aria-labelledby="platform-label"><SelectValue placeholder="Select your platform" /></SelectTrigger>
                  <SelectContent>{defaultPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}

            <Button onClick={handleLogin} className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]" size="lg" disabled={!role || (role === 'supervisor' && !cioId) || (role === 'user' && !userPlatform)} aria-label="Sign in with selected role">
              Sign In
            </Button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <LandingCarousel />
    </div>
  );
};

export default LoginPage;
