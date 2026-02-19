import React from 'react';
import { useAppState } from '@/context/AppContext';
import DimensionChart from '@/components/DimensionChart';

const DimensionsPage: React.FC = () => {
  const { maturityDimensions, performanceMetrics, stabilityDimensions, agilityDimensions } = useAppState();

  return (
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
  );
};

export default DimensionsPage;
