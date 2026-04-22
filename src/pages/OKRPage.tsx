import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Target, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function OKRPage() {
  const { user, role } = useAuth();
  const [okrs, setOkrs] = useState<any[]>([]);
  const [krs, setKrs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ objective: '', quarter: 'Q1 2026' });

  const load = async () => {
    const { data: o } = await supabase.from('okrs').select('*').order('created_at', { ascending: false });
    const { data: k } = await supabase.from('okr_key_results').select('*');
    setOkrs(o ?? []); setKrs(k ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    await supabase.from('okrs').insert({ ...form, scope: 'team', created_by: user.id });
    setOpen(false); load();
  };
  const addKR = async (okrId: string) => {
    const t = prompt('Ключевой результат?'); if (!t) return;
    await supabase.from('okr_key_results').insert({ okr_id: okrId, title: t });
    load();
  };
  const updateKR = async (id: string, val: number) => {
    await supabase.from('okr_key_results').update({ current_value: val }).eq('id', id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">OKR</h1><p className="page-subtitle">Цели и ключевые результаты</p></div>
        </div>
        {role === 'leader' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Цель</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Новая цель</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Цель (objective)" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} />
                <Input placeholder="Квартал" value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} />
                <Button onClick={create} className="w-full">Создать</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {okrs.map(o => {
          const ok = krs.filter(k => k.okr_id === o.id);
          const avg = ok.length ? ok.reduce((s, k) => s + Math.min(100, (k.current_value / k.target_value) * 100), 0) / ok.length : 0;
          return (
            <Card key={o.id} className="p-5 glass">
              <div className="flex justify-between items-start">
                <div><h3 className="font-semibold">{o.objective}</h3><p className="text-xs text-muted-foreground">{o.quarter}</p></div>
                <span className="text-2xl font-bold text-primary">{avg.toFixed(0)}%</span>
              </div>
              <Progress value={avg} className="mt-2" />
              <div className="space-y-2 mt-3">
                {ok.map(k => (
                  <div key={k.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <span className="flex-1 text-sm">{k.title}</span>
                    <Input type="number" className="w-24" value={k.current_value} onChange={e => updateKR(k.id, +e.target.value)} />
                    <span className="text-sm text-muted-foreground">/ {k.target_value} {k.unit}</span>
                  </div>
                ))}
                {role === 'leader' && <Button size="sm" variant="outline" onClick={() => addKR(o.id)}>+ ключевой результат</Button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
