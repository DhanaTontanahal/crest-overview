import React, { useState } from 'react';
import { UserProfile } from '@/types/maturity';
import { defaultPlatforms } from '@/data/dummyData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, User, Eye } from 'lucide-react';

interface V0LoginPageProps {
  onLogin: (profile: UserProfile) => void;
}

type V0Role = 'admin' | 'user' | 'reviewer';

const v0Roles: { value: V0Role; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, description: 'Create and manage assessments, settings, and data' },
  { value: 'user', label: 'User', icon: <User className="w-5 h-5" />, description: 'Complete self-assessments for your platform' },
  { value: 'reviewer', label: 'Peer Reviewer', icon: <Eye className="w-5 h-5" />, description: 'Review and calibrate peer assessments' },
];

const V0LoginPage: React.FC<V0LoginPageProps> = ({ onLogin }) => {
  const [role, setRole] = useState<V0Role | ''>('');
  const [userPlatform, setUserPlatform] = useState('');

  const handleLogin = () => {
    if (!role) return;
    const labels: Record<V0Role, string> = { admin: 'Admin', user: 'Platform Lead', reviewer: 'Peer Reviewer' };
    const profile: UserProfile = {
      name: labels[role],
      role: role,
      platformId: role === 'user' ? userPlatform : undefined,
    };
    onLogin(profile);
  };

  const selected = v0Roles.find(r => r.value === role);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 gap-8">
      <div className="text-center animate-fade-in space-y-3 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
          v0 — 3-Role Model
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">
          Platform 4.0 Maturity
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Simplified assessment workflow — Admin creates, Users self-assess, Reviewers calibrate.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
        {v0Roles.map((r, i) => (
          <button
            key={r.value}
            onClick={() => { setRole(r.value); setUserPlatform(''); }}
            className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left hover:shadow-md ${
              role === r.value
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/40'
            }`}
            style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'both' }}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
              role === r.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}>
              {r.icon}
            </div>
            <p className="font-semibold text-foreground">{r.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
            {role === r.value && (
              <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-primary animate-scale-in" />
            )}
          </button>
        ))}
      </div>

      {/* Platform select for User */}
      {role === 'user' && (
        <div className="w-full max-w-sm animate-fade-in">
          <label className="text-sm font-medium text-foreground mb-1.5 block">Your Platform</label>
          <Select value={userPlatform} onValueChange={setUserPlatform}>
            <SelectTrigger><SelectValue placeholder="Select your platform" /></SelectTrigger>
            <SelectContent>{defaultPlatforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      )}

      {/* Sign In */}
      <Button
        onClick={handleLogin}
        size="lg"
        className="w-full max-w-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
        disabled={!role || (role === 'user' && !userPlatform)}
      >
        Sign In as {selected?.label || '...'}
      </Button>

      {/* Link to v1 */}
      <p className="text-xs text-muted-foreground">
        Need the full 5-role experience? <a href="/" className="text-primary underline hover:no-underline">Go to v1</a>
      </p>
    </div>
  );
};

export default V0LoginPage;
