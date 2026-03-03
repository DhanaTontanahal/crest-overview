import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Mail, User, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface RegisteredUser {
  id: string;
  email: string;
  fullName: string;
  platform: string;
  role: 'user' | 'reviewer';
  createdAt: string;
}

const AdminRegisterUsersPage: React.FC = () => {
  const { user, platforms } = useAppState();
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    try {
      const s = localStorage.getItem('registeredUsers');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [platform, setPlatform] = useState('');
  const [role, setRole] = useState<'user' | 'reviewer'>('user');

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  const handleRegister = () => {
    if (!email || !password || !fullName || !platform) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (users.some(u => u.email === email)) {
      toast.error('A user with this email already exists.');
      return;
    }

    const newUser: RegisteredUser = {
      id: `user-${Date.now()}`,
      email,
      fullName,
      platform,
      role,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [...users, newUser];
    setUsers(updated);
    localStorage.setItem('registeredUsers', JSON.stringify(updated));
    toast.success(`Registered ${fullName} (${email})`);

    setEmail('');
    setPassword('');
    setFullName('');
    setPlatform('');
    setRole('user');
  };

  const handleDelete = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    setUsers(updated);
    localStorage.setItem('registeredUsers', JSON.stringify(updated));
    toast.success('User removed');
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Register Users"
        subtitle="Create user accounts for platform leads and peer reviewers."
      />

      {/* Registration Form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" /> New User
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs flex items-center gap-1">
                <User className="w-3 h-3" /> Full Name
              </Label>
              <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs flex items-center gap-1">
                <Mail className="w-3 h-3" /> Email
              </Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@company.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs flex items-center gap-1">
                <KeyRound className="w-3 h-3" /> Password
              </Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue placeholder="Select platform..." /></SelectTrigger>
                <SelectContent>
                  {platforms.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={role} onValueChange={v => setRole(v as 'user' | 'reviewer')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Platform Lead (User)</SelectItem>
                  <SelectItem value="reviewer">Peer Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleRegister} className="mt-2">
            <UserPlus className="w-4 h-4 mr-1" /> Register User
          </Button>
        </CardContent>
      </Card>

      {/* User List */}
      {users.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Registered Users ({users.length})</h4>
          <div className="grid gap-2">
            {users.map(u => (
              <Card key={u.id}>
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.fullName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{u.platform}</Badge>
                    <Badge variant="outline" className="text-[10px]">{u.role === 'user' ? 'Platform Lead' : 'Peer Reviewer'}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">{u.createdAt}</span>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(u.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisterUsersPage;
