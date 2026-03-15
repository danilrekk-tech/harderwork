import { useApp } from '@/context/AppContext';

export default function LeaderboardWidget() {
  const { state } = useApp();
  const top = state.leaderboard.slice(0, 3);
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">🏆 Топ менеджеров</h3>
      <div className="space-y-2">
        {top.map((entry, i) => (
          <div key={entry.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <span className="text-lg">{medals[i]}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{entry.name}</div>
              <div className="text-xs text-muted-foreground">{entry.revenue.toLocaleString()} ₽</div>
            </div>
            <div className="level-badge text-xs">Ур. {entry.level}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
