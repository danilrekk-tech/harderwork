import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function TeamPlanPage() {
  const { user } = useAuth();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [target, setTarget] = useState(0);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: plan } = await supabase.from('team_plan').select('*').eq('month', currentMonth).maybeSingle();
    if (plan) { setTarget(Number((plan as any).plan_target)); setExistingId((plan as any).id); }

    const { data: invoices } = await supabase.from('invoices').select('amount, status');
    if (invoices) setTotalRevenue(invoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0));
  }

  async function save() {
    if (existingId) {
      await supabase.from('team_plan').update({ plan_target: target }).eq('id', existingId);
    } else {
      await supabase.from('team_plan').insert({ month: currentMonth, plan_target: target, created_by: user!.id });
    }
    toast.success('План сохранён');
    load();
  }

  const progress = target > 0 ? Math.min(100, (totalRevenue / target) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📋 План команды</h1>
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 widget-card mb-6">
          <h2 className="font-display font-semibold text-foreground mb-4">
            План на {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-3 items-end mb-4">
            <div className="flex-1"><Label>Цель (₽)</Label><Input type="number" value={target} onChange={e => setTarget(Number(e.target.value))} /></div>
            <Button onClick={save}>Сохранить</Button>
          </div>
          {target > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-semibold">{totalRevenue.toLocaleString()} / {target.toLocaleString()} ₽ ({progress.toFixed(1)}%)</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
