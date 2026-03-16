import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

export default function ActivityHeatmapWidget() {
  const { state } = useApp();

  const heatmapData = useMemo(() => {
    const days: { date: string; count: number; level: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const count = state.eventLog.filter(e => e.timestamp.startsWith(dateStr)).length;
      const level = count === 0 ? 0 : count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      days.push({ date: dateStr, count, level });
    }
    return days;
  }, [state.eventLog]);

  const levelColors = [
    'bg-muted',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/70',
    'bg-primary',
  ];

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">📊 Карта активности</h3>
      <div className="grid grid-cols-10 gap-1">
        {heatmapData.map(day => (
          <div
            key={day.date}
            className={`aspect-square rounded-sm ${levelColors[day.level]} transition-colors`}
            title={`${day.date}: ${day.count} действий`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-muted-foreground">Меньше</span>
        {levelColors.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-muted-foreground">Больше</span>
      </div>
    </div>
  );
}
