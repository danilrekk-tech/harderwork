import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

interface LeaderboardEntry {
  user_id: string;
  name: string;
  level: number;
  total_xp_earned: number;
  revenue: number;
  paid_count: number;
  streak_days: number;
}

interface Season {
  number: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const medals = ['🥇', '🥈', '🥉'];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load active season
    const { data: seasonData } = await supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    if (seasonData) setSeason(seasonData as unknown as Season);

    // Load all managers
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'manager' as any);
    
    if (!roles?.length) { setLoading(false); return; }
    
    const managerIds = roles.map(r => r.user_id);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, name, level, total_xp_earned, streak_days')
      .in('user_id', managerIds);

    const { data: invoices } = await supabase
      .from('invoices')
      .select('user_id, amount, status');

    const leaderboard: LeaderboardEntry[] = (profiles || []).map((p: any) => {
      const userInvoices = (invoices || []).filter(i => i.user_id === p.user_id);
      const paid = userInvoices.filter(i => i.status === 'paid');
      return {
        user_id: p.user_id,
        name: p.name,
        level: p.level,
        total_xp_earned: p.total_xp_earned,
        revenue: paid.reduce((s: number, i: any) => s + Number(i.amount), 0),
        paid_count: paid.length,
        streak_days: p.streak_days,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    setEntries(leaderboard);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">📊 Лидерборд</h1>

      {/* Season Info */}
      <Card className="widget-card mb-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-foreground">
              🏆 {season ? `Сезон ${season.number}` : 'Текущий сезон'}
            </span>
            {season && (
              <p className="text-xs text-muted-foreground">
                {new Date(season.start_date).toLocaleDateString('ru-RU')} — {new Date(season.end_date).toLocaleDateString('ru-RU')}
              </p>
            )}
          </div>
          {season?.is_active && (
            <span className="text-xs font-medium text-primary px-2 py-1 rounded-full bg-primary/10">Активный</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Лидерборд — рейтинг менеджеров по результатам продаж. Каждый сезон длится месяц. Лучшие менеджеры получают бонусные награды и признание.
        </p>
      </Card>

      {entries.length === 0 ? (
        <Card className="widget-card text-center py-8 text-muted-foreground">
          <p>Пока нет участников</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`widget-card flex items-center gap-4 ${i < 3 ? 'border-accent/30' : ''}`}
            >
              <div className="text-2xl w-10 text-center flex-shrink-0">
                {i < 3 ? medals[i] : <span className="text-muted-foreground text-lg">#{i + 1}</span>}
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                {entry.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{entry.name}</div>
                <div className="text-sm text-muted-foreground">{entry.paid_count} оплат • {entry.total_xp_earned.toLocaleString()} XP • 🔥 {entry.streak_days} дн.</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-foreground">{entry.revenue.toLocaleString()} ₽</div>
                <div className="level-badge text-xs mt-1">Ур. {entry.level}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
