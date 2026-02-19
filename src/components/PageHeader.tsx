import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  infoContent?: string[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, infoContent }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {infoContent && infoContent.length > 0 && (
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="shrink-0 mt-1 w-7 h-7 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
            aria-label={showInfo ? 'Hide details' : 'Show details'}
          >
            {showInfo ? <X className="w-3.5 h-3.5 text-muted-foreground" /> : <Info className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        )}
      </div>
      {showInfo && infoContent && (
        <div className="bg-muted/40 border border-border/60 rounded-lg p-4 text-sm text-muted-foreground animate-fade-in" style={{ animationFillMode: 'forwards' }}>
          <ul className="list-disc list-inside space-y-1">
            {infoContent.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
