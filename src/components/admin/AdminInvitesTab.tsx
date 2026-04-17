import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Copy, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Invite {
  id: string; code: string; created_at: string; expires_at: string;
  used_by: string | null; used_at: string | null;
}

export default function AdminInvitesTab() {
  const [invites, setInvites] = useState<Invite[]>([]);

  const load = async () => {
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
    setInvites((data as Invite[]) || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const code = Array.from({ length: 8 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
    const { error } = await supabase.from('invites').insert({ code, created_by: user.id });
    if (error) return toast.error(error.message);
    await supabase.from('audit_log').insert({
      actor_id: user.id, actor_name: user.email || '', action: 'create_invite',
      entity_type: 'invite', entity_id: code, details: {},
    });
    toast.success('Инвайт создан');
    load();
  };

  const revoke = async (id: string, code: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('invites').delete().eq('id', id);
    if (user) await supabase.from('audit_log').insert({
      actor_id: user.id, actor_name: user.email || '', action: 'revoke_invite',
      entity_type: 'invite', entity_id: code, details: {},
    });
    toast.success('Инвайт отозван');
    load();
  };

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite?code=${code}`);
    toast.success('Ссылка скопирована');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold">Приглашения менеджеров</h3>
          <p className="text-xs text-muted-foreground">Создавайте инвайт-ссылки для регистрации новых менеджеров</p>
        </div>
        <Button onClick={create} className="quick-action-btn"><Plus className="w-4 h-4" /> Создать инвайт</Button>
      </div>

      {invites.length === 0 ? (
        <Card className="glass p-12 text-center text-muted-foreground">
          <Send className="w-12 h-12 mx-auto mb-3 opacity-30" />
          Пока нет приглашений
        </Card>
      ) : (
        <div className="grid gap-3">
          {invites.map(inv => {
            const isUsed = !!inv.used_by;
            const expired = new Date(inv.expires_at) < new Date();
            return (
              <Card key={inv.id} className="glass p-4 flex items-center gap-3 flex-wrap">
                <code className="px-3 py-1.5 rounded-lg bg-muted font-mono text-sm font-semibold text-primary">{inv.code}</code>
                {isUsed ? <Badge variant="secondary">Использован</Badge> : expired ? <Badge variant="destructive">Истёк</Badge> : <Badge className="bg-primary/15 text-primary border-primary/20">Активен</Badge>}
                <span className="text-xs text-muted-foreground ml-auto">
                  {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true, locale: ru })}
                </span>
                {!isUsed && !expired && (
                  <Button size="sm" variant="ghost" onClick={() => copyLink(inv.code)}><Copy className="w-4 h-4" /></Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => revoke(inv.id, inv.code)} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
