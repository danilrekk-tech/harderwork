import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Save, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface Manager { user_id: string; name: string; level: number; }
interface KPI { user_id: string; monthly_revenue_target: number; monthly_invoices_target: number; monthly_clients_target: number; }

export default function TeamKPIPage() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [kpis, setKpis] = useState<Record<string, KPI>>({});
  const [editing, setEditing] = useState<Manager | null>(null);
  const [form, setForm] = useState({ revenue: 0, invoices: 0, clients: 0 });

  const load = async () => {
    const { data: roleData } = await supabase.from('user_roles').select('user_id').eq('role', 'manager');
    const ids = (roleData || []).map(r => r.user_id);
    if (!ids.length) return;
    const { data: profs } = await supabase.from('profiles').select('user_id, name, level').in('user_id', ids);
    setManagers((profs as Manager[]) || []);
    const { data: kpiData } = await supabase.from('manager_kpi').select('*').in('user_id', ids);
    const map: Record<string, KPI> = {};
    (kpiData || []).forEach((k: any) => { map[k.user_id] = k; });
    setKpis(map);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (m: Manager) => {
    setEditing(m);
    const k = kpis[m.user_id];
    setForm({
      revenue: k?.monthly_revenue_target || 0,
      invoices: k?.monthly_invoices_target || 0,
      clients: k?.monthly_clients_target || 0,
    });
  };

  const save = async () => {
    if (!editing) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('manager_kpi').upsert({
      user_id: editing.user_id,
      monthly_revenue_target: form.revenue,
      monthly_invoices_target: form.invoices,
      monthly_clients_target: form.clients,
      set_by: user?.id, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    toast.success('KPI сохранены');
    setEditing(null);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="page-title">KPI менеджеров</h1>
          <p className="page-subtitle">Личные планы выручки, счетов и клиентов на месяц</p>
        </div>
      </div>

      <div className="grid gap-3">
        {managers.map(m => {
          const k = kpis[m.user_id];
          return (
            <Card key={m.user_id} className="glass p-4 flex items-center gap-4 flex-wrap">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{m.name.charAt(0)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground">Уровень {m.level}</div>
              </div>
              <div className="flex gap-4 text-sm">
                <div><span className="text-muted-foreground">₽:</span> {k?.monthly_revenue_target?.toLocaleString('ru') || '—'}</div>
                <div><span className="text-muted-foreground">Счетов:</span> {k?.monthly_invoices_target || '—'}</div>
                <div><span className="text-muted-foreground">Клиентов:</span> {k?.monthly_clients_target || '—'}</div>
              </div>
              <Button size="sm" variant="outline" onClick={() => openEdit(m)}><Edit className="w-4 h-4" /></Button>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="glass-strong">
          <DialogHeader><DialogTitle>KPI: {editing?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Выручка в месяц (₽)</Label><Input type="number" value={form.revenue} onChange={e => setForm({ ...form, revenue: +e.target.value })} className="mt-1.5" /></div>
            <div><Label>Счетов в месяц</Label><Input type="number" value={form.invoices} onChange={e => setForm({ ...form, invoices: +e.target.value })} className="mt-1.5" /></div>
            <div><Label>Клиентов в месяц</Label><Input type="number" value={form.clients} onChange={e => setForm({ ...form, clients: +e.target.value })} className="mt-1.5" /></div>
            <Button onClick={save} className="quick-action-btn w-full"><Save className="w-4 h-4" /> Сохранить</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
