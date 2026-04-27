import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, Users, FileText, Trophy, BarChart3, Target, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import leaderBanner from '@/assets/leader-banner.jpg';
import trophy from '@/assets/trophy.png';

interface ManagerSummary {
  user_id: string;
  name: string;
  level: number;
  total_xp_earned: number;
  streak_days: number;
  revenue: number;
  invoices_count: number;
  paid_count: number;
  clients_count: number;
  penalties_xp: number;
}

export default function LeaderDashboardPage() {
  const { profileName } = useAuth();
  const [loading, setLoading] = useState(true);
  const [managers, setManagers] = useState<ManagerSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [activeContests, setActiveContests] = useState(0);
  const [planTarget, setPlanTarget] = useState(0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const loadDashboard = useCallback(async () => {
    const { data: roles } = await supabase
      .from('user_roles').select('user_id').eq('role', 'manager' as any);
    const managerIds = roles?.map(r => r.user_id) || [];

    const { data: invoices } = await supabase.from('invoices').select('*');
    const allInvoices = invoices || [];
    setTotalInvoices(allInvoices.length);
    const paid = allInvoices.filter(i => i.status === 'paid');
    setPaidInvoices(paid.length);
    setTotalRevenue(paid.reduce((s, i) => s + Number(i.amount), 0));

    const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    setTotalClients(count || 0);

    const { data: contests } = await supabase.from('contests').select('id').eq('is_active', true);
    setActiveContests(contests?.length || 0);

    const { data: plan } = await supabase.from('team_plan').select('plan_target').eq('month', currentMonth).maybeSingle();
    if (plan) setPlanTarget(Number((plan as any).plan_target));

    const { data: penalties } = await supabase.from('penalties').select('user_id, xp_amount');
    const { data: clientsData } = await supabase.from('clients').select('user_id');

    if (managerIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('*').in('user_id', managerIds);
      const mgrs: ManagerSummary[] = (profiles || []).map((p: any) => {
        const mInvoices = allInvoices.filter(i => i.user_id === p.user_id);
        const mPaid = mInvoices.filter(i => i.status === 'paid');
        const mClients = (clientsData || []).filter((c: any) => c.user_id === p.user_id).length;
        const mPenalties = (penalties || []).filter((pen: any) => pen.user_id === p.user_id).reduce((s: number, pen: any) => s + Number(pen.xp_amount), 0);
        return {
          user_id: p.user_id, name: p.name, level: p.level,
          total_xp_earned: p.total_xp_earned, streak_days: p.streak_days,
          revenue: mPaid.reduce((s: number, i: any) => s + Number(i.amount), 0),
          invoices_count: mInvoices.length, paid_count: mPaid.length,
          clients_count: mClients, penalties_xp: mPenalties,
        };
      }).sort((a, b) => b.revenue - a.revenue);
      setManagers(mgrs);
    }
    setLoading(false);
  }, [currentMonth]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    const channel = supabase
      .channel(`leader-dashboard-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, () => loadDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => loadDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadDashboard())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penalties' }, () => loadDashboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadDashboard]);

  const conversionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - dayOfMonth;
  const dailyRate = dayOfMonth > 0 ? totalRevenue / dayOfMonth : 0;
  const forecastRevenue = Math.round(totalRevenue + dailyRate * remainingDays);
  const planProgress = planTarget > 0 ? Math.min(100, (totalRevenue / planTarget) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-64 bg-muted rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-28 bg-muted rounded-xl" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = [
    { icon: TrendingUp, value: `${totalRevenue.toLocaleString()} ₽`, label: 'Выручка', color: 'text-primary', bg: 'bg-primary/8' },
    { icon: BarChart3, value: `${conversionRate}%`, label: 'Конверсия', color: 'text-info', bg: 'bg-info/8' },
    { icon: Users, value: managers.length, label: 'Менеджеров', color: 'text-accent', bg: 'bg-accent/8' },
    { icon: Trophy, value: activeContests, label: 'Конкурсов', color: 'text-primary', bg: 'bg-primary/8' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden mb-6 h-36 md:h-44">
        <img src={leaderBanner} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/40 dark:from-background/95 dark:via-background/85 dark:to-transparent" />
        <img src={trophy} alt="" aria-hidden="true" className="absolute right-4 -bottom-2 w-32 h-32 md:w-40 md:h-40 hidden sm:block drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]" width={768} height={768} loading="lazy" />
        <div className="relative h-full flex flex-col justify-center px-5 md:px-7">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">🛡️ Панель руководителя</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-sm text-muted-foreground">{profileName || 'Руководитель'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Онлайн</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {metrics.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 widget-card group hover:scale-[1.02] transition-transform duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <m.icon className={`w-4.5 h-4.5 ${m.color}`} />
                </div>
              </div>
              <div className="text-lg md:text-xl font-bold font-display text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Plan Progress */}
        {planTarget > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 widget-card h-full">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">План на {new Date().toLocaleDateString('ru-RU', { month: 'long' })}</h3>
              </div>
              <div className="text-2xl font-bold font-display text-foreground mb-1">
                {totalRevenue.toLocaleString()} / {planTarget.toLocaleString()} ₽
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-semibold text-primary">{planProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${planProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                />
              </div>
              {planProgress >= 100 && (
                <div className="mt-3 text-center py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
                  🎉 План выполнен!
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Forecast */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 widget-card h-full">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
                <Activity className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-display font-semibold text-foreground">Прогноз</h3>
            </div>
            <div className="text-2xl font-bold font-display text-foreground mb-1">{forecastRevenue.toLocaleString()} ₽</div>
            <div className="text-sm text-muted-foreground mb-4">
              Темп: {Math.round(dailyRate).toLocaleString()} ₽/день • {remainingDays} дн. осталось
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Счетов', value: totalInvoices, icon: FileText },
                { label: 'Оплачено', value: paidInvoices, icon: ArrowUpRight, color: 'text-primary' },
                { label: 'Клиентов', value: totalClients, icon: Users },
                { label: 'Неоплач.', value: totalInvoices - paidInvoices, icon: ArrowDownRight, color: 'text-destructive' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <item.icon className={`w-3.5 h-3.5 ${item.color || 'text-muted-foreground'}`} />
                  <span className="text-xs text-muted-foreground">{item.label}:</span>
                  <span className={`text-sm font-semibold ${item.color || 'text-foreground'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Manager Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 widget-card">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-accent/8 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-display font-semibold text-foreground">Рейтинг менеджеров</h3>
            <span className="text-xs text-muted-foreground ml-auto">{managers.length} участн.</span>
          </div>
          {managers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Нет менеджеров</p>
              <p className="text-xs text-muted-foreground mt-1">Создайте инвайт-ссылку в Настройках</p>
            </div>
          ) : (
            <div className="space-y-2">
              {managers.map((m, i) => (
                <motion.div
                  key={m.user_id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${i < 3 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30 hover:bg-muted/50'}`}
                >
                  <div className="text-lg font-bold w-7 text-center flex-shrink-0">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-muted-foreground text-sm">#{i + 1}</span>}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate text-sm">{m.name}</span>
                      <span className="level-badge text-[10px] !px-2 !py-0.5">Ур. {m.level}</span>
                      {m.penalties_xp > 0 && <span className="penalty-badge text-[10px]">-{m.penalties_xp}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {m.clients_count} клиентов • {m.paid_count} оплат • 🔥 {m.streak_days} дн.
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold font-display text-foreground text-sm">{m.revenue.toLocaleString()} ₽</div>
                    <div className="text-[11px] text-accent font-medium">{m.total_xp_earned} XP</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
