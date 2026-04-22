import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Target } from 'lucide-react';
import { toast } from 'sonner';

export default function LeadScoringPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [scores, setScores] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const load = async () => {
    if (!user) return;
    const { data: cs } = await supabase.from('clients').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setClients(cs ?? []);
    const { data: ls } = await supabase.from('lead_scores').select('*').eq('user_id', user.id);
    const map: Record<string, any> = {};
    (ls ?? []).forEach((s: any) => { map[s.client_id] = s; });
    setScores(map);
  };
  useEffect(() => { load(); }, [user]);

  const score = async (client: any) => {
    setLoading(client.id);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tools', { body: { task: 'lead_score', payload: { client } } });
      if (error) throw error;
      await supabase.from('lead_scores').upsert({ client_id: client.id, user_id: user!.id, ...data }, { onConflict: 'client_id' });
      toast.success(`Оценка: ${data.score}/100`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(null);
    }
  };

  const tier = (s: number) => s >= 75 ? { color: 'bg-green-500', label: '🔥 Горячий' } : s >= 50 ? { color: 'bg-amber-500', label: '☀️ Тёплый' } : { color: 'bg-blue-500', label: '❄️ Холодный' };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">AI Скоринг лидов</h1><p className="page-subtitle">Оцени вероятность закрытия по каждому клиенту</p></div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {clients.map(c => {
          const s = scores[c.id];
          return (
            <Card key={c.id} className="p-4 glass">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{c.name || 'Без имени'}</h3>
                  <p className="text-xs text-muted-foreground">{c.company} · {c.product}</p>
                </div>
                {s && <Badge className={tier(s.score).color}>{tier(s.score).label}</Badge>}
              </div>
              {s ? (
                <div className="mt-3 space-y-2">
                  <Progress value={s.score} />
                  <div className="text-sm font-medium">Оценка: {s.score}/100</div>
                  <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                  <div className="text-sm bg-primary/10 p-2 rounded"><b>Что делать:</b> {s.next_action}</div>
                </div>
              ) : (
                <Button size="sm" className="mt-3" disabled={loading === c.id} onClick={() => score(c)}>
                  <Sparkles className="w-4 h-4 mr-2" />{loading === c.id ? 'Анализ...' : 'Оценить AI'}
                </Button>
              )}
            </Card>
          );
        })}
        {clients.length === 0 && <Card className="p-8 text-center text-muted-foreground glass col-span-2">Нет клиентов</Card>}
      </div>
    </div>
  );
}
