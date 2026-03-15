import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';

export default function WorkDaysWidget() {
  const { state } = useApp();

  const daysLeft = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    let count = 0;
    for (let d = now.getDate() + 1; d <= lastDay; d++) {
      const dayOfWeek = new Date(year, month, d).getDay();
      if (state.workSchedule.workDays.includes(dayOfWeek)) count++;
    }
    return count;
  }, [state.workSchedule.workDays]);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">📅 Рабочие дни</h3>
      <div className="stat-value text-foreground">{daysLeft}</div>
      <div className="stat-label">До конца месяца</div>
    </div>
  );
}
