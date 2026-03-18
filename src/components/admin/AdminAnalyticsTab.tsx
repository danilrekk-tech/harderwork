import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ManagerProfile {
  user_id: string;
  name: string;
  level: number;
  total_xp_earned: number;
  streak_days: number;
}

export default function AdminAnalyticsTab() {
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [paidInvoices, setPaidInvoices] = useState(0);
  const [lostRevenue, setLostRevenue] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [managerCount, setManagerCount] = useState(0);
  const [managerStats, setManagerStats] = useState<{ name: string; revenue: number; contribution: number; discipline: number }[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);

    // Get all manager user_ids
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'manager' as any);

    const managerIds = roles?.map(r => r.user_id) || [];
    setManagerCount(managerIds.length);

    // Get all invoices
    const { data: invoices } = await supabase.from('invoices').select('*');
    const allInvoices = invoices || [];
    setTotalInvoices(allInvoices.length);

    const paid = allInvoices.filter(i => i.status === 'paid');
    const unpaid = allInvoices.filter(i => i.status === 'issued');
    setPaidInvoices(paid.length);

    const rev = paid.reduce((s, i) => s + Number(i.amount), 0);
    setTotalRevenue(rev);
    setLostRevenue(unpaid.reduce((s, i) => s + Number(i.amount), 0));

    // Get all clients count
    const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true });
    setTotalClients(count || 0);

    // Get manager profiles for per-manager breakdown
    if (managerIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', managerIds);

      const stats = (profiles || []).map(p => {
        const profile = p as unknown as ManagerProfile;
        const managerInvoices = allInvoices.filter(i => i.user_id === profile.user_id);
        const managerRevenue = managerInvoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
        const discipline = Math.min(100, profile.streak_days * 5 + managerInvoices.length * 3);
        return {
          name: profile.name,
          revenue: managerRevenue,
          contribution: rev > 0 ? Math.round((managerRevenue / rev) * 100) : 0,
          discipline,
        };
      }).sort((a, b) => b.revenue - a.revenue);

      setManagerStats(stats);
    }

    setLoading(false);
  }

  const conversionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - dayOfMonth;
  const dailyRate = dayOfMonth > 0 ? totalRevenue / dayOfMonth : 0;
  const forecastRevenue = totalRevenue + dailyRate * remainingDays;

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка аналитики...</div>;
  }

  const disciplineLabel = (idx: number) => {
    if (idx >= 80) return { text: 'Отлично', color: 'text-primary' };
    if (idx >= 60) return { text: 'Хорошо', color: 'text-blue-500' };
    if (idx >= 30) return { text: 'Средне', color: 'text-accent' };
    return { text: 'Низкая', color: 'text-destructive' };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold text-foreground">{totalRevenue.toLocaleString()} ₽</div>
          <div className="text-xs text-muted-foreground">Общая выручка</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-xl font-bold text-foreground">{conversionRate}%</div>
          <div className="text-xs text-muted-foreground">Конверсия</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">📉</div>
          <div className="text-xl font-bold text-destructive">{lostRevenue.toLocaleString()} ₽</div>
          <div className="text-xs text-muted-foreground">Неоплаченные</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-xl font-bold text-foreground">{managerCount}</div>
          <div className="text-xs text-muted-foreground">Менеджеров</div>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-foreground">{totalInvoices}</div>
          <div className="text-xs text-muted-foreground">Всего счетов</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-primary">{paidInvoices}</div>
          <div className="text-xs text-muted-foreground">Оплаченных</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-xl font-bold text-foreground">{totalClients}</div>
          <div className="text-xs text-muted-foreground">Клиентов всего</div>
        </Card>
      </div>

      <div className="widget-card">
        <h2 className="font-display font-semibold text-foreground mb-3">🔮 Прогноз на месяц</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Текущая: {totalRevenue.toLocaleString()} ₽</span>
          <span className="text-muted-foreground">Прогноз: {Math.round(forecastRevenue).toLocaleString()} ₽</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Осталось {remainingDays} дней | Темп: {Math.round(dailyRate).toLocaleString()} ₽/день
        </div>
      </div>

      {managerStats.length > 0 && (
        <>
          <div className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-3">🎯 Индекс дисциплины</h2>
            <div className="space-y-3">
              {managerStats.map(m => {
                const label = disciplineLabel(m.discipline);
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{m.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${label.color}`}>{m.discipline}</span>
                        <span className={`text-xs ${label.color}`}>{label.text}</span>
                      </div>
                    </div>
                    <Progress value={m.discipline} className="h-2" />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="widget-card">
            <h2 className="font-display font-semibold text-foreground mb-3">📊 Вклад в продажи</h2>
            <div className="space-y-2">
              {managerStats.map(m => (
                <div key={m.name} className="flex items-center gap-3">
                  <span className="text-sm w-28 truncate">{m.name}</span>
                  <div className="flex-1">
                    <div className="h-4 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${m.contribution}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-semibold w-20 text-right">{m.revenue.toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
