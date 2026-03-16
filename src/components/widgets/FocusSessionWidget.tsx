import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square } from 'lucide-react';

export default function FocusSessionWidget() {
  const { state, startFocusSession, endFocusSession } = useApp();
  const [duration, setDuration] = useState('25');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!state.focusSession.isActive || !state.focusSession.startedAt) return;
    const interval = setInterval(() => {
      const elapsed = (Date.now() - new Date(state.focusSession.startedAt!).getTime()) / 1000;
      const total = state.focusSession.durationMinutes * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        endFocusSession();
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.focusSession.isActive, state.focusSession.startedAt, endFocusSession]);

  const mins = Math.floor(timeLeft / 60);
  const secs = Math.floor(timeLeft % 60);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">🎯 Фокус-сессия</h3>
      {state.focusSession.isActive ? (
        <div className="text-center">
          <div className="stat-value text-4xl text-primary mb-2">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <p className="text-sm text-muted-foreground mb-2">
            Действий: {state.focusSession.actionsCount} | +{state.focusSession.bonusXpPercent}% XP
          </p>
          <Button variant="destructive" size="sm" onClick={endFocusSession}>
            <Square className="w-4 h-4 mr-1" /> Завершить
          </Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 минут</SelectItem>
              <SelectItem value="25">25 минут</SelectItem>
              <SelectItem value="45">45 минут</SelectItem>
              <SelectItem value="60">60 минут</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => startFocusSession(Number(duration))} className="w-full">
            <Play className="w-4 h-4 mr-1" /> Начать фокус
          </Button>
          <p className="text-xs text-muted-foreground">+25% к XP за каждое действие во время сессии</p>
        </div>
      )}
    </div>
  );
}
