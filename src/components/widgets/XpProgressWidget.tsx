import { useApp } from '@/context/AppContext';

export default function XpProgressWidget() {
  const { state } = useApp();
  const { profile } = state;
  const xpPercent = profile.xpToNextLevel > 0 ? Math.min(100, (profile.xp / profile.xpToNextLevel) * 100) : 0;

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">⚡ XP Прогресс</h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="level-badge">Ур. {profile.level}</div>
        <div className="text-sm text-muted-foreground">Всего заработано: {profile.totalXpEarned} XP</div>
      </div>
      <div className="xp-bar h-4">
        <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
        <span>{profile.xp} XP</span>
        <span>{profile.xpToNextLevel} XP</span>
      </div>
    </div>
  );
}
