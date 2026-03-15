import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function ShiftTimerWidget() {
  const { state } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    function update() {
      const now = new Date();
      const dayOfWeek = now.getDay();
      if (!state.workSchedule.workDays.includes(dayOfWeek)) {
        setTimeLeft('Выходной');
        setIsWorking(false);
        return;
      }

      const [eh, em] = state.workSchedule.endTime.split(':').map(Number);
      const [sh, sm] = state.workSchedule.startTime.split(':').map(Number);
      const end = new Date(now);
      end.setHours(eh, em, 0, 0);
      const start = new Date(now);
      start.setHours(sh, sm, 0, 0);

      if (now < start) {
        setTimeLeft('Смена ещё не началась');
        setIsWorking(false);
        return;
      }

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Смена окончена!');
        setIsWorking(false);
        return;
      }

      setIsWorking(true);
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}ч ${m}м ${s}с`);
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [state.workSchedule]);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">⏱ Таймер смены</h3>
      <div className={`stat-value ${isWorking ? 'text-primary' : 'text-muted-foreground'}`}>
        {timeLeft}
      </div>
      <div className="stat-label">
        {state.workSchedule.startTime} — {state.workSchedule.endTime}
      </div>
    </div>
  );
}
