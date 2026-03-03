import React from 'react';
import { useAppState } from '@/context/AppContext';
import { CalculationMethod } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Info } from 'lucide-react';

const calculationMethodInfo: Record<CalculationMethod, { label: string; description: string; formula: string; bestFor: string }> = {
  simple: {
    label: 'Simple Average',
    description: 'Adds all team values and divides by the number of teams.',
    formula: 'Sum of all values ÷ Number of teams',
    bestFor: 'Equal-sized teams where each carries the same strategic weight.',
  },
  weighted: {
    label: 'Weighted Average',
    description: 'Each metric is multiplied by its configured weight before averaging.',
    formula: '(Value₁ × Weight₁ + Value₂ × Weight₂ + ...) ÷ Sum of weights',
    bestFor: 'When certain dimensions matter more than others.',
  },
  median: {
    label: 'Median',
    description: 'Sorts all values and picks the middle value. Outliers do not skew the result.',
    formula: 'Middle value when all scores are sorted',
    bestFor: 'When you have outlier teams that would distort the average.',
  },
  trimmed: {
    label: 'Trimmed Mean (10%)',
    description: 'Removes top and bottom 10%, then averages the rest.',
    formula: 'Remove top & bottom 10% → Average the rest',
    bestFor: 'Large datasets where extreme values should be excluded.',
  },
};

const AdminSettingsPage: React.FC = () => {
  const { user, calculationMethod, setCalculationMethod } = useAppState();
  const currentInfo = calculationMethodInfo[calculationMethod];

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader title="Settings" subtitle="Configure metric calculation and system preferences." />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-primary" />
            <h4 className="font-semibold text-card-foreground">Metric Calculation Method</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            Controls how gauge speedometers, heatmap cells, and bar chart values are computed.
          </p>

          <Select value={calculationMethod} onValueChange={v => setCalculationMethod(v as CalculationMethod)}>
            <SelectTrigger className="w-full max-w-[300px] bg-background">
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(calculationMethodInfo) as CalculationMethod[]).map(method => (
                <SelectItem key={method} value={method}>{calculationMethodInfo[method].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="p-4 rounded-lg bg-muted/40 border border-border/50 space-y-3">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
