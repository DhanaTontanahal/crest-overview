import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminAssignReviewersPage: React.FC = () => {
  const { user, assessments, setAssessments, platforms, selectedQuarter } = useAppState();
  const [assignments, setAssignments] = useState<Record<string, string>>({});

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  const quarterAssessments = assessments.filter(
    a => a.quarter === selectedQuarter && (a.status === 'submitted' || a.status === 'reviewed')
  );

  const handleAssign = (assessmentId: string) => {
    const reviewer = assignments[assessmentId];
    if (!reviewer) return;
    setAssessments(prev =>
      prev.map(a =>
        a.id === assessmentId
          ? { ...a, reviewedBy: reviewer, status: 'reviewed' as const, reviewedAt: new Date().toISOString().split('T')[0] }
          : a
      )
    );
    toast.success(`Assigned reviewer "${reviewer}" to assessment`);
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Assign Reviewers"
        subtitle={`Assign peer reviewers to submitted assessments for ${selectedQuarter}.`}
      />

      {quarterAssessments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No submitted assessments for {selectedQuarter} yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {quarterAssessments.map(a => (
            <Card key={a.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {a.platform}
                    <Badge variant={a.status === 'reviewed' ? 'default' : 'secondary'}>
                      {a.status}
                    </Badge>
                  </span>
                  {a.reviewedBy && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> {a.reviewedBy}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <span>Submitted: {a.submittedAt}</span>
                  <span>Avg: {a.answers.length > 0 ? (a.answers.reduce((s, ans) => s + ans.score, 0) / a.answers.length).toFixed(1) : '—'}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={assignments[a.id] || ''}
                    onValueChange={v => setAssignments(prev => ({ ...prev, [a.id]: v }))}
                  >
                    <SelectTrigger className="w-[200px] h-8 text-xs">
                      <SelectValue placeholder="Select reviewer..." />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms
                        .filter(p => p !== a.platform)
                        .map(p => (
                          <SelectItem key={p} value={p}>{p} Lead</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={() => handleAssign(a.id)}
                    disabled={!assignments[a.id]}
                  >
                    Assign
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAssignReviewersPage;
