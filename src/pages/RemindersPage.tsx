import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ReminderRow {
  id: string;
  reason: string;
  client_time: string;
  my_time: string;
  client_timezone: string;
  amount: number | null;
  completed: boolean;
  created_at: string;
}

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderRow[]>([]);

  useEffect(() => { if (user) load(); }, [user]);

  async function load() {
    const { data } = await supabase.from('reminders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (data) setReminders(data as unknown as ReminderRow[]);
  }

  async function complete(id: string) {
    await supabase.from('reminders').update({ completed: true }).eq('id', id);
    toast.success('Напоминание выполнено');
    load();
  }

  const active = reminders.filter(r => !r.completed);
  const done = reminders.filter(r => r.completed);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🔔 Напоминания</h1>
      <h2 className="font-display font-semibold text-foreground mb-3">Активные ({active.length})</h2>
      {active.length === 0 ? (
        <div className="widget-card text-center py-6 text-muted-foreground mb-6">Нет активных напоминаний</div>
      ) : (
        <div className="space-y-2 mb-6">
          {active.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 widget-card flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{r.reason || 'Напоминание'}</div>
                  <div className="text-xs text-muted-foreground">Время клиента: {r.client_time} ({r.client_timezone}) • Моё: {r.my_time}</div>
                  {r.amount && <div className="text-sm text-accent font-medium mt-1">{r.amount.toLocaleString()} ₽</div>}
                </div>
                <Button size="sm" variant="outline" onClick={() => complete(r.id)}><Check className="w-4 h-4" /></Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {done.length > 0 && (
        <>
          <h2 className="font-display font-semibold text-muted-foreground mb-3">Выполненные ({done.length})</h2>
          <div className="space-y-2 opacity-60">
            {done.slice(0, 10).map(r => (
              <Card key={r.id} className="p-3 widget-card">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">✅</Badge>
                  <span className="text-sm text-foreground">{r.reason || 'Напоминание'}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
