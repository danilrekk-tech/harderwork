import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyAnalyticsPage() {
  const { state } = useApp();
  const { user } = useAuth();
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [invoicesByStatus, setInvoicesByStatus] = useState({ issued: 0, paid: 0 });
  const [weeklyClients, setWeeklyClients] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadAnalytics();
  }, [user]);

  async function loadAnalytics() {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: invoices } = await supabase.from('invoices').select('*').eq('user_id', user!.id);
    const allInv = invoices || [];
    
    const paid = allInv.filter(i => i.status === 'paid');
    setInvoicesByStatus({ issued: allInv.filter(i => i.status === 'issued').length, paid: paid.length });
    setMonthlyRevenue(paid.filter(i => i.paid_at && i.paid_at >= monthStart).reduce((s, i) => s + Number(i.amount), 0));
    setWeeklyRevenue(paid.filter(i => i.paid_at && i.paid_at >= weekAgo).reduce((s, i) => s + Number(i.amount), 0));

    const { count } = await supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user!.id).gte('created_at', weekAgo);
    setWeeklyClients(count || 0);
  }

  const stats = [
    { icon: '💰', label: 'Выручка за месяц', value: `${monthlyRevenue.toLocaleString()} ₽` },
    { icon: '📈', label: 'Выручка за неделю', value: `${weeklyRevenue.toLocaleString()} ₽` },
    { icon: '📄', label: 'Счетов выставлено', value: invoicesByStatus.issued + invoicesByStatus.paid },
    { icon: '✅', label: 'Оплачено', value: invoicesByStatus.paid },
    { icon: '👥', label: 'Клиентов за неделю', value: weeklyClients },
    { icon: '⭐', label: 'Всего XP', value: state.profile.totalXpEarned },
    { icon: '🔥', label: 'Серия дней', value: `${state.profile.streakDays} дн.` },
    { icon: '🎯', label: 'Уровень', value: state.profile.level },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📊 Моя аналитика</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center widget-card">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
