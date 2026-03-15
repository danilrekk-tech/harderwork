import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Achievement, AchievementCondition } from '@/types';

const CONDITION_LABELS: Record<AchievementCondition['type'], string> = {
  invoices_issued: 'Выставлено счетов',
  invoices_paid: 'Оплачено счетов',
  clients_processed: 'Обработано клиентов',
  streak_days: 'Дней подряд',
  total_revenue: 'Общая выручка',
  xp_earned: 'Заработано XP',
};

export default function AdminAchievementsTab() {
  const { state, updateState } = useApp();
  const allAchievements = [...state.achievements, ...state.customAchievements];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', icon: '🏆', xpReward: 100,
    conditionType: 'invoices_issued' as AchievementCondition['type'], conditionTarget: 1,
  });

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', icon: '🏆', xpReward: 100, conditionType: 'invoices_issued', conditionTarget: 1 });
    setDialogOpen(true);
  }

  function openEdit(a: Achievement) {
    setEditing(a);
    setForm({ title: a.title, description: a.description, icon: a.icon, xpReward: a.xpReward, conditionType: a.condition.type, conditionTarget: a.condition.target });
    setDialogOpen(true);
  }

  function save() {
    if (!form.title.trim()) { toast.error('Укажите название'); return; }
    const condition: AchievementCondition = { type: form.conditionType, target: form.conditionTarget };
    if (editing) {
      // Check if it's a built-in or custom
      const isBuiltIn = state.achievements.some(a => a.id === editing.id);
      if (isBuiltIn) {
        updateState(prev => ({
          achievements: prev.achievements.map(a => a.id === editing.id ? { ...a, title: form.title, description: form.description, icon: form.icon, xpReward: form.xpReward, condition } : a),
        }));
      } else {
        updateState(prev => ({
          customAchievements: prev.customAchievements.map(a => a.id === editing.id ? { ...a, title: form.title, description: form.description, icon: form.icon, xpReward: form.xpReward, condition } : a),
        }));
      }
      toast.success('Достижение обновлено');
    } else {
      const achievement: Achievement = {
        id: `custom_${crypto.randomUUID()}`, title: form.title, description: form.description, icon: form.icon, xpReward: form.xpReward, condition,
      };
      updateState(prev => ({ customAchievements: [...prev.customAchievements, achievement] }));
      toast.success('Достижение создано');
    }
    setDialogOpen(false);
  }

  function remove(id: string) {
    if (!confirm('Удалить достижение?')) return;
    const isBuiltIn = state.achievements.some(a => a.id === id);
    if (isBuiltIn) {
      updateState(prev => ({ achievements: prev.achievements.filter(a => a.id !== id) }));
    } else {
      updateState(prev => ({ customAchievements: prev.customAchievements.filter(a => a.id !== id) }));
    }
    toast.success('Достижение удалено');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Достижения ({allAchievements.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
      </div>

      <div className="widget-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Иконка</TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Условие</TableHead>
              <TableHead>XP</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allAchievements.map(a => (
              <TableRow key={a.id}>
                <TableCell className="text-xl">{a.icon}</TableCell>
                <TableCell className="font-medium">{a.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{a.description}</TableCell>
                <TableCell className="text-sm">{CONDITION_LABELS[a.condition.type]}: {a.condition.target.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="font-medium text-accent">+{a.xpReward}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать достижение' : 'Новое достижение'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-[60px_1fr] gap-3">
              <div><Label>Иконка</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="text-center text-xl" /></div>
              <div><Label>Название</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            </div>
            <div><Label>Описание</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div>
              <Label>Условие</Label>
              <Select value={form.conditionType} onValueChange={v => setForm(f => ({ ...f, conditionType: v as AchievementCondition['type'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Цель</Label><Input type="number" value={form.conditionTarget} onChange={e => setForm(f => ({ ...f, conditionTarget: Number(e.target.value) }))} /></div>
            <div><Label>XP награда</Label><Input type="number" value={form.xpReward} onChange={e => setForm(f => ({ ...f, xpReward: Number(e.target.value) }))} /></div>
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
