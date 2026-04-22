import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, Play, Square } from 'lucide-react';

export default function CallTimerPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [outcome, setOutcome] = useState('neutral');
  const [notes, setNotes] = useState('');
  const intervalRef = useRef<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('call_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
    setHistory(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const start = () => { setActive(true); setSeconds(0); intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000); };
  const stop = async () => {
    clearInterval(intervalRef.current); setActive(false);
    if (!user) return;
    await supabase.from('call_logs').insert({ user_id: user.id, duration_seconds: seconds, outcome, notes });
    setNotes(''); setSeconds(0); load();
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const total = history.reduce((s, h) => s + h.duration_seconds, 0);
  const today = history.filter(h => new Date(h.created_at).toDateString() === new Date().toDateString()).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><PhoneCall className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Таймер звонков</h1><p className="page-subtitle">Сегодня: {today} · всего: {fmt(total)}</p></div>
      </div>

      <Card className="p-6 glass text-center">
        <div className="text-6xl font-bold tabular-nums mb-4">{fmt(seconds)}</div>
        <div className="flex gap-2 justify-center">
          {!active ? <Button size="lg" onClick={start}><Play className="w-4 h-4 mr-2" />Начать звонок</Button>
            : <Button size="lg" variant="destructive" onClick={stop}><Square className="w-4 h-4 mr-2" />Завершить</Button>}
        </div>
        {active && (
          <div className="mt-4 space-y-2">
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="success">✅ Успех</SelectItem>
                <SelectItem value="callback">📞 Перезвонить</SelectItem>
                <SelectItem value="neutral">😐 Нейтрально</SelectItem>
                <SelectItem value="reject">❌ Отказ</SelectItem>
              </SelectContent>
            </Select>
            <Textarea placeholder="Заметки" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        )}
      </Card>

      <div className="space-y-2">
        {history.map(h => (
          <Card key={h.id} className="p-3 glass flex justify-between text-sm">
            <div>
              <Badge variant="outline">{h.outcome}</Badge>
              <span className="ml-2">{fmt(h.duration_seconds)}</span>
              {h.notes && <p className="text-xs text-muted-foreground mt-1">{h.notes}</p>}
            </div>
            <span className="text-muted-foreground text-xs">{new Date(h.created_at).toLocaleString()}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
