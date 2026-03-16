import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Ban, CheckCircle } from 'lucide-react';
import type { Manager } from '@/types';

export default function AdminManagersTab() {
  const { state, updateState } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Manager | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  function openCreate() {
    setEditing(null);
    setForm({ name: '', email: '', phone: '' });
    setDialogOpen(true);
  }

  function openEdit(m: Manager) {
    setEditing(m);
    setForm({ name: m.name, email: m.email, phone: m.phone });
    setDialogOpen(true);
  }

  function save() {
    if (!form.name.trim()) { toast.error('Укажите имя'); return; }
    if (editing) {
      updateState(prev => ({
        managers: prev.managers.map(m => m.id === editing.id ? { ...m, ...form } : m),
      }));
      toast.success('Менеджер обновлён');
    } else {
      const newManager: Manager = {
        id: crypto.randomUUID(),
        ...form,
        level: 1,
        xp: 0,
        revenue: 0,
        invoicesPaid: 0,
        invoicesIssued: 0,
        clientsProcessed: 0,
        streakDays: 0,
        disciplineIndex: 0,
        isBlocked: false,
        createdAt: new Date().toISOString(),
      };
      updateState(prev => ({ managers: [...prev.managers, newManager] }));
      toast.success('Менеджер добавлен');
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    if (!confirm('Удалить менеджера?')) return;
    updateState(prev => ({ managers: prev.managers.filter(m => m.id !== id) }));
    toast.success('Менеджер удалён');
  }

  function toggleBlock(id: string) {
    updateState(prev => ({
      managers: prev.managers.map(m => m.id === id ? { ...m, isBlocked: !m.isBlocked } : m),
    }));
    const m = state.managers.find(m => m.id === id);
    toast.success(m?.isBlocked ? 'Менеджер разблокирован' : 'Менеджер заблокирован');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Менеджеры ({state.managers.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
      </div>

      {state.managers.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет менеджеров. Добавьте первого!</div>
      ) : (
        <div className="widget-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>Выручка</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.managers.map(m => (
                <TableRow key={m.id} className={m.isBlocked ? 'opacity-50' : ''}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.email}</TableCell>
                  <TableCell>{m.phone}</TableCell>
                  <TableCell><Badge variant="secondary">Ур. {m.level}</Badge></TableCell>
                  <TableCell>{m.revenue.toLocaleString('ru-RU')} ₽</TableCell>
                  <TableCell>
                    {m.isBlocked ? (
                      <Badge variant="destructive">Заблокирован</Badge>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-0">Активен</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => toggleBlock(m.id)}>
                        {m.isBlocked ? <CheckCircle className="w-4 h-4 text-primary" /> : <Ban className="w-4 h-4 text-destructive" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(m.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Редактировать менеджера' : 'Новый менеджер'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Имя</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div><Label>Телефон</Label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Отмена</Button>
            <Button onClick={save}>{editing ? 'Сохранить' : 'Добавить'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
