import React from 'react';
import { useAppState } from '@/context/AppContext';
import MaturityTimeline from '@/components/MaturityTimeline';
import TrendingCharts from '@/components/TrendingCharts';
import PageHeader from '@/components/PageHeader';

const TrendsPage: React.FC = () => {
  const { timeSeries, quarterlyTrends } = useAppState();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Trends & Timeline"
        subtitle="Track how maturity, performance, and agility evolve over time across quarters."
        infoContent={[
          'Line charts show month-over-month movement for each key metric.',
          'Quarterly trend bars compare aggregate scores across periods to spot momentum or regression.',
          'Data comes from team-level scores aggregated per quarter.',
        ]}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Maturity Over Time', subtitle: "How does maturity change over time?", dataKey: 'maturity' as const },
          { title: 'Performance Over Time', subtitle: "How does performance change over time?", dataKey: 'performance' as const },
          { title: 'Agility Index Over Time', subtitle: "How does agility change over time?", dataKey: 'agility' as const },
        ].map((tl, i) => (
          <div key={i} className="opacity-0 animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'forwards' }}>
            <MaturityTimeline title={tl.title} subtitle={tl.subtitle} data={timeSeries} dataKey={tl.dataKey} />
          </div>
        ))}
      </div>

      <div className="opacity-0 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        <TrendingCharts trends={quarterlyTrends} />
      </div>
    </div>
  );
};

export default TrendsPage;
