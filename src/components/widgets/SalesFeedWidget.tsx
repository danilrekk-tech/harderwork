import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

const EVENT_ICONS: Record<string, string> = {
  client_added: '👤',
  invoice_issued: '📄',
  invoice_paid: '💰',
  plan_completed: '✅',
  achievement_unlocked: '🏆',
  level_up: '⬆️',
  focus_completed: '🎯',
  record_broken: '🏅',
  combo: '⚡',
};

export default function SalesFeedWidget() {
  const { state } = useApp();
  const events = state.eventLog.slice(0, 10);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">📡 Sales Feed</h3>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Пока нет действий</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg flex-shrink-0">{EVENT_ICONS[event.type] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{event.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-accent font-medium">+{event.xpEarned} XP</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
