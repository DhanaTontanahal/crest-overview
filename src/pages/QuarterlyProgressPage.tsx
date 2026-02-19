import React from 'react';
import { useAppState } from '@/context/AppContext';
import PillarImprovement from '@/components/PillarImprovement';
import PageHeader from '@/components/PageHeader';

const QuarterlyProgressPage: React.FC = () => {
  const { user, cios } = useAppState();
  const supervisorPlatform = user?.role === 'supervisor' && user.cioId
    ? cios.find(c => c.id === user.cioId)?.platform : undefined;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Quarterly Progress"
        subtitle="Pillar-by-pillar progress tracking — see which areas improved or regressed this quarter."
        infoContent={[
          'Compares current quarter pillar scores against previous quarters.',
          'Green arrows indicate improvement; red arrows indicate regression.',
          'Scores are averaged across all teams within each pillar for the selected platform.',
        ]}
      />
      <PillarImprovement platformFilter={supervisorPlatform} />
    </div>
  );
};

export default QuarterlyProgressPage;
