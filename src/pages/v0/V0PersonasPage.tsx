import React from 'react';
import { Shield, User, Eye } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const personas = [
  { role: 'Admin', icon: Shield, color: 'from-chart-gold to-chart-orange', description: 'Create and manage assessments, settings, and data uploads.' },
  { role: 'User', icon: User, color: 'from-chart-green1 to-chart-green3', description: 'Complete self-assessments for your platform.' },
  { role: 'Peer Reviewer', icon: Eye, color: 'from-primary to-primary/70', description: 'Review and calibrate peer assessments.' },
];

const V0PersonasPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader
        title="Personas"
        subtitle="The v0 3-role model that powers the assessment lifecycle."
        infoContent={[
          'Admin: Creates assessments, manages settings, uploads data, and oversees the process.',
          'User: Completes self-assessments for their assigned platform across all pillars and dimensions.',
          'Peer Reviewer: Reviews submitted assessments, calibrates scores, and provides feedback.',
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" role="list" aria-labelledby="personas-heading">
        {personas.map((persona, idx) => (
          <div
            key={persona.role}
            className="group flex flex-col items-center gap-3 bg-card rounded-xl border border-border p-8 shadow-sm animate-slide-up hover:-translate-y-1 transition-transform duration-300"
            style={{ animationDelay: `${idx * 0.08}s`, animationFillMode: 'both' }}
            role="listitem"
            aria-label={`${persona.role} persona`}
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${persona.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
              <persona.icon className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-card-foreground text-center">{persona.role}</span>
            <p className="text-xs text-muted-foreground text-center">{persona.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default V0PersonasPage;
