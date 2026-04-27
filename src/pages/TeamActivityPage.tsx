import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface ActionRow { id: string; type: string; description: string; xp_earned: number; timestamp: string; manager_name: string | null; user_id: string; }

const TYPE_ICONS: Record<string, string> = {
  client_added: '👤', invoice_issued: '📄', invoice_paid: '💰',
  plan_completed: '🎯', achievement_unlocked: '🏆', level_up: '⬆️',
  focus_completed: '🎯', record_broken: '🏅', combo: '🔥',
};

export default function TeamActivityPage() {
  const [events, setEvents] = useState<ActionRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`team-activity-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'action_events' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function load() {
    const [{ data: evts }, { data: profs }] = await Promise.all([
      supabase.from('action_events').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('profiles').select('user_id, name'),
    ]);
    if (evts) setEvents(evts as unknown as ActionRow[]);
    if (profs) { const map: Record<string, string> = {}; (profs as any[]).forEach(p => map[p.user_id] = p.name); setProfiles(map); }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">📡 Лента активности</h1>
      <p className="text-muted-foreground text-sm mb-6">Обновляется в реальном времени</p>
      {events.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Нет событий</div>
      ) : (
        <div className="space-y-2">
          {events.map((e, i) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}>
              <Card className="p-3 widget-card flex items-center gap-3">
                <div className="text-xl">{TYPE_ICONS[e.type] || '📌'}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground">{profiles[e.user_id] || e.manager_name || '—'}: {e.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleString('ru-RU')}</div>
                </div>
                {e.xp_earned > 0 && <span className="text-xs font-semibold text-accent">+{e.xp_earned} XP</span>}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
