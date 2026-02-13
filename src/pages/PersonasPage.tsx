import React from 'react';
import { Building2, Crown, Eye, Shield, User } from 'lucide-react';

const personas = [
  {
    role: 'LTC CEO',
    icon: Building2,
    description: 'Consolidated high-level view across Business Agility, Excellence & Stability',
    access: ['Organization health overview', 'Cross-platform trends', 'Strategic KPIs'],
    color: 'from-primary to-primary/70',
  },
  {
    role: 'Super User',
    icon: Crown,
    description: 'Full organization visibility across all CIOs and platforms',
    access: ['All dashboards & dimensions', 'Team data exports', 'Assessment reviews'],
    color: 'from-accent to-accent/70',
  },
  {
    role: 'Supervisor (CIO)',
    icon: Eye,
    description: 'Platform-level data for your assigned area',
    access: ['Platform-scoped metrics', 'Team comparisons', 'Pillar breakdowns'],
    color: 'from-chart-teal to-chart-cyan',
  },
  {
    role: 'Admin',
    icon: Shield,
    description: 'Data upload and settings management',
    access: ['Excel data upload', 'Platform & pillar config', 'Persona management'],
    color: 'from-chart-gold to-chart-orange',
  },
  {
    role: 'User (TPL)',
    icon: User,
    description: 'Platform lead — view your platform metrics and pillars',
    access: ['Own platform dashboard', 'Submit assessments', 'Peer reviews'],
    color: 'from-chart-green1 to-chart-green3',
  },
];

const PersonasPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <div>
        <h2 className="text-2xl font-bold text-foreground">Role Personas</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of all system roles and their access levels
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {personas.map((persona, idx) => (
          <div
            key={persona.role}
            className="group bg-card rounded-xl border border-border shadow-sm overflow-hidden animate-slide-up hover:-translate-y-1 transition-transform duration-300"
            style={{ animationDelay: `${idx * 0.1}s`, animationFillMode: 'both' }}
          >
            {/* Gradient header */}
            <div className={`h-2 bg-gradient-to-r ${persona.color}`} />

            <div className="p-5 space-y-4">
              {/* Icon + title */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${persona.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <persona.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground">{persona.role}</h3>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {persona.description}
              </p>

              {/* Access list */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Access</span>
                <ul className="space-y-1">
                  {persona.access.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-card-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${persona.color} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonasPage;
