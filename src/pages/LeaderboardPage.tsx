import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { state } = useApp();
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">📊 Лидерборд</h1>

      {/* Season */}
      <div className="widget-card mb-6 flex items-center justify-between">
        <div>
          <span className="text-sm font-semibold text-foreground">🏆 Season {state.season.number}</span>
          <p className="text-xs text-muted-foreground">
            {new Date(state.season.startDate).toLocaleDateString('ru-RU')} — {new Date(state.season.endDate).toLocaleDateString('ru-RU')}
          </p>
        </div>
        {state.season.isActive && (
          <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">Активный</span>
        )}
      </div>

      <div className="space-y-3">
        {state.leaderboard.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`widget-card flex items-center gap-4 ${i < 3 ? 'border-accent/30' : ''}`}
          >
            <div className="text-2xl w-10 text-center flex-shrink-0">
              {i < 3 ? medals[i] : <span className="text-muted-foreground text-lg">#{i + 1}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{entry.name}</div>
              <div className="text-sm text-muted-foreground">{entry.invoicesPaid} оплат • {(entry.xp || 0).toLocaleString()} XP</div>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-foreground">{entry.revenue.toLocaleString()} ₽</div>
              <div className="level-badge text-xs mt-1">Ур. {entry.level}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
