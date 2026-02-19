import React from 'react';
import { useAppState } from '@/context/AppContext';
import DimensionChart from '@/components/DimensionChart';
import PageHeader from '@/components/PageHeader';

const DimensionsPage: React.FC = () => {
  const { maturityDimensions, performanceMetrics, stabilityDimensions, agilityDimensions } = useAppState();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Metric Dimensions"
        subtitle="Breakdown of each metric into its contributing dimensions — driven by assessment responses."
        infoContent={[
          'Dimension scores are derived from platform self-assessment responses (1–5 scale, scaled ×2 to 2–10).',
          'Each dimension represents a sub-metric within Stability, Maturity, Performance, or Agility.',
          'Scores update automatically when new assessments are submitted for the selected quarter.',
          'Use the platform and pillar filters in the header to narrow the view.',
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        <DimensionChart title="Stability Dimensions" subtitle="How do the various dimensions contribute to overall stability?" dimensions={stabilityDimensions} />
      </div>
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
        <DimensionChart title="Maturity Dimensions" subtitle="How do the various dimensions contribute to overall maturity?" dimensions={maturityDimensions} />
      </div>
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <DimensionChart title="Performance Metrics" subtitle="How do the various metrics contribute to overall performance?" dimensions={performanceMetrics} />
      </div>
      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
        <DimensionChart title="Agility Dimensions" subtitle="How do the various dimensions contribute to overall agility?" dimensions={agilityDimensions} />
      </div>
      </div>
    </div>
  );
};

export default DimensionsPage;
