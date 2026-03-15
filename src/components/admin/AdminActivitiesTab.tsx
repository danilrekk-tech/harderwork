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
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { BonusActivity } from '@/types';

const PERIOD_LABELS = { daily: 'Дневная', weekly: 'Недельная', monthly: 'Месячная' };
const METRIC_LABELS = { revenue: 'Выручка', invoices: 'Счета', clients: 'Клиенты' };

export default function AdminActivitiesTab() {
  const { state, updateState } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BonusActivity | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', period: 'weekly' as 'daily' | 'weekly' | 'monthly',
    prize: '', xpReward: 100, metric: 'revenue' as 'revenue' | 'invoices' | 'clients', target: 0,
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', period: 'weekly', prize: '', xpReward: 100, metric: 'revenue', target: 0 });
    setDialogOpen(true);
  }

  function openEdit(a: BonusActivity) {
    setEditing(a);
    setForm({ title: a.title, description: a.description, period: a.period, prize: a.prize, xpReward: a.xpReward, metric: a.metric, target: a.target });
    setDialogOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error('Укажите название'); return; }
    if (editing) {
      updateState(prev => ({
        bonusActivities: prev.bonusActivities.map(a => a.id === editing.id ? { ...a, ...form } : a),
      }));
      toast.success('Активность обновлена');
    } else {
      const activity: BonusActivity = {
        id: crypto.randomUUID(), ...form, isActive: true, createdAt: new Date().toISOString(),
      };
      updateState(prev => ({ bonusActivities: [...prev.bonusActivities, activity] }));
      toast.success('Активность создана');
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    if (!confirm('Удалить активность?')) return;
    updateState(prev => ({ bonusActivities: prev.bonusActivities.filter(a => a.id !== id) }));
    toast.success('Активность удалена');
  }

  function toggleActive(id: string) {
    updateState(prev => ({
      bonusActivities: prev.bonusActivities.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a),
    }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Бонусные активности</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Создать</Button>
      </div>

      {state.bonusActivities.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет бонусных активностей</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {state.bonusActivities.map(a => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-foreground">{a.title}</h3>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{a.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge variant="secondary">{PERIOD_LABELS[a.period]}</Badge>
                <Badge variant="secondary">{METRIC_LABELS[a.metric]}: {a.target.toLocaleString('ru-RU')}</Badge>
                <Badge variant="secondary">+{a.xpReward} XP</Badge>
                <Badge className={a.isActive ? 'bg-primary/10 text-primary border-0' : 'bg-muted text-muted-foreground border-0'}>
                  {a.isActive ? 'Активна' : 'Неактивна'}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">🎁 Приз: {a.prize || '—'}</div>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => toggleActive(a.id)}>
                {a.isActive ? 'Деактивировать' : 'Активировать'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать активность' : 'Новая активность'}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto">
            <div><Label>Название</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Описание</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>Период</Label>
              <Select value={form.period} onValueChange={v => setForm(f => ({ ...f, period: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Дневная</SelectItem>
                  <SelectItem value="weekly">Недельная</SelectItem>
                  <SelectItem value="monthly">Месячная</SelectItem>
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
            <div><Label>XP награда</Label><Input type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))} /></div>
            <div><Label>Приз</Label><Input value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} /></div>
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
