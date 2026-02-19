import React from 'react';
import { useAppState } from '@/context/AppContext';
import ActionItems from '@/components/ActionItems';
import PageHeader from '@/components/PageHeader';

const ActionPlanPage: React.FC = () => {
  const { user, cios } = useAppState();
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Action Plan"
        subtitle="Prioritised actions to address the weakest areas across platforms and pillars."
        infoContent={[
          'Actions are ranked by severity — critical items appear first.',
          'Each action is tied to a specific platform, pillar, and metric dimension.',
          'Track progress by marking items as in-progress or complete.',
        ]}
      />
      <ActionItems platformFilter={supervisorPlatform} />
    </div>
  );
};

export default ActionPlanPage;
