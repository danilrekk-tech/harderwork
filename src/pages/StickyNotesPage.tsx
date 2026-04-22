import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Plus, Trash2, Pin } from 'lucide-react';

const COLORS = ['yellow', 'pink', 'blue', 'green', 'purple'];
const BG: Record<string, string> = {
  yellow: 'bg-yellow-200 dark:bg-yellow-900/40',
  pink: 'bg-pink-200 dark:bg-pink-900/40',
  blue: 'bg-blue-200 dark:bg-blue-900/40',
  green: 'bg-green-200 dark:bg-green-900/40',
  purple: 'bg-purple-200 dark:bg-purple-900/40',
};

export default function StickyNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('sticky_notes').select('*').eq('user_id', user.id).order('pinned', { ascending: false });
    setNotes(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user) return;
    await supabase.from('sticky_notes').insert({ user_id: user.id, content: '', color: COLORS[Math.floor(Math.random() * COLORS.length)] });
    load();
  };
  const update = async (id: string, patch: any) => { await supabase.from('sticky_notes').update(patch).eq('id', id); load(); };
  const del = async (id: string) => { await supabase.from('sticky_notes').delete().eq('id', id); load(); };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><StickyNote className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Стикеры</h1><p className="page-subtitle">Цветные заметки</p></div>
        </div>
        <Button onClick={add}><Plus className="w-4 h-4 mr-2" />Добавить</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {notes.map(n => (
          <div key={n.id} className={`${BG[n.color]} rounded-xl p-3 shadow-md flex flex-col`}>
            <div className="flex justify-between mb-1">
              <button onClick={() => update(n.id, { pinned: !n.pinned })}><Pin className={`w-4 h-4 ${n.pinned ? 'fill-current' : ''}`} /></button>
              <button onClick={() => del(n.id)}><Trash2 className="w-4 h-4" /></button>
            </div>
            <Textarea defaultValue={n.content} onBlur={e => update(n.id, { content: e.target.value })} className="bg-transparent border-0 resize-none flex-1 focus-visible:ring-0" rows={5} />
            <div className="flex gap-1 mt-2">
              {COLORS.map(c => <button key={c} onClick={() => update(n.id, { color: c })} className={`w-4 h-4 rounded-full ${BG[c]} border`} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
