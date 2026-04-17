import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AuditEntry {
  id: string; actor_id: string; actor_name: string; action: string;
  entity_type: string; entity_id: string | null; details: any; created_at: string;
}

export default function AdminAuditLogTab() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(200);
      setEntries((data as AuditEntry[]) || []);
    })();

    const channel = supabase.channel('audit').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_log' }, (payload) => {
      setEntries(prev => [payload.new as AuditEntry, ...prev].slice(0, 200));
    }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = entries.filter(e =>
    !filter || e.action.includes(filter) || e.actor_name.toLowerCase().includes(filter.toLowerCase()) || e.entity_type.includes(filter)
  );

  const actionLabel = (a: string) => {
    const map: Record<string, string> = {
      delete_manager: '🗑️ Удалил менеджера', penalize: '⚠️ Назначил штраф',
      change_role: '🔄 Изменил роль', update_settings: '⚙️ Изменил настройки',
      revoke_invite: '🚫 Отозвал инвайт', create_invite: '📨 Создал инвайт',
    };
    return map[a] || a;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Фильтр по действию или автору..." value={filter} onChange={e => setFilter(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="secondary">{filtered.length} записей</Badge>
      </div>

      <Card className="glass">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            Нет записей в журнале
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(e => (
              <div key={e.id} className="p-4 flex items-start gap-3 hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{actionLabel(e.action)}</span>
                    <Badge variant="outline" className="text-xs">{e.entity_type}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {e.actor_name || 'Система'} • {formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: ru })}
                  </div>
                  {e.details && Object.keys(e.details).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                      {JSON.stringify(e.details)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
