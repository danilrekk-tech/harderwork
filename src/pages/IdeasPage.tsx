import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function IdeasPage() {
  const { user, role } = useAuth();
  const [ideas, setIdeas] = useState<any[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'general' });

  const load = async () => {
    const { data } = await supabase.from('ideas').select('*');
    const { data: v } = await supabase.from('idea_votes').select('*');
    setIdeas(data ?? []);
    setVotes(v ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    await supabase.from('ideas').insert({ ...form, user_id: user.id });
    setOpen(false); setForm({ title: '', description: '', category: 'general' });
    load();
  };

  const vote = async (ideaId: string) => {
    if (!user) return;
    const exist = votes.find(v => v.idea_id === ideaId && v.user_id === user.id);
    if (exist) await supabase.from('idea_votes').delete().eq('id', exist.id);
    else await supabase.from('idea_votes').insert({ idea_id: ideaId, user_id: user.id });
    load();
  };

  const setStatus = async (id: string, status: string) => {
    await supabase.from('ideas').update({ status }).eq('id', id);
    load();
  };

  const sorted = [...ideas].sort((a, b) => votes.filter(v => v.idea_id === b.id).length - votes.filter(v => v.idea_id === a.id).length);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Lightbulb className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Доска идей</h1><p className="page-subtitle">Предложи и проголосуй</p></div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Идея</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая идея</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Название" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              <Textarea placeholder="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Button onClick={create} className="w-full">Опубликовать</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sorted.map(i => {
          const count = votes.filter(v => v.idea_id === i.id).length;
          const voted = votes.some(v => v.idea_id === i.id && v.user_id === user?.id);
          return (
            <Card key={i.id} className="p-4 glass flex gap-3">
              <button onClick={() => vote(i.id)} className={`flex flex-col items-center px-3 py-2 rounded-lg ${voted ? 'bg-primary/20' : 'hover:bg-muted'}`}>
                <ArrowUp className="w-4 h-4" />
                <span className="font-bold">{count}</span>
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-semibold">{i.title}</h3><Badge variant="outline">{i.status}</Badge></div>
                <p className="text-sm text-muted-foreground mt-1">{i.description}</p>
                {role === 'leader' && (
                  <div className="flex gap-1 mt-2">
                    {['open', 'planned', 'in_progress', 'done', 'rejected'].map(s => (
                      <Button key={s} size="sm" variant={i.status === s ? 'default' : 'outline'} onClick={() => setStatus(i.id, s)}>{s}</Button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
