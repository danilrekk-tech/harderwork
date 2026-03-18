import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface ManagerSummary {
  name: string;
  level: number;
  total_xp_earned: number;
  streak_days: number;
  revenue: number;
  invoices_count: number;
  clients_count: number;
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

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'manager' as any);

    const managerIds = roles?.map(r => r.user_id) || [];

    // Invoices
    const { data: invoices } = await supabase.from('invoices').select('*');
    const allInvoices = invoices || [];
    setTotalInvoices(allInvoices.length);
    const paid = allInvoices.filter(i => i.status === 'paid');
    setPaidInvoices(paid.length);
    const rev = paid.reduce((s, i) => s + Number(i.amount), 0);
    setTotalRevenue(rev);

    // Clients
    const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    setTotalClients(count || 0);

    // Contests
    const { data: contests } = await supabase.from('contests').select('id').eq('is_active', true);
    setActiveContests(contests?.length || 0);

    // Manager profiles
    if (managerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', managerIds);

      const mgrs: ManagerSummary[] = (profiles || []).map(p => {
        const profile = p as any;
        const mInvoices = allInvoices.filter(i => i.user_id === profile.user_id);
        const mRevenue = mInvoices.filter(i => i.status === 'paid').reduce((s: number, i: any) => s + Number(i.amount), 0);
        return {
          name: profile.name,
          level: profile.level,
          total_xp_earned: profile.total_xp_earned,
          streak_days: profile.streak_days,
          revenue: mRevenue,
          invoices_count: mInvoices.length,
          clients_count: 0,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setManagers(mgrs);
    }

    setLoading(false);
  }

  const conversionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - dayOfMonth;
  const dailyRate = dayOfMonth > 0 ? totalRevenue / dayOfMonth : 0;
  const forecastRevenue = Math.round(totalRevenue + dailyRate * remainingDays);

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
        <p className="text-sm text-muted-foreground mt-1">{profileName || 'Руководитель'}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">💰</div>
            <div className="text-xl font-bold text-foreground">{totalRevenue.toLocaleString()} ₽</div>
            <div className="text-xs text-muted-foreground">Общая выручка</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">📊</div>
            <div className="text-xl font-bold text-foreground">{conversionRate}%</div>
            <div className="text-xs text-muted-foreground">Конверсия</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">👥</div>
            <div className="text-xl font-bold text-foreground">{managers.length}</div>
            <div className="text-xs text-muted-foreground">Менеджеров</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl font-bold text-foreground">{activeContests}</div>
            <div className="text-xs text-muted-foreground">Акт. конкурсов</div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Forecast */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">🔮 Прогноз на месяц</h3>
            <div className="text-2xl font-bold text-foreground mb-1">{forecastRevenue.toLocaleString()} ₽</div>
            <div className="text-sm text-muted-foreground">
              Темп: {Math.round(dailyRate).toLocaleString()} ₽/день • Осталось {remainingDays} дней
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="p-5">
            <h3 className="font-display font-semibold text-foreground mb-3">📋 Сводка</h3>
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
        <Card className="p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">🏅 Рейтинг менеджеров</h3>
          {managers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Пока нет зарегистрированных менеджеров. Создайте инвайт-ссылку в Настройках.
            </p>
          ) : (
            <div className="space-y-3">
              {managers.map((m, i) => (
                <div key={m.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-muted-foreground w-6 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground truncate">{m.name}</span>
                      <span className="text-xs text-muted-foreground">Ур. {m.level}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.invoices_count} счетов • 🔥 {m.streak_days} дн.
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
