import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function AchievementsPage() {
  const { state } = useApp();

  const sorted = [...state.achievements].sort((a, b) => {
    const aUnlocked = state.unlockedAchievements.includes(a.id);
    const bUnlocked = state.unlockedAchievements.includes(b.id);
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🏆 Достижения</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Разблокировано: {state.unlockedAchievements.length} / {state.achievements.length}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((ach, i) => {
          const unlocked = state.unlockedAchievements.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`achievement-card ${unlocked ? 'unlocked' : 'opacity-60'}`}
            >
              <div className="text-3xl mb-2">{ach.icon}</div>
              <div className="font-display font-semibold text-foreground">{ach.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{ach.description}</div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs font-medium text-accent">+{ach.xpReward} XP</span>
                {unlocked && <span className="text-xs text-success font-medium">✅ Получено</span>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
