import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function PollsPage() {
  const { user, role } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ question: string; options: string[] }>({ question: '', options: ['', ''] });

  const load = async () => {
    const { data } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
    const { data: v } = await supabase.from('poll_votes').select('*');
    setPolls(data ?? []); setVotes(v ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    await supabase.from('polls').insert({ question: form.question, options: form.options.filter(Boolean), created_by: user.id });
    setOpen(false); setForm({ question: '', options: ['', ''] }); load();
  };
  const vote = async (pollId: string, idx: number) => {
    if (!user) return;
    await supabase.from('poll_votes').upsert({ poll_id: pollId, user_id: user.id, option_index: idx }, { onConflict: 'poll_id,user_id' });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><BarChart3 className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Опросы</h1><p className="page-subtitle">Голосования команды</p></div>
        </div>
        {role === 'leader' && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Опрос</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Новый опрос</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Вопрос" value={form.question} onChange={e => setForm({ ...form, question: e.target.value })} />
                {form.options.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <Input placeholder={`Вариант ${i + 1}`} value={o} onChange={e => { const opts = [...form.options]; opts[i] = e.target.value; setForm({ ...form, options: opts }); }} />
                    <Button variant="ghost" size="icon" onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => setForm({ ...form, options: [...form.options, ''] })}>+ вариант</Button>
                <Button onClick={create} className="w-full">Создать</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-3">
        {polls.map(p => {
          const total = votes.filter(v => v.poll_id === p.id).length;
          const myVote = votes.find(v => v.poll_id === p.id && v.user_id === user?.id);
          return (
            <Card key={p.id} className="p-4 glass">
              <h3 className="font-semibold mb-3">{p.question}</h3>
              <div className="space-y-2">
                {(p.options as string[]).map((o, i) => {
                  const cnt = votes.filter(v => v.poll_id === p.id && v.option_index === i).length;
                  const pct = total ? (cnt / total) * 100 : 0;
                  return (
                    <button key={i} onClick={() => vote(p.id, i)} className={`w-full text-left p-3 rounded-lg ${myVote?.option_index === i ? 'bg-primary/20' : 'bg-muted/30 hover:bg-muted'}`}>
                      <div className="flex justify-between text-sm"><span>{o}</span><span>{cnt} ({pct.toFixed(0)}%)</span></div>
                      <Progress value={pct} className="mt-1" />
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Всего голосов: {total}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
