import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { CalculationMethod } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Info, Calculator } from 'lucide-react';

interface EditableListProps {
  title: string;
  items: string[];
  onUpdate: (items: string[]) => void;
}

const EditableList: React.FC<EditableListProps> = ({ title, items, onUpdate }) => {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onUpdate([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const remove = (idx: number) => {
    onUpdate(items.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <h4 className="font-semibold text-card-foreground mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
            {item}
            <button onClick={() => remove(i)} className="hover:text-destructive" aria-label={`Remove ${item}`}>
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}...`}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="max-w-[200px]"
        />
        <Button size="sm" onClick={add}><Plus className="w-4 h-4" /></Button>
      </div>
    </div>
  );
};

const calculationMethodInfo: Record<CalculationMethod, { label: string; description: string; formula: string; bestFor: string }> = {
  simple: {
    label: 'Simple Average',
    description: 'Adds all team values and divides by the number of teams. Every team contributes equally regardless of size or importance.',
    formula: 'Sum of all values ÷ Number of teams',
    bestFor: 'Equal-sized teams where each team carries the same strategic weight.',
  },
  weighted: {
    label: 'Weighted Average',
    description: 'Each metric is multiplied by its configured weight (from Dimension Charts) before averaging. Higher-weighted dimensions have more influence on the final score.',
    formula: '(Value₁ × Weight₁ + Value₂ × Weight₂ + ...) ÷ Sum of weights',
    bestFor: 'When certain dimensions (e.g., Stability) matter more than others for organizational health.',
  },
  median: {
    label: 'Median',
    description: 'Sorts all team values and picks the middle value. Outliers (extremely high or low performers) do not skew the result.',
    formula: 'Middle value when all scores are sorted',
    bestFor: 'When you have outlier teams that would distort the average (e.g., one team at 95% and rest at 40%).',
  },
  trimmed: {
    label: 'Trimmed Mean (10%)',
    description: 'Removes the top 10% and bottom 10% of values, then calculates a simple average of the remaining. Balances robustness against outliers with simplicity.',
    formula: 'Remove top & bottom 10% → Average the rest',
    bestFor: 'Large datasets where a few extreme values should be excluded but you still want an average-style metric.',
  },
};

const AdminSettings: React.FC = () => {
  const { platforms, setPlatforms, pillars, setPillars, calculationMethod, setCalculationMethod } = useAppState();
  const currentInfo = calculationMethodInfo[calculationMethod];

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-6" role="region" aria-label="Admin settings">
      <h3 className="text-lg font-semibold text-card-foreground">Customize Data Categories</h3>
      <EditableList title="Platforms" items={platforms} onUpdate={setPlatforms} />
      <EditableList title="Pillars" items={pillars} onUpdate={setPillars} />

      {/* Calculation Method */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-card-foreground">Metric Calculation Method</h4>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Controls how gauge speedometers, heatmap cells, and bar chart values are computed from team-level data uploaded via Excel/CSV.
        </p>

        <Select value={calculationMethod} onValueChange={(v) => setCalculationMethod(v as CalculationMethod)}>
          <SelectTrigger className="w-full max-w-[300px] bg-background" aria-label="Select calculation method">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent className="bg-popover z-50">
            {(Object.keys(calculationMethodInfo) as CalculationMethod[]).map(method => (
              <SelectItem key={method} value={method}>
                {calculationMethodInfo[method].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Explanation card */}
        <div className="mt-4 p-4 rounded-lg bg-muted/40 border border-border/50 space-y-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">{currentInfo.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{currentInfo.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2 rounded bg-background border border-border/30">
              <p className="font-medium text-muted-foreground mb-1">Formula</p>
              <p className="text-foreground font-mono text-xs">{currentInfo.formula}</p>
            </div>
            <div className="p-2 rounded bg-background border border-border/30">
              <p className="font-medium text-muted-foreground mb-1">Best For</p>
              <p className="text-foreground">{currentInfo.bestFor}</p>
            </div>
          </div>

          {/* Data flow explanation */}
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs font-medium text-muted-foreground mb-2">How data flows into charts:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>📊 <span className="text-foreground font-medium">Gauges</span> — {currentInfo.label} of Stability, Maturity, Performance & Agility from <span className="text-foreground">Team Data (Excel/CSV)</span></p>
              <p>🗺️ <span className="text-foreground font-medium">Heatmaps</span> — {currentInfo.label} per Platform × Pillar from <span className="text-foreground">Team Data</span></p>
              <p>📈 <span className="text-foreground font-medium">Bar Charts</span> — {currentInfo.label} per Platform from <span className="text-foreground">Team Data</span></p>
              <p>🎯 <span className="text-foreground font-medium">Radar & Assessments</span> — Scores from <span className="text-foreground">TPL Assessment submissions</span> (not affected by this setting)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
