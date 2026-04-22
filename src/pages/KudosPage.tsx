import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

const EMOJIS = ['👏', '🔥', '🚀', '🌟', '💪', '🏆'];

export default function KudosPage() {
  const { user } = useAuth();
  const [kudos, setKudos] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({ to_user_id: '', message: '', emoji: '👏' });

  const load = async () => {
    const { data: k } = await supabase.from('kudos').select('*').order('created_at', { ascending: false }).limit(50);
    setKudos(k ?? []);
    const { data: p } = await supabase.from('profiles').select('user_id, name');
    const map: Record<string, any> = {};
    (p ?? []).forEach((x: any) => { map[x.user_id] = x; });
    setProfiles(map);
    if (user) setUsers((p ?? []).filter((x: any) => x.user_id !== user.id));
  };
  useEffect(() => { load(); }, [user]);

  const send = async () => {
    if (!user || !form.to_user_id) return;
    await supabase.from('kudos').insert({ from_user_id: user.id, ...form });
    setForm({ to_user_id: '', message: '', emoji: '👏' });
    toast.success('Благодарность отправлена!');
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Heart className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Kudos / Благодарности</h1><p className="page-subtitle">Поблагодари коллегу публично</p></div>
      </div>

      <Card className="p-5 glass space-y-3">
        <Select value={form.to_user_id} onValueChange={(v) => setForm({ ...form, to_user_id: v })}>
          <SelectTrigger><SelectValue placeholder="Кому?" /></SelectTrigger>
          <SelectContent>{users.map(u => <SelectItem key={u.user_id} value={u.user_id}>{u.name}</SelectItem>)}</SelectContent>
        </Select>
        <div className="flex gap-2">
          {EMOJIS.map(e => <button key={e} onClick={() => setForm({ ...form, emoji: e })} className={`text-2xl p-2 rounded ${form.emoji === e ? 'bg-primary/20' : 'hover:bg-muted'}`}>{e}</button>)}
        </div>
        <Input placeholder="За что благодаришь?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
        <Button onClick={send} className="w-full">Отправить</Button>
      </Card>

      <div className="space-y-2">
        {kudos.map(k => (
          <Card key={k.id} className="p-4 glass">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{k.emoji}</span>
              <div className="flex-1">
                <p className="text-sm"><b>{profiles[k.from_user_id]?.name}</b> → <b>{profiles[k.to_user_id]?.name}</b></p>
                <p className="text-sm text-muted-foreground mt-1">{k.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{new Date(k.created_at).toLocaleString()}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
