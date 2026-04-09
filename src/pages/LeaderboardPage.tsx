import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Trophy, Crown, Flame, Star, Calendar } from 'lucide-react';

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

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const { data: seasonData } = await supabase.from('seasons').select('*').eq('is_active', true).maybeSingle();
    if (seasonData) setSeason(seasonData as unknown as Season);

    const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'manager' as any);
    if (!roles?.length) { setLoading(false); return; }

    const managerIds = roles.map(r => r.user_id);
    const { data: profiles } = await supabase.from('profiles').select('user_id, name, level, total_xp_earned, streak_days').in('user_id', managerIds);
    const { data: invoices } = await supabase.from('invoices').select('user_id, amount, status');

    const leaderboard: LeaderboardEntry[] = (profiles || []).map((p: any) => {
      const paid = (invoices || []).filter(i => i.user_id === p.user_id && i.status === 'paid');
      return {
        user_id: p.user_id, name: p.name, level: p.level,
        total_xp_earned: p.total_xp_earned,
        revenue: paid.reduce((s: number, i: any) => s + Number(i.amount), 0),
        paid_count: paid.length, streak_days: p.streak_days,
      };
    }).sort((a, b) => b.revenue - a.revenue);

    setEntries(leaderboard);
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse space-y-4">
        <div className="h-10 w-48 bg-muted rounded-lg" />
        <div className="h-24 bg-muted rounded-xl" />
        {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
      </div>
    );
  }

  const podiumColors = [
    'from-amber-500/20 to-amber-500/5 border-amber-500/30',
    'from-slate-400/20 to-slate-400/5 border-slate-400/30',
    'from-orange-600/20 to-orange-600/5 border-orange-600/30',
  ];
  const medals = ['🥇', '🥈', '🥉'];

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-2">
        <Crown className="w-7 h-7 text-accent" />
        Лидерборд
      </h1>

      {/* Season Card */}
      <Card className="widget-card mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/15">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-sm font-display font-bold text-foreground">
                {season ? `Сезон ${season.number}` : 'Текущий сезон'}
              </span>
              {season && (
                <p className="text-xs text-muted-foreground">
                  {new Date(season.start_date).toLocaleDateString('ru-RU')} — {new Date(season.end_date).toLocaleDateString('ru-RU')}
                </p>
              )}
            </div>
          </div>
          {season?.is_active && (
            <span className="text-xs font-semibold text-primary px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              Активный
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Лидерборд — рейтинг менеджеров по результатам продаж. Каждый сезон длится месяц. 
          Топ-3 менеджера получают бонусные XP-награды и уникальные бейджи.
        </p>
      </Card>

      {entries.length === 0 ? (
        <Card className="widget-card text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground">Пока нет участников</p>
          <p className="text-sm text-muted-foreground mt-1">Менеджеры появятся здесь после регистрации</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.user_id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`widget-card flex items-center gap-4 ${i < 3 ? `bg-gradient-to-r ${podiumColors[i]}` : ''}`}
            >
              <div className="text-2xl w-10 text-center flex-shrink-0">
                {i < 3 ? medals[i] : <span className="text-muted-foreground font-display font-bold text-lg">#{i + 1}</span>}
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {entry.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground truncate">{entry.name}</span>
                  <span className="level-badge text-[10px] !px-2 !py-0.5">Ур. {entry.level}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" />{entry.total_xp_earned.toLocaleString()} XP</span>
                  <span>{entry.paid_count} оплат</span>
                  {entry.streak_days > 0 && <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-500" />{entry.streak_days}</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-display font-bold text-foreground">{entry.revenue.toLocaleString()} ₽</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
