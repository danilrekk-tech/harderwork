import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Pencil, Trash2, Trophy, Users } from 'lucide-react';
import type { Contest } from '@/types';

const METRIC_LABELS = { revenue: 'Выручка', invoices: 'Счета', clients: 'Клиенты' };

export default function AdminContestsTab() {
  const { state, updateState } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contest | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', type: 'individual' as 'individual' | 'team',
    startDate: '', endDate: '', prize: '', metric: 'revenue' as 'revenue' | 'invoices' | 'clients', target: 0,
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', type: 'individual', startDate: '', endDate: '', prize: '', metric: 'revenue', target: 0 });
    setDialogOpen(true);
  }

  function openEdit(c: Contest) {
    setEditing(c);
    setForm({ title: c.title, description: c.description, type: c.type, startDate: c.startDate, endDate: c.endDate, prize: c.prize, metric: c.metric, target: c.target });
    setDialogOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error('Укажите название'); return; }
    if (editing) {
      updateState(prev => ({
        contests: prev.contests.map(c => c.id === editing.id ? { ...c, ...form } : c),
      }));
      toast.success('Конкурс обновлён');
    } else {
      const contest: Contest = {
        id: crypto.randomUUID(), ...form, prizeXp: 500, teams: form.type === 'team' ? [] : undefined, isActive: true,
      };
      updateState(prev => ({ contests: [...prev.contests, contest] }));
      toast.success('Конкурс создан');
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    if (!confirm('Удалить конкурс?')) return;
    updateState(prev => ({ contests: prev.contests.filter(c => c.id !== id) }));
    toast.success('Конкурс удалён');
  }

  function toggleActive(id: string) {
    updateState(prev => ({
      contests: prev.contests.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c),
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Конкурсы и соревнования</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Создать</Button>
      </div>

      {state.contests.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет конкурсов</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.contests.map(c => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {c.type === 'team' ? <Users className="w-5 h-5 text-primary" /> : <Trophy className="w-5 h-5 text-accent" />}
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{c.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{c.type === 'team' ? 'Командный' : 'Индивидуальный'}</Badge>
                <Badge variant="secondary">{METRIC_LABELS[c.metric]}: {c.target.toLocaleString('ru-RU')}</Badge>
                <Badge className={c.isActive ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-muted-foreground border-0'}>
                  {c.isActive ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">🎁 Приз: {c.prize || '—'}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.startDate && c.endDate ? `${new Date(c.startDate).toLocaleDateString('ru-RU')} — ${new Date(c.endDate).toLocaleDateString('ru-RU')}` : 'Даты не указаны'}
              </div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => toggleActive(c.id)}>
                {c.isActive ? 'Деактивировать' : 'Активировать'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать конкурс' : 'Новый конкурс'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div><Label>Название</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Описание</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>Тип</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'individual' | 'team' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Индивидуальный</SelectItem>
                  <SelectItem value="team">Командный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Метрика</Label>
              <Select value={form.metric} onValueChange={v => setForm(f => ({ ...f, metric: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Выручка</SelectItem>
                  <SelectItem value="invoices">Счета</SelectItem>
                  <SelectItem value="clients">Клиенты</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Цель</Label><Input type="number" value={form.target} onChange={e => setForm(f => ({ ...f, target: Number(e.target.value) }))} /></div>
            <div><Label>Приз</Label><Input value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Начало</Label><Input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
              <div><Label>Конец</Label><Input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
            </div>
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
