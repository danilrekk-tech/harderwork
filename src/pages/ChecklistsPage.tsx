import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ListChecks, Plus, Trash2 } from 'lucide-react';

export default function ChecklistsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [title, setTitle] = useState('');

  const load = async () => {
    if (!user) return;
    const { data: l } = await supabase.from('checklists').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    const { data: i } = await supabase.from('checklist_items').select('*').order('position');
    setLists(l ?? []); setItems(i ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !title.trim()) return;
    await supabase.from('checklists').insert({ user_id: user.id, title });
    setTitle(''); load();
  };
  const addItem = async (lid: string) => {
    const t = prompt('Текст пункта?'); if (!t) return;
    await supabase.from('checklist_items').insert({ checklist_id: lid, text: t });
    load();
  };
  const toggle = async (id: string, v: boolean) => { await supabase.from('checklist_items').update({ completed: v }).eq('id', id); load(); };
  const del = async (id: string) => { await supabase.from('checklists').delete().eq('id', id); load(); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><ListChecks className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Чек-листы</h1><p className="page-subtitle">Для каждого этапа сделки</p></div>
      </div>

      <Card className="p-4 glass flex gap-2">
        <Input placeholder="Название чек-листа" value={title} onChange={e => setTitle(e.target.value)} />
        <Button onClick={create}><Plus className="w-4 h-4 mr-2" />Создать</Button>
      </Card>

      <div className="space-y-3">
        {lists.map(l => {
          const its = items.filter(i => i.checklist_id === l.id);
          const done = its.filter(i => i.completed).length;
          const pct = its.length ? (done / its.length) * 100 : 0;
          return (
            <Card key={l.id} className="p-4 glass">
              <div className="flex justify-between items-center"><h3 className="font-semibold">{l.title}</h3><Button size="icon" variant="ghost" onClick={() => del(l.id)}><Trash2 className="w-4 h-4" /></Button></div>
              <Progress value={pct} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{done} / {its.length}</p>
              <div className="space-y-1 mt-3">
                {its.map(i => (
                  <div key={i.id} className="flex items-center gap-2">
                    <Checkbox checked={i.completed} onCheckedChange={(v) => toggle(i.id, !!v)} />
                    <span className={`text-sm ${i.completed ? 'line-through text-muted-foreground' : ''}`}>{i.text}</span>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => addItem(l.id)}>+ пункт</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
