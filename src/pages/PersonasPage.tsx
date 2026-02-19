import React from 'react';
import { Crown, Eye, Shield, User, FileSearch } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const personas = [
  { role: 'Super User', icon: Crown, color: 'from-accent to-accent/70' },
  { role: 'Reviewer', icon: FileSearch, color: 'from-primary to-primary/70' },
  { role: 'Supervisor (CIO)', icon: Eye, color: 'from-chart-teal to-chart-cyan' },
  { role: 'Admin', icon: Shield, color: 'from-chart-gold to-chart-orange' },
  { role: 'User (TPL)', icon: User, color: 'from-chart-green1 to-chart-green3' },
];

const PersonasPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Personas"
        subtitle="Role-based access levels that control what each user sees across the dashboard."
        infoContent={[
          'Super User: Full organisational visibility including executive heatmaps and radar charts.',
          'Supervisor (CIO): Restricted to their assigned platform with drill-down into sub-platforms.',
          'Admin: Data and system management — uploads, settings, and assessment configuration.',
          'User (TPL): Platform lead view with gauges and comparison against the organisation average.',
          'Reviewer: Focused on assessment views and peer reviews.',
        ]}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4" role="list" aria-labelledby="personas-heading">
        {personas.map((persona, idx) => (
          <div
            key={persona.role}
            className="group flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-6 shadow-sm animate-slide-up hover:-translate-y-1 transition-transform duration-300"
            style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}
            role="listitem"
            aria-label={`${persona.role} persona`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
              <persona.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-card-foreground text-center">{persona.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonasPage;
