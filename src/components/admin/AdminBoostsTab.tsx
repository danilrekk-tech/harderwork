import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { BoostItem } from '@/types';

export default function AdminBoostsTab() {
  const { state, updateState, boostItems } = useApp();
  const allBoosts = [...boostItems, ...state.customBoosts];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BoostItem | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🎁', xpCost: 100, effect: '' });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', icon: '🎁', xpCost: 100, effect: '' });
    setDialogOpen(true);
  }

  function openEdit(b: BoostItem) {
    setEditing(b);
    setForm({ name: b.name, description: b.description, icon: b.icon, xpCost: b.xpCost, effect: b.effect });
    setDialogOpen(true);
  }

  function save() {
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    if (editing) {
      updateState(prev => ({
        customBoosts: prev.customBoosts.map(b => b.id === editing.id ? { ...b, ...form } : b),
      }));
      toast.success('Буст обновлён');
    } else {
      const boost: BoostItem = { id: `boost_${crypto.randomUUID()}`, ...form };
      updateState(prev => ({ customBoosts: [...prev.customBoosts, boost] }));
      toast.success('Буст создан');
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    if (!confirm('Удалить буст?')) return;
    updateState(prev => ({ customBoosts: prev.customBoosts.filter(b => b.id !== id) }));
    toast.success('Буст удалён');
  }

  const isCustom = (id: string) => state.customBoosts.some(b => b.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Бусты ({allBoosts.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
      </div>

      <div className="widget-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Иконка</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Стоимость XP</TableHead>
              <TableHead>Эффект</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBoosts.map(b => (
              <TableRow key={b.id}>
                <TableCell className="text-xl">{b.icon}</TableCell>
                <TableCell className="font-medium">{b.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{b.description}</TableCell>
                <TableCell className="font-medium text-accent">{b.xpCost} XP</TableCell>
                <TableCell className="text-sm">{b.effect}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    {isCustom(b.id) ? (
                      <>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2">Встроенный</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать буст' : 'Новый буст'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-[60px_1fr] gap-3">
              <div><Label>Иконка</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="text-center text-xl" /></div>
              <div><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            </div>
            <div><Label>Описание</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Стоимость XP</Label><Input type="number" value={form.xpCost} onChange={e => setForm(f => ({ ...f, xpCost: Number(e.target.value) }))} /></div>
            <div><Label>Эффект</Label><Input value={form.effect} onChange={e => setForm(f => ({ ...f, effect: e.target.value }))} placeholder="rest, music, theme..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={save}>{editing ? 'Сохранить' : 'Создать'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
