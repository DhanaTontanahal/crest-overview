import React, { useState } from 'react';
import { Gauge, TrendingUp, Zap, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const pillars = [
  'Business & Technology',
  'Run & Change Together',
  'All in One Agile',
  'Project to Product',
  'Engineering Excellence',
  'Dynamic & Well Controlled',
];

const metrics = [
  {
    name: 'Stability',
    icon: Shield,
    color: 'hsl(185, 70%, 50%)',
    colorLight: 'hsl(185, 70%, 92%)',
    dimensions: ['Attrition Rate', 'Tenure', 'Role Clarity', 'Succession Plan'],
  },
  {
    name: 'Maturity',
    icon: Gauge,
    color: 'hsl(163, 100%, 21%)',
    colorLight: 'hsl(163, 60%, 90%)',
    dimensions: ['Clarity', 'Leadership', 'Culture', 'Foundation'],
  },
  {
    name: 'Performance',
    icon: TrendingUp,
    color: 'hsl(155, 60%, 40%)',
    colorLight: 'hsl(155, 60%, 90%)',
    dimensions: ['Throughput', 'Predictability', 'Change Fail Rate', 'Deployment Freq.', 'Mean Time to Deploy', 'Lead Time'],
  },
  {
    name: 'Agility',
    icon: Zap,
    color: 'hsl(45, 80%, 50%)',
    colorLight: 'hsl(45, 80%, 92%)',
    dimensions: ['Adaptability', 'Innovation', 'Time to Market', 'Responsiveness', 'Continuous Improvement'],
  },
];

const MindMap: React.FC = () => {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-lg font-bold text-foreground text-center mb-1 opacity-0 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
        Framework at a Glance
      </h2>
      <p className="text-xs text-muted-foreground text-center mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
        Tap any metric to explore its dimensions
      </p>

      <div className="flex flex-col items-center gap-0">
        {/* Pillars row */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <div className="bg-background border border-border rounded-xl p-4 shadow-sm text-center mb-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">6 Organisational Pillars</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {pillars.map((p, i) => (
                <span
                  key={p}
                  className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-1 rounded-full opacity-0 animate-scale-in"
                  style={{ animationDelay: `${0.25 + i * 0.06}s`, animationFillMode: 'forwards' }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="w-px h-6 bg-border opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }} />

        {/* Central hub */}
        <div className="opacity-0 animate-scale-in" style={{ animationDelay: '0.55s', animationFillMode: 'forwards' }}>
          <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-lg relative">
            <div className="text-center">
              <p className="text-[10px] font-bold text-primary-foreground leading-tight">Measured</p>
              <p className="text-[10px] font-bold text-primary-foreground leading-tight">Across</p>
              <p className="text-lg font-black text-primary-foreground">4</p>
              <p className="text-[9px] text-primary-foreground/80">Metrics</p>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Connector */}
        <div className="w-px h-6 bg-border opacity-0 animate-fade-in" style={{ animationDelay: '0.65s', animationFillMode: 'forwards' }} />

        {/* Metrics grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          {metrics.map((m, i) => {
            const Icon = m.icon;
            const isExpanded = expandedMetric === m.name;
            return (
              <div key={m.name} className="opacity-0 animate-slide-up" style={{ animationDelay: `${0.7 + i * 0.1}s`, animationFillMode: 'forwards' }}>
                <button
                  onClick={() => setExpandedMetric(isExpanded ? null : m.name)}
                  className="w-full bg-background border border-border rounded-xl p-3 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 text-left group"
                  style={{ borderTopColor: m.color, borderTopWidth: 3 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.colorLight }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:animate-[bounce_1s_ease-in-out_infinite]" />}
                  </div>
                  <p className="text-xs font-bold text-card-foreground">{m.name}</p>
                  <p className="text-[9px] text-muted-foreground">{m.dimensions.length} dimensions</p>

                  <div className={`overflow-hidden transition-all duration-500 ease-out ${isExpanded ? 'max-h-60 opacity-100 mt-2' : 'max-h-0 opacity-0 mt-0'}`}>
                    <div className="border-t border-border pt-2 space-y-1">
                      {m.dimensions.map((d, di) => (
                        <div key={d} className={`flex items-center gap-1.5 text-[11px] text-card-foreground ${isExpanded ? 'animate-fade-in' : ''}`} style={isExpanded ? { animationDelay: `${di * 0.05}s`, animationFillMode: 'forwards' } : {}}>
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MindMap;
