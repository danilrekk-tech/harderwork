import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface BoostRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_cost: number;
  effect: string;
}

const EFFECT_OPTIONS = [
  { value: 'visual_theme', label: '🎨 Визуальная тема', desc: 'Особая тема интерфейса, активируется в настройках' },
  { value: 'visual_badge', label: '🏅 Визуальный бейдж', desc: 'Премиальная плашка с именем, видна в лидерборде и интерфейсе' },
  { value: 'visual_frame', label: '🖼️ Рамка профиля', desc: 'Премиальная рамка вокруг аватарки' },
  { value: 'xp_boost', label: '⚡ Бонус XP x2', desc: 'Удвоение XP на 1 час' },
  { value: 'skip_task', label: '⏭️ Пропуск задания', desc: 'Пропустить одно ежедневное задание' },
  { value: 'extra_break', label: '☕ Кофе-брейк', desc: 'Дополнительный перерыв 15 минут' },
  { value: 'early_leave', label: '🏠 Ранний уход', desc: 'Уход на 1 час раньше конца смены' },
  { value: 'custom', label: '✏️ Кастомный', desc: 'Описание эффекта в поле ниже' },
];

export default function AdminBoostsTab() {
  const { user } = useAuth();
  const [boosts, setBoosts] = useState<BoostRow[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BoostRow | null>(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '🎁', xp_cost: 100, effect: 'visual_badge' });

  useEffect(() => { loadBoosts(); }, []);

  async function loadBoosts() {
    const { data } = await supabase.from('boost_items').select('*').order('created_at', { ascending: false });
    if (data) setBoosts(data as unknown as BoostRow[]);
  }

  function openCreate() {
    setEditing(null);
    setForm({ name: '', description: '', icon: '🎁', xp_cost: 100, effect: 'visual_badge' });
    setDialogOpen(true);
  }

  function openEdit(b: BoostRow) {
    setEditing(b);
    setForm({ name: b.name, description: b.description, icon: b.icon, xp_cost: b.xp_cost, effect: b.effect });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Укажите название'); return; }
    if (editing) {
      await supabase.from('boost_items').update(form).eq('id', editing.id);
      toast.success('Плюшка обновлена');
    } else {
      await supabase.from('boost_items').insert({ ...form, created_by: user?.id });
      toast.success('Плюшка создана');
    }
    setDialogOpen(false);
    loadBoosts();
  }

  async function remove(id: string) {
    if (!confirm('Удалить плюшку?')) return;
    await supabase.from('boost_items').delete().eq('id', id);
    toast.success('Плюшка удалена');
    loadBoosts();
  }

  const effectLabel = (val: string) => EFFECT_OPTIONS.find(o => o.value === val)?.label || val;
  const selectedEffect = EFFECT_OPTIONS.find(o => o.value === form.effect);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">🎁 Конструктор плюшек ({boosts.length})</h2>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" /> Добавить</Button>
      </div>

      <div className="widget-card overflow-x-auto mb-6">
        {boosts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Нет плюшек. Создайте первую!</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead></TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Тип эффекта</TableHead>
                <TableHead>Стоимость</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {boosts.map(b => (
                <TableRow key={b.id}>
                  <TableCell className="text-xl">{b.icon}</TableCell>
                  <TableCell>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{effectLabel(b.effect)}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-accent">{b.xp_cost} XP</TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => remove(b.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Effect Mechanics Info */}
      <div className="widget-card">
        <h3 className="font-display font-semibold text-foreground mb-3">📖 Механики эффектов</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EFFECT_OPTIONS.map(o => (
            <div key={o.value} className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm font-medium text-foreground">{o.label}</div>
              <div className="text-xs text-muted-foreground">{o.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Редактировать плюшку' : 'Новая плюшка'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-[60px_1fr] gap-3">
              <div><Label>Иконка</Label><Input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} className="text-center text-xl" /></div>
              <div><Label>Название</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            </div>
            <div><Label>Описание</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} /></div>
            <div>
              <Label>Тип эффекта</Label>
              <Select value={form.effect} onValueChange={v => setForm(f => ({ ...f, effect: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EFFECT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {selectedEffect && (
                <p className="text-xs text-muted-foreground mt-1">💡 {selectedEffect.desc}</p>
              )}
            </div>
            <div><Label>Стоимость XP</Label><Input type="number" value={form.xp_cost} onChange={e => setForm(f => ({ ...f, xp_cost: Number(e.target.value) }))} /></div>
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
