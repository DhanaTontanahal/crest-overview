import React, { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminPlatformsCRUDPage: React.FC = () => {
  const { user, platforms, setPlatforms } = useAppState();
  const [newItem, setNewItem] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  if (user?.role !== 'admin') return <p className="text-muted-foreground">Admin only.</p>;

  const handleAdd = () => {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    if (platforms.includes(trimmed)) { toast.error('Platform already exists.'); return; }
    setPlatforms([...platforms, trimmed]);
    setNewItem('');
    toast.success(`Added platform "${trimmed}"`);
  };

  const handleDelete = (idx: number) => {
    const name = platforms[idx];
    setPlatforms(platforms.filter((_, i) => i !== idx));
    toast.success(`Removed platform "${name}"`);
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(platforms[idx]);
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    const trimmed = editValue.trim();
    if (!trimmed) return;
    if (platforms.some((p, i) => p === trimmed && i !== editingIdx)) { toast.error('Platform already exists.'); return; }
    const updated = [...platforms];
    updated[editingIdx] = trimmed;
    setPlatforms(updated);
    setEditingIdx(null);
    toast.success('Platform updated');
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ animationFillMode: 'forwards' }}>
      <PageHeader title="Platforms" subtitle="Manage the list of platforms in the organization." />

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              placeholder="New platform name..."
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              className="max-w-[300px]"
            />
            <Button size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add</Button>
          </div>

          <div className="space-y-1">
            {platforms.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors group">
                {editingIdx === idx ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="max-w-[250px] h-8 text-sm"
                      onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                      autoFocus
                    />
                    <Button size="sm" variant="ghost" onClick={handleSaveEdit}><Check className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingIdx(null)}><X className="w-3.5 h-3.5" /></Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-foreground font-medium">{p}</span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(idx)}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(idx)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlatformsCRUDPage;
