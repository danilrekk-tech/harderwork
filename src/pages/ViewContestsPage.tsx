import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Contest {
  id: string;
  title: string;
  description: string;
  type: string;
  start_date: string;
  end_date: string;
  prize: string;
  prize_xp: number;
  metric: string;
  target: number;
  is_active: boolean;
}

export default function ViewContestsPage() {
  const [contests, setContests] = useState<Contest[]>([]);

  useEffect(() => {
    supabase.from('contests').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setContests(data as unknown as Contest[]);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🏆 Конкурсы</h1>
      {contests.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Активных конкурсов нет</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contests.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 widget-card">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold text-foreground">{c.title}</h3>
                  <Badge variant="secondary">{c.type === 'team' ? '👥 Команда' : '👤 Личный'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Приз:</span> <span className="font-medium">{c.prize}</span></div>
                  <div><span className="text-muted-foreground">XP:</span> <span className="font-medium text-accent">{c.prize_xp}</span></div>
                  <div><span className="text-muted-foreground">Цель:</span> <span className="font-medium">{c.target}</span></div>
                  <div><span className="text-muted-foreground">До:</span> <span className="font-medium">{c.end_date}</span></div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
