import React, { useState, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, AlertCircle, Link2, Unlink, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RegisteredUser {
  id: string;
  email: string;
  fullName: string;
  platform: string;
  role: 'user' | 'reviewer';
  createdAt: string;
}

const AdminAssignReviewersPage: React.FC = () => {
  const { user, assessments, setAssessments, availableQuarters } = useAppState();
  const [selectedQuarter, setSelectedQuarter] = useState(availableQuarters[0] || 'Q4 2025');
  const [pendingAssignments, setPendingAssignments] = useState<Record<string, string>>({});

  const registeredUsers: RegisteredUser[] = useMemo(() => {
    try {
      const s = localStorage.getItem('registeredUsers');
      return s ? JSON.parse(s) : [];
    } catch {
      return [];
    }
  }, []);

  const reviewers = registeredUsers.filter(u => u.role === 'reviewer');

  // Show all assessments for the quarter
  const quarterAssessments = assessments.filter(a => a.quarter === selectedQuarter);

  // Group assessments by name
  const grouped = useMemo(() => {
    const map: Record<string, typeof quarterAssessments> = {};
    quarterAssessments.forEach(a => {
      const key = a.name || 'Untitled';
      (map[key] ??= []).push(a);
    });
    return Object.entries(map);
  }, [quarterAssessments]);

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  // Group assessments by name
  const grouped = useMemo(() => {
    const map: Record<string, typeof quarterAssessments> = {};
    quarterAssessments.forEach(a => {
      const key = a.name || 'Untitled';
      (map[key] ??= []).push(a);
    });
    return Object.entries(map);
  }, [quarterAssessments]);

  const handleAssign = (assessmentId: string) => {
    const reviewerName = pendingAssignments[assessmentId];
    if (!reviewerName) return;
    setAssessments(prev =>
      prev.map(a =>
        a.id === assessmentId
          ? { ...a, reviewedBy: reviewerName }
          : a
      )
    );
    setPendingAssignments(prev => { const n = { ...prev }; delete n[assessmentId]; return n; });
    toast.success(`Assigned "${reviewerName}" as reviewer`);
  };

  const handleUnassign = (assessmentId: string) => {
    setAssessments(prev =>
      prev.map(a =>
        a.id === assessmentId
          ? { ...a, reviewedBy: null, reviewedAt: null, status: a.status === 'reviewed' ? 'submitted' as const : a.status }
          : a
      )
    );
    toast.success('Reviewer unassigned');
  };

  const statusColor = (s: string) =>
    s === 'published' ? 'default' : s === 'reviewed' ? 'default' : s === 'submitted' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <PageHeader
          title="Assign Reviewers"
          subtitle="Map registered peer reviewers to assessments."
        />
        <select
          value={selectedQuarter}
          onChange={e => setSelectedQuarter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {availableQuarters.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      {/* Reviewers summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            Registered Peer Reviewers ({reviewers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reviewers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No peer reviewers registered yet. Go to <span className="font-medium">Register Users</span> to add reviewers.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {reviewers.map(r => {
                const assignedCount = quarterAssessments.filter(a => a.reviewedBy === r.fullName).length;
                return (
                  <div key={r.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-xs">
                    <span className="font-medium text-foreground">{r.fullName}</span>
                    <Badge variant="secondary" className="text-[9px]">{r.platform}</Badge>
                    {assignedCount > 0 && (
                      <Badge variant="outline" className="text-[9px]">{assignedCount} assigned</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessments with reviewer mapping */}
      {grouped.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No assessments for {selectedQuarter}. Create assessments first.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([name, items]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{name}</span>
                <Badge variant="outline" className="text-[10px]">{items.length} platform{items.length > 1 ? 's' : ''}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map(a => (
                  <div key={a.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/60 bg-muted/10">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{a.platform}</p>
                      <Badge variant={statusColor(a.status) as any} className="text-[10px] capitalize">{a.status}</Badge>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {a.reviewedBy ? (
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium text-foreground">{a.reviewedBy}</span>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleUnassign(a.id)}>
                            <Unlink className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={pendingAssignments[a.id] || ''}
                            onValueChange={v => setPendingAssignments(prev => ({ ...prev, [a.id]: v }))}
                          >
                            <SelectTrigger className="w-[160px] h-7 text-[11px]">
                              <SelectValue placeholder="Select reviewer..." />
                            </SelectTrigger>
                            <SelectContent>
                              {reviewers.map(r => (
                                <SelectItem key={r.id} value={r.fullName}>
                                  {r.fullName} ({r.platform})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" className="h-7 text-[11px] px-2" onClick={() => handleAssign(a.id)} disabled={!pendingAssignments[a.id]}>
                            <Link2 className="w-3 h-3 mr-1" /> Assign
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default AdminAssignReviewersPage;
