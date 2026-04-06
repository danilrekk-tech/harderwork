import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const TYPE_ICONS: Record<string, string> = {
  client_added: '👤', invoice_issued: '📄', invoice_paid: '💰',
  plan_completed: '🎯', achievement_unlocked: '🏆', level_up: '⬆️',
  focus_completed: '🎯', record_broken: '🏅', combo: '🔥',
};

export default function EventLogPage() {
  const { state } = useApp();
  const events = [...state.eventLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📜 Журнал действий</h1>
      {events.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Журнал пуст</div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 50).map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
              <Card className="p-3 widget-card flex items-center gap-3">
                <div className="text-xl">{TYPE_ICONS[e.type] || '📌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{e.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString('ru-RU')}</div>
                </div>
                {e.xpEarned > 0 && <Badge variant="secondary" className="text-xs">+{e.xpEarned} XP</Badge>}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
