import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuestsPage() {
  const { user, role } = useAuth();
  const [quests, setQuests] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', icon: '🗺️', target_value: 10, xp_reward: 100, quest_type: 'daily', target_metric: 'revenue' });

  const load = async () => {
    const { data: q } = await supabase.from('quests').select('*').eq('is_active', true).order('created_at', { ascending: false });
    setQuests(q ?? []);
    if (user) {
      const { data: p } = await supabase.from('user_quests').select('*').eq('user_id', user.id);
      const map: Record<string, any> = {};
      (p ?? []).forEach((x: any) => { map[x.quest_id] = x; });
      setProgress(map);
    }
  };
  useEffect(() => { load(); }, [user]);

  const claim = async (qst: any) => {
    if (!user) return;
    const cur = progress[qst.id];
    if (cur?.completed) return;
    await supabase.from('user_quests').upsert({ user_id: user.id, quest_id: qst.id, progress: qst.target_value, completed: true, completed_at: new Date().toISOString() }, { onConflict: 'user_id,quest_id' });
    await supabase.rpc('increment_xp' as any, { _user_id: user.id, _amount: qst.xp_reward }).catch(() => {});
    toast.success(`+${qst.xp_reward} XP за квест!`);
    load();
  };

  const create = async () => {
    if (!user) return;
    await supabase.from('quests').insert({ ...form, created_by: user.id });
    setOpen(false);
    load();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><ScrollText className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Квесты</h1><p className="page-subtitle">Выполняй цели и получай XP</p></div>
        </div>
        {role === 'leader' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Создать квест</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Новый квест</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Название" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                <Textarea placeholder="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Иконка" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />
                  <Select value={form.quest_type} onValueChange={(v) => setForm({ ...form, quest_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="daily">Дневной</SelectItem><SelectItem value="weekly">Недельный</SelectItem><SelectItem value="epic">Эпический</SelectItem></SelectContent>
                  </Select>
                  <Input type="number" placeholder="Цель" value={form.target_value} onChange={e => setForm({ ...form, target_value: +e.target.value })} />
                  <Input type="number" placeholder="XP награда" value={form.xp_reward} onChange={e => setForm({ ...form, xp_reward: +e.target.value })} />
                </div>
                <Button onClick={create} className="w-full"><Sparkles className="w-4 h-4 mr-2" />Создать</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {quests.map(q => {
          const p = progress[q.id];
          const pct = p ? Math.min(100, (p.progress / q.target_value) * 100) : 0;
          return (
            <Card key={q.id} className="p-5 glass">
              <div className="flex items-start gap-3">
                <div className="text-4xl">{q.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 className="font-semibold">{q.title}</h3><Badge variant="outline">{q.quest_type}</Badge></div>
                  <p className="text-sm text-muted-foreground mt-1">{q.description}</p>
                  <Progress value={pct} className="mt-3" />
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-muted-foreground">{p?.progress ?? 0} / {q.target_value}</span>
                    <Button size="sm" disabled={p?.completed} onClick={() => claim(q)}>
                      {p?.completed ? 'Завершён' : `Забрать +${q.xp_reward} XP`}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {quests.length === 0 && <Card className="p-8 text-center text-muted-foreground glass">Нет активных квестов</Card>}
      </div>
    </div>
  );
}
