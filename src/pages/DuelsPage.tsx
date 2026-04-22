import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Swords, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DuelsPage() {
  const { user } = useAuth();
  const [duels, setDuels] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ opponent_id: '', metric: 'revenue', target: 50000, stake_xp: 100 });

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('duels').select('*').or(`challenger_id.eq.${user.id},opponent_id.eq.${user.id}`).order('created_at', { ascending: false });
    setDuels(data ?? []);
    const { data: u } = await supabase.from('profiles').select('user_id, name').neq('user_id', user.id);
    setUsers(u ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const challenge = async () => {
    if (!user || !form.opponent_id) return;
    await supabase.from('duels').insert({ challenger_id: user.id, ...form });
    toast.success('Вызов отправлен!');
    setOpen(false);
    load();
  };

  const accept = async (d: any) => {
    await supabase.from('duels').update({ status: 'active' }).eq('id', d.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Swords className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Дуэли</h1><p className="page-subtitle">Вызови коллегу на соревнование</p></div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" />Бросить вызов</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новая дуэль</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.opponent_id} onValueChange={(v) => setForm({ ...form, opponent_id: v })}>
                <SelectTrigger><SelectValue placeholder="Соперник" /></SelectTrigger>
                <SelectContent>{users.map(u => <SelectItem key={u.user_id} value={u.user_id}>{u.name}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Выручка</SelectItem>
                  <SelectItem value="clients">Клиенты</SelectItem>
                  <SelectItem value="invoices">Счета</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" placeholder="Цель" value={form.target} onChange={e => setForm({ ...form, target: +e.target.value })} />
              <Input type="number" placeholder="Ставка XP" value={form.stake_xp} onChange={e => setForm({ ...form, stake_xp: +e.target.value })} />
              <Button onClick={challenge} className="w-full">Бросить вызов</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {duels.map(d => (
          <Card key={d.id} className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant={d.status === 'active' ? 'default' : 'outline'}>{d.status}</Badge>
                <div className="mt-1 font-medium">{d.metric} · цель {d.target}</div>
                <div className="text-xs text-muted-foreground">Ставка: {d.stake_xp} XP · до {new Date(d.ends_at).toLocaleDateString()}</div>
              </div>
              {d.status === 'pending' && d.opponent_id === user?.id && <Button onClick={() => accept(d)}>Принять</Button>}
            </div>
          </Card>
        ))}
        {duels.length === 0 && <Card className="p-8 text-center text-muted-foreground glass">Нет активных дуэлей</Card>}
      </div>
    </div>
  );
}
