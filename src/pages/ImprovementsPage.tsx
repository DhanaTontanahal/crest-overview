import React from 'react';
import { useAppState } from '@/context/AppContext';
import PillarImprovement from '@/components/PillarImprovement';
import ActionItems from '@/components/ActionItems';

const ImprovementsPage: React.FC = () => {
  const { user, cios } = useAppState();
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <div className="space-y-6">
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <PillarImprovement platformFilter={supervisorPlatform} />
      </div>
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <ActionItems platformFilter={supervisorPlatform} />
      </div>
    </div>
  );
};

export default ImprovementsPage;
