import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Zap, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Rule { id: string; name: string; trigger_type: string; trigger_config: any; action_type: string; action_config: any; is_active: boolean; }

const TRIGGERS = [
  { value: 'revenue_below', label: 'Выручка ниже X за день' },
  { value: 'no_invoices_today', label: 'Менеджер не выставил счетов сегодня' },
  { value: 'big_deal', label: 'Большая сделка (выше X)' },
  { value: 'streak_lost', label: 'Менеджер потерял серию' },
];
const ACTIONS = [
  { value: 'notify_leader', label: 'Уведомить руководителя' },
  { value: 'notify_manager', label: 'Уведомить менеджера' },
  { value: 'penalty', label: 'Назначить штраф (XP)' },
  { value: 'bonus_xp', label: 'Начислить бонусный XP' },
];

export default function AutomationPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_type: 'revenue_below', trigger_value: 10000, action_type: 'notify_leader', action_value: 0 });

  const load = async () => {
    const { data } = await supabase.from('automation_rules').select('*').order('created_at', { ascending: false });
    setRules((data as Rule[]) || []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('automation_rules').insert({
      created_by: user.id, name: form.name,
      trigger_type: form.trigger_type, trigger_config: { value: form.trigger_value },
      action_type: form.action_type, action_config: { value: form.action_value },
    });
    toast.success('Правило создано');
    setOpen(false); setForm({ name: '', trigger_type: 'revenue_below', trigger_value: 10000, action_type: 'notify_leader', action_value: 0 });
    load();
  };

  const toggle = async (r: Rule) => {
    await supabase.from('automation_rules').update({ is_active: !r.is_active }).eq('id', r.id);
    load();
  };
  const remove = async (id: string) => {
    await supabase.from('automation_rules').delete().eq('id', id);
    toast.success('Удалено');
    load();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Zap className="w-5 h-5 text-primary" /></div>
          <div>
            <h1 className="page-title">Автоматизация</h1>
            <p className="page-subtitle">Правила «если — то» для команды</p>
          </div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="quick-action-btn"><Plus className="w-4 h-4" /> Создать правило</Button></DialogTrigger>
          <DialogContent className="glass-strong">
            <DialogHeader><DialogTitle>Новое правило</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Название</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1.5" /></div>
              <div>
                <Label>Триггер</Label>
                <Select value={form.trigger_type} onValueChange={v => setForm({ ...form, trigger_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Значение триггера</Label><Input type="number" value={form.trigger_value} onChange={e => setForm({ ...form, trigger_value: +e.target.value })} className="mt-1.5" /></div>
              <div>
                <Label>Действие</Label>
                <Select value={form.action_type} onValueChange={v => setForm({ ...form, action_type: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Параметр действия (XP / др)</Label><Input type="number" value={form.action_value} onChange={e => setForm({ ...form, action_value: +e.target.value })} className="mt-1.5" /></div>
              <Button onClick={create} disabled={!form.name} className="w-full quick-action-btn">Создать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {rules.length === 0 ? (
        <Card className="glass p-12 text-center text-muted-foreground">
          <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          Правил пока нет
        </Card>
      ) : (
        <div className="grid gap-3">
          {rules.map(r => (
            <Card key={r.id} className="glass p-4 flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {TRIGGERS.find(t => t.value === r.trigger_type)?.label} → {ACTIONS.find(a => a.value === r.action_type)?.label}
                </div>
              </div>
              <Switch checked={r.is_active} onCheckedChange={() => toggle(r)} />
              <Button size="sm" variant="ghost" onClick={() => remove(r.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
