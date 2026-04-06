import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Invite { id: string; code: string; created_at: string; expires_at: string; used_by: string | null; used_at: string | null; }

export default function InvitesPage() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('invites').select('*').order('created_at', { ascending: false });
    if (data) setInvites(data as unknown as Invite[]);
  }

  async function create() {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await supabase.from('invites').insert({ code, created_by: user!.id });
    toast.success('Инвайт создан');
    load();
  }

  async function revoke(id: string) {
    await supabase.from('invites').delete().eq('id', id);
    toast.success('Инвайт отозван');
    load();
  }

  function copyLink(code: string) {
    navigator.clipboard.writeText(`${window.location.origin}/invite?code=${code}`);
    toast.success('Ссылка скопирована');
  }

  const active = invites.filter(i => !i.used_by && new Date(i.expires_at) > new Date());
  const used = invites.filter(i => i.used_by);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📨 Приглашения</h1>
      <div className="flex justify-end mb-4">
        <Button onClick={create}>Создать инвайт</Button>
      </div>
      
      <h2 className="font-display font-semibold text-foreground mb-3">Активные ({active.length})</h2>
      {active.length === 0 ? (
        <div className="widget-card text-center py-4 text-muted-foreground mb-6">Нет активных</div>
      ) : (
        <div className="space-y-2 mb-6">
          {active.map((inv, i) => (
            <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
              <Card className="p-3 widget-card flex items-center justify-between">
                <div>
                  <code className="text-sm font-mono text-foreground">{inv.code}</code>
                  <div className="text-xs text-muted-foreground">До: {new Date(inv.expires_at).toLocaleDateString('ru-RU')}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => copyLink(inv.code)}><Copy className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => revoke(inv.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {used.length > 0 && (
        <>
          <h2 className="font-display font-semibold text-muted-foreground mb-3">Использованные ({used.length})</h2>
          <div className="space-y-2 opacity-60">
            {used.map(inv => (
              <Card key={inv.id} className="p-3 widget-card flex items-center gap-2">
                <Badge variant="secondary">✅</Badge>
                <code className="text-sm font-mono">{inv.code}</code>
                <span className="text-xs text-muted-foreground ml-auto">{inv.used_at && new Date(inv.used_at).toLocaleDateString('ru-RU')}</span>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
