import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const CONDITION_LABELS: Record<string, string> = {
  invoices_issued: 'Выставлено счетов',
  invoices_paid: 'Оплачено счетов',
  clients_processed: 'Обработано клиентов',
  streak_days: 'Дней подряд',
  total_revenue: 'Общая выручка',
  xp_earned: 'Заработано XP',
  combo_max: 'Макс. комбо',
  level_reached: 'Достигнут уровень',
  plan_completed: 'План выполнен',
  plan_overfulfilled: 'Перевыполнение плана %',
};

interface AchievementRow {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_target: number;
}

export default function AdminAchievementsTab() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AchievementRow | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', icon: '🏆', xp_reward: 100,
    condition_type: 'invoices_issued', condition_target: 1,
  });

  useEffect(() => { loadAchievements(); }, []);

  async function loadAchievements() {
    const { data } = await supabase.from('achievements').select('*').order('created_at', { ascending: false });
    if (data) setAchievements(data as unknown as AchievementRow[]);
  }

  function openCreate() {
    setEditing(null);
    setForm({ title: '', description: '', icon: '🏆', xp_reward: 100, condition_type: 'invoices_issued', condition_target: 1 });
    setDialogOpen(true);
  }

  function openEdit(a: AchievementRow) {
    setEditing(a);
    setForm({ title: a.title, description: a.description, icon: a.icon, xp_reward: a.xp_reward, condition_type: a.condition_type, condition_target: a.condition_target });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.title.trim()) { toast.error('Укажите название'); return; }
    if (editing) {
      await supabase.from('achievements').update({
        title: form.title, description: form.description, icon: form.icon,
        xp_reward: form.xp_reward, condition_type: form.condition_type, condition_target: form.condition_target,
      }).eq('id', editing.id);
      toast.success('Достижение обновлено');
    } else {
      await supabase.from('achievements').insert({
        title: form.title, description: form.description, icon: form.icon,
        xp_reward: form.xp_reward, condition_type: form.condition_type, condition_target: form.condition_target,
        created_by: user?.id,
      });
      toast.success('Достижение создано');
    }
    setDialogOpen(false);
    loadAchievements();
  }

  async function remove(id: string) {
    if (!confirm('Удалить достижение?')) return;
    await supabase.from('achievements').delete().eq('id', id);
    toast.success('Достижение удалено');
    loadAchievements();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Достижения ({achievements.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
      </div>

      <div className="widget-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Условие</TableHead>
              <TableHead>XP</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {achievements.map(a => (
              <TableRow key={a.id}>
                <TableCell className="text-xl">{a.icon}</TableCell>
                <TableCell>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">{a.description}</div>
                </TableCell>
                <TableCell className="text-sm">{CONDITION_LABELS[a.condition_type] || a.condition_type}: {a.condition_target.toLocaleString('ru-RU')}</TableCell>
                <TableCell className="font-medium text-accent">+{a.xp_reward}</TableCell>
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
              <Select value={form.condition_type} onValueChange={v => setForm(f => ({ ...f, condition_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Цель</Label><Input type="number" value={form.condition_target} onChange={e => setForm(f => ({ ...f, condition_target: Number(e.target.value) }))} /></div>
            <div><Label>XP награда</Label><Input type="number" value={form.xp_reward} onChange={e => setForm(f => ({ ...f, xp_reward: Number(e.target.value) }))} /></div>
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
