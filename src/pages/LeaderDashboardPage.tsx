import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

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
      .from('user_roles')
      .select('user_id')
      .eq('role', 'manager' as any);

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
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', managerIds);

      const mgrs: ManagerSummary[] = (profiles || []).map((p: any) => {
        const mInvoices = allInvoices.filter(i => i.user_id === p.user_id);
        const mPaid = mInvoices.filter(i => i.status === 'paid');
        const mClients = (clientsData || []).filter((c: any) => c.user_id === p.user_id).length;
        const mPenalties = (penalties || []).filter((pen: any) => pen.user_id === p.user_id).reduce((s: number, pen: any) => s + Number(pen.xp_amount), 0);
        return {
          user_id: p.user_id,
          name: p.name,
          level: p.level,
          total_xp_earned: p.total_xp_earned,
          streak_days: p.streak_days,
          revenue: mPaid.reduce((s: number, i: any) => s + Number(i.amount), 0),
          invoices_count: mInvoices.length,
          paid_count: mPaid.length,
          clients_count: mClients,
          penalties_xp: mPenalties,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setManagers(mgrs);
    }

    setLoading(false);
  }, [currentMonth]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('leader-dashboard')
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
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
          🛡️ Панель руководителя
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{profileName || 'Руководитель'} • Данные обновляются в реальном времени</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '💰', value: `${totalRevenue.toLocaleString()} ₽`, label: 'Выручка' },
          { icon: '📊', value: `${conversionRate}%`, label: 'Конверсия' },
          { icon: '👥', value: managers.length, label: 'Менеджеров' },
          { icon: '🏆', value: activeContests, label: 'Конкурсов' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center widget-card">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-lg font-bold text-foreground">{m.value}</div>
              <div className="text-xs text-muted-foreground">{m.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Plan Progress */}
        {planTarget > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-5 widget-card">
              <h3 className="font-display font-semibold text-foreground mb-3">📋 План на {new Date().toLocaleDateString('ru-RU', { month: 'long' })}</h3>
              <div className="text-2xl font-bold text-foreground mb-1">{totalRevenue.toLocaleString()} / {planTarget.toLocaleString()} ₽</div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Прогресс</span>
                <span className="font-semibold">{planProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${planProgress}%` }} />
              </div>
            </Card>
          </motion.div>
        )}

        {/* Forecast */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5 widget-card">
            <h3 className="font-display font-semibold text-foreground mb-3">🔮 Прогноз</h3>
            <div className="text-2xl font-bold text-foreground mb-1">{forecastRevenue.toLocaleString()} ₽</div>
            <div className="text-sm text-muted-foreground mb-3">
              Темп: {Math.round(dailyRate).toLocaleString()} ₽/день • {remainingDays} дн. осталось
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Счетов:</span> <span className="font-medium">{totalInvoices}</span></div>
              <div><span className="text-muted-foreground">Оплачено:</span> <span className="font-medium text-primary">{paidInvoices}</span></div>
              <div><span className="text-muted-foreground">Клиентов:</span> <span className="font-medium">{totalClients}</span></div>
              <div><span className="text-muted-foreground">Неоплач.:</span> <span className="font-medium text-destructive">{totalInvoices - paidInvoices}</span></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Manager Leaderboard */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-5 widget-card">
          <h3 className="font-display font-semibold text-foreground mb-4">🏅 Рейтинг менеджеров</h3>
          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Нет менеджеров. Создайте инвайт-ссылку в Настройках.
            </p>
          ) : (
            <div className="space-y-2">
              {managers.map((m, i) => (
                <div key={m.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-muted-foreground w-6 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground">Ур. {m.level}</span>
                      {m.penalties_xp > 0 && <span className="penalty-badge">-{m.penalties_xp} XP</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.clients_count} клиентов • {m.invoices_count} счетов ({m.paid_count} оплач.) • 🔥 {m.streak_days} дн.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{m.revenue.toLocaleString()} ₽</div>
                    <div className="text-xs text-accent">{m.total_xp_earned} XP</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
