import { useApp } from '@/context/AppContext';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function NearAchievementsWidget() {
  const { state } = useApp();

  const nearAchievements = useMemo(() => {
    const issuedCount = state.invoices.length;
    const paidCount = state.invoices.filter(i => i.status === 'paid').length;
    const clientCount = state.profile.processedClientsCount;
    const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

    return state.achievements
      .filter(a => !state.unlockedAchievements.includes(a.id))
      .map(a => {
        let current = 0;
        switch (a.condition.type) {
          case 'invoices_issued': current = issuedCount; break;
          case 'invoices_paid': current = paidCount; break;
          case 'clients_processed': current = clientCount; break;
          case 'streak_days': current = state.profile.streakDays; break;
          case 'total_revenue': current = totalRevenue; break;
          case 'xp_earned': current = state.profile.totalXpEarned; break;
          case 'combo_max': current = state.combo.maxCombo; break;
          case 'level_reached': current = state.profile.level; break;
          default: current = 0;
        }
        const pct = Math.min(100, (current / a.condition.target) * 100);
        return { ...a, current, pct };
      })
      .filter(a => a.pct >= 30)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [state]);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">🎯 Почти достигнуто</h3>
      {nearAchievements.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Начните действовать для прогресса!</p>
      ) : (
        <div className="space-y-3">
          {nearAchievements.map(ach => (
            <div key={ach.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{ach.icon} {ach.title}</span>
                <span className="text-xs text-muted-foreground">{ach.current}/{ach.condition.target}</span>
              </div>
              <Progress value={ach.pct} className="h-2" />
              <div className="flex justify-between">
                <span className="text-xs text-muted-foreground">{ach.description}</span>
                <span className="text-xs text-accent">+{ach.xpReward} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
