import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface Penalty {
  id: string;
  reason: string;
  xp_amount: number;
  created_at: string;
}

export default function MyPenaltiesPage() {
  const { user } = useAuth();
  const [penalties, setPenalties] = useState<Penalty[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('penalties').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setPenalties(data as unknown as Penalty[]);
    });
  }, [user]);

  const totalXp = penalties.reduce((s, p) => s + p.xp_amount, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">⚠️ Мои штрафы</h1>
      <p className="text-muted-foreground text-sm mb-6">Всего штрафов: <span className="font-semibold text-destructive">-{totalXp} XP</span></p>
      {penalties.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">🎉 Штрафов нет. Так держать!</div>
      ) : (
        <div className="space-y-2">
          {penalties.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-4 widget-card flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">{p.reason || 'Штраф'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString('ru-RU')}</div>
                </div>
                <div className="font-bold text-destructive">-{p.xp_amount} XP</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
