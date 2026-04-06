import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  title: string;
  description: string;
  period: string;
  prize: string;
  xp_reward: number;
  metric: string;
  target: number;
  is_active: boolean;
}

const PERIOD_LABELS: Record<string, string> = { daily: '📅 Ежедневно', weekly: '📆 Еженедельно', monthly: '🗓 Ежемесячно' };

export default function ViewActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    supabase.from('bonus_activities').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setActivities(data as unknown as Activity[]);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">🎯 Бонусные активности</h1>
      {activities.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Активных активностей нет</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-5 widget-card">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-display font-semibold text-foreground">{a.title}</h3>
                  <Badge variant="secondary">{PERIOD_LABELS[a.period] || a.period}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{a.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span><span className="text-muted-foreground">Цель:</span> {a.target}</span>
                  <span className="font-semibold text-accent">+{a.xp_reward} XP</span>
                </div>
                {a.prize && <div className="text-sm mt-1"><span className="text-muted-foreground">Приз:</span> {a.prize}</div>}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
