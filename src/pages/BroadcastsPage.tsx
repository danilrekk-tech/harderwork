import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function BroadcastsPage() {
  const { user } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', audience: 'all' });

  const load = async () => {
    const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false });
    setList(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const send = async () => {
    if (!user) return;
    const filter: any = supabase.from('user_roles').select('user_id');
    if (form.audience !== 'all') filter.eq('role', form.audience);
    const { data: roles } = await filter;
    const ids = (roles ?? []).map((r: any) => r.user_id);
    const notifs = ids.map((uid: string) => ({ user_id: uid, type: 'broadcast', title: form.title, body: form.body }));
    if (notifs.length) await supabase.from('notifications').insert(notifs);
    await supabase.from('broadcasts').insert({ ...form, sent_by: user.id, recipients_count: ids.length });
    toast.success(`Отправлено ${ids.length} получателям`);
    setForm({ title: '', body: '', audience: 'all' });
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Megaphone className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Массовые рассылки</h1><p className="page-subtitle">Уведомление всей команде</p></div>
      </div>

      <Card className="p-5 glass space-y-3">
        <Input placeholder="Заголовок" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <Textarea placeholder="Сообщение" value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={4} />
        <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Всем</SelectItem>
            <SelectItem value="manager">Только менеджерам</SelectItem>
            <SelectItem value="leader">Только руководителям</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={send} disabled={!form.title.trim()} className="w-full"><Send className="w-4 h-4 mr-2" />Отправить</Button>
      </Card>

      <div className="space-y-2">
        {list.map(b => (
          <Card key={b.id} className="p-3 glass">
            <div className="flex justify-between"><h3 className="font-semibold">{b.title}</h3><span className="text-xs text-muted-foreground">{b.recipients_count} получ.</span></div>
            <p className="text-sm text-muted-foreground">{b.body}</p>
            <p className="text-xs text-muted-foreground mt-1">{new Date(b.created_at).toLocaleString()} · {b.audience}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
