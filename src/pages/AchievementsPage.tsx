import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function AchievementsPage() {
  const { state } = useApp();

  const sorted = useMemo(() => {
    return [...state.achievements].sort((a, b) => {
      const aU = state.unlockedAchievements.includes(a.id);
      const bU = state.unlockedAchievements.includes(b.id);
      if (aU && !bU) return -1;
      if (!aU && bU) return 1;
      return 0;
    });
  }, [state.achievements, state.unlockedAchievements]);

  // Progress for each achievement
  const getProgress = (ach: typeof state.achievements[0]) => {
    const issuedCount = state.invoices.length;
    const paidCount = state.invoices.filter(i => i.status === 'paid').length;
    const clientCount = state.profile.processedClientsCount;
    const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
    let current = 0;
    switch (ach.condition.type) {
      case 'invoices_issued': current = issuedCount; break;
      case 'invoices_paid': current = paidCount; break;
      case 'clients_processed': current = clientCount; break;
      case 'streak_days': current = state.profile.streakDays; break;
      case 'total_revenue': current = totalRevenue; break;
      case 'xp_earned': current = state.profile.totalXpEarned; break;
      case 'combo_max': current = state.combo.maxCombo; break;
      case 'level_reached': current = state.profile.level; break;
    }
    return { current, target: ach.condition.target, pct: Math.min(100, (current / ach.condition.target) * 100) };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🏆 Достижения</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Разблокировано: {state.unlockedAchievements.length} / {state.achievements.length}
      </p>

      {/* Collections */}
      <div className="mb-8">
        <h2 className="text-lg font-display font-semibold text-foreground mb-3">🎖 Коллекции</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {state.collections.map(col => {
            const completed = state.completedCollections.includes(col.id);
            const unlocked = col.achievementIds.filter(id => state.unlockedAchievements.includes(id)).length;
            const total = col.achievementIds.length;
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`widget-card ${completed ? 'border-accent' : ''}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{col.icon}</span>
                  <div>
                    <div className="font-display font-semibold text-foreground">{col.name}</div>
                    <div className="text-xs text-muted-foreground">{unlocked}/{total} достижений</div>
                  </div>
                </div>
                <Progress value={(unlocked / total) * 100} className="h-2 mb-1" />
                <div className="flex justify-between">
                  <span className="text-xs text-accent">+{col.bonusXp} XP бонус</span>
                  {completed && <span className="text-xs text-primary font-medium">✅ Собрано</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* All achievements */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((ach, i) => {
          const unlocked = state.unlockedAchievements.includes(ach.id);
          const progress = getProgress(ach);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`achievement-card ${unlocked ? 'unlocked' : 'opacity-60'}`}
            >
              <div className="text-3xl mb-2">{ach.icon}</div>
              <div className="font-display font-semibold text-foreground">{ach.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{ach.description}</div>
              {!unlocked && (
                <div className="mt-2">
                  <Progress value={progress.pct} className="h-1.5" />
                  <div className="text-xs text-muted-foreground mt-0.5">{progress.current}/{progress.target}</div>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs font-medium text-accent">+{ach.xpReward} XP</span>
                {unlocked && <span className="text-xs text-primary font-medium">✅ Получено</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
