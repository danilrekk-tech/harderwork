import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MessageTemplatesPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', category: 'general' });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('message_templates').select('*').eq('user_id', user.id).order('use_count', { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const create = async () => {
    if (!user || !form.title.trim()) return;
    await supabase.from('message_templates').insert({ ...form, user_id: user.id });
    setForm({ title: '', body: '', category: 'general' }); load();
  };
  const copy = async (t: any) => {
    await navigator.clipboard.writeText(t.body);
    await supabase.from('message_templates').update({ use_count: t.use_count + 1 }).eq('id', t.id);
    toast.success('Скопировано');
    load();
  };
  const del = async (id: string) => { await supabase.from('message_templates').delete().eq('id', id); load(); };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><MessageCircle className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Шаблоны сообщений</h1><p className="page-subtitle">Быстрые ответы клиентам</p></div>
      </div>

      <Card className="p-5 glass space-y-3">
        <Input placeholder="Название" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Текст сообщения" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={3} />
        <Input placeholder="Категория" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <Button onClick={create}><Plus className="w-4 h-4 mr-2" />Сохранить</Button>
      </Card>

      <div className="space-y-2">
        {list.map(t => (
          <Card key={t.id} className="p-3 glass">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2"><h3 className="font-semibold">{t.title}</h3><Badge variant="outline">{t.category}</Badge><Badge variant="secondary">x{t.use_count}</Badge></div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{t.body}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => copy(t)}><Copy className="w-4 h-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => del(t.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
