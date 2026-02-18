import React from 'react';
import { useAppState } from '@/context/AppContext';
import PillarImprovement from '@/components/PillarImprovement';

const QuarterlyProgressPage: React.FC = () => {
  const { user, cios } = useAppState();
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PillarImprovement platformFilter={supervisorPlatform} />
    </div>
  );
};

export default QuarterlyProgressPage;
