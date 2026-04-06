import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface DisciplineRow {
  user_id: string;
  name: string;
  streak_days: number;
  last_active_date: string;
  penalties_count: number;
  penalties_xp: number;
  tasks_completed: number;
}

export default function DisciplinePage() {
  const [rows, setRows] = useState<DisciplineRow[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'manager' as any);
    const ids = roles?.map(r => r.user_id) || [];
    if (ids.length === 0) return;

    const [{ data: profiles }, { data: penalties }, { data: tasks }] = await Promise.all([
      supabase.from('profiles').select('user_id, name, streak_days, last_active_date').in('user_id', ids),
      supabase.from('penalties').select('user_id, xp_amount'),
      supabase.from('daily_tasks').select('user_id, completed').eq('completed', true),
    ]);

    const result: DisciplineRow[] = (profiles || []).map((p: any) => {
      const pens = (penalties || []).filter((pen: any) => pen.user_id === p.user_id);
      const tc = (tasks || []).filter((t: any) => t.user_id === p.user_id).length;
      return {
        user_id: p.user_id,
        name: p.name,
        streak_days: p.streak_days,
        last_active_date: p.last_active_date,
        penalties_count: pens.length,
        penalties_xp: pens.reduce((s: number, pen: any) => s + Number(pen.xp_amount), 0),
        tasks_completed: tc,
      };
    }).sort((a, b) => b.streak_days - a.streak_days);

    setRows(result);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📊 Дисциплина команды</h1>
      {rows.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет менеджеров</div>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <motion.div key={r.user_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 widget-card flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">{r.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    🔥 {r.streak_days} дн. • ✅ {r.tasks_completed} задач • Последняя активность: {r.last_active_date || '—'}
                  </div>
                </div>
                <div className="text-right">
                  {r.penalties_count > 0 ? (
                    <div className="text-sm text-destructive font-medium">⚠️ {r.penalties_count} штрафов (-{r.penalties_xp} XP)</div>
                  ) : (
                    <div className="text-sm text-primary font-medium">✅ Без штрафов</div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
