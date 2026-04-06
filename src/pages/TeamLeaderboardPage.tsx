import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Profile { user_id: string; name: string; level: number; total_xp_earned: number; streak_days: number; }

export default function TeamLeaderboardPage() {
  const [profiles, setProfiles] = useState<(Profile & { revenue: number })[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'manager' as any);
    const ids = roles?.map(r => r.user_id) || [];
    if (ids.length === 0) return;

    const [{ data: profs }, { data: invoices }] = await Promise.all([
      supabase.from('profiles').select('*').in('user_id', ids),
      supabase.from('invoices').select('user_id, amount, status'),
    ]);

    const result = (profs || []).map((p: any) => ({
      ...p,
      revenue: (invoices || []).filter((i: any) => i.user_id === p.user_id && i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0),
    })).sort((a: any, b: any) => b.revenue - a.revenue);

    setProfiles(result);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🏆 Лидерборд команды</h1>
      {profiles.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет менеджеров</div>
      ) : (
        <div className="space-y-2">
          {profiles.map((p, i) => (
            <motion.div key={p.user_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 widget-card flex items-center gap-3">
                <div className="text-lg font-bold w-8 text-center">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`}</div>
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary">{p.name.charAt(0)}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Ур. {p.level} • 🔥 {p.streak_days} дн.</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-foreground">{p.revenue.toLocaleString()} ₽</div>
                  <div className="text-xs text-accent">{p.total_xp_earned} XP</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
