import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroProPage() {
  const { user } = useAuth();
  const [duration, setDuration] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const startedRef = useRef<string | null>(null);
  const sessionId = useRef<string | null>(null);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) finish(true);
  }, [seconds]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('pomodoro_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(20);
    setHistory(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const start = async () => {
    if (!user) return;
    setSeconds(duration * 60);
    setRunning(true);
    startedRef.current = new Date().toISOString();
    const { data } = await supabase.from('pomodoro_sessions').insert({ user_id: user.id, duration_minutes: duration, task_label: task }).select().single();
    sessionId.current = data?.id ?? null;
  };
  const finish = async (completed: boolean) => {
    setRunning(false);
    if (sessionId.current) await supabase.from('pomodoro_sessions').update({ completed, ended_at: new Date().toISOString() }).eq('id', sessionId.current);
    sessionId.current = null;
    load();
  };

  const todayCount = history.filter(h => new Date(h.started_at).toDateString() === new Date().toDateString() && h.completed).length;
  const totalMin = history.filter(h => h.completed).reduce((s, h) => s + h.duration_minutes, 0);
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Timer className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Pomodoro Pro</h1><p className="page-subtitle">Сегодня: {todayCount} сессий · всего: {totalMin} мин</p></div>
      </div>

      <Card className="p-8 glass text-center">
        <div className="text-7xl font-bold mb-4 tabular-nums">{mm}:{ss}</div>
        <Input placeholder="Над чем работаешь?" value={task} onChange={e => setTask(e.target.value)} className="mb-3 max-w-sm mx-auto" />
        <div className="flex gap-2 justify-center">
          <Input type="number" value={duration} onChange={e => { setDuration(+e.target.value); setSeconds(+e.target.value * 60); }} className="w-20" disabled={running} />
          {!running ? <Button size="lg" onClick={start}><Play className="w-4 h-4 mr-2" />Старт</Button>
            : <Button size="lg" variant="destructive" onClick={() => finish(false)}><Pause className="w-4 h-4 mr-2" />Стоп</Button>}
          <Button size="lg" variant="outline" onClick={() => setSeconds(duration * 60)}><RotateCcw className="w-4 h-4" /></Button>
        </div>
      </Card>

      <div className="space-y-2">
        <h3 className="font-semibold">История</h3>
        {history.map(h => (
          <Card key={h.id} className="p-3 glass flex justify-between text-sm">
            <span>{h.task_label || 'Без названия'}</span>
            <span className="text-muted-foreground">{h.duration_minutes} мин · {new Date(h.started_at).toLocaleString()} {h.completed ? '✅' : '❌'}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
