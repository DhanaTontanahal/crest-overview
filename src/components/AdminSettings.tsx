import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus } from 'lucide-react';

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
            <button onClick={() => remove(i)} className="hover:text-destructive">
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

const AdminSettings: React.FC = () => {
  const { platforms, setPlatforms, pillars, setPillars } = useAppState();

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm border border-border space-y-6">
      <h3 className="text-lg font-semibold text-card-foreground">Customize Data Categories</h3>
      <EditableList title="Platforms" items={platforms} onUpdate={setPlatforms} />
      <EditableList title="Pillars" items={pillars} onUpdate={setPillars} />
    </div>
  );
};

export default AdminSettings;
