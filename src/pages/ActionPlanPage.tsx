import React from 'react';
import { useAppState } from '@/context/AppContext';
import ActionItems from '@/components/ActionItems';

const ActionPlanPage: React.FC = () => {
  const { user, cios } = useAppState();
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <ActionItems platformFilter={supervisorPlatform} />
    </div>
  );
};

export default ActionPlanPage;
