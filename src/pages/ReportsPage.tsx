import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalManagers: 0, totalRevenue: 0, totalInvoices: 0, paidInvoices: 0,
    totalClients: 0, totalPenalties: 0, avgRevenue: 0, topManager: '',
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: roles }, { data: invoices }, { count: clientCount }, { data: penalties }, { data: profiles }] = await Promise.all([
      supabase.from('user_roles').select('user_id').eq('role', 'manager' as any),
      supabase.from('invoices').select('*'),
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('penalties').select('xp_amount'),
      supabase.from('profiles').select('user_id, name'),
    ]);

    const ids = roles?.map(r => r.user_id) || [];
    const allInv = invoices || [];
    const paid = allInv.filter(i => i.status === 'paid');
    const totalRev = paid.reduce((s, i) => s + Number(i.amount), 0);

    // Find top manager by revenue
    const revByManager: Record<string, number> = {};
    paid.forEach(i => { revByManager[i.user_id] = (revByManager[i.user_id] || 0) + Number(i.amount); });
    const topId = Object.entries(revByManager).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topName = (profiles || []).find((p: any) => p.user_id === topId)?.name || '—';

    setStats({
      totalManagers: ids.length,
      totalRevenue: totalRev,
      totalInvoices: allInv.length,
      paidInvoices: paid.length,
      totalClients: clientCount || 0,
      totalPenalties: (penalties || []).reduce((s: number, p: any) => s + Number(p.xp_amount), 0),
      avgRevenue: ids.length > 0 ? Math.round(totalRev / ids.length) : 0,
      topManager: topName,
    });
  }

  const items = [
    { icon: '👥', label: 'Менеджеров', value: stats.totalManagers },
    { icon: '💰', label: 'Общая выручка', value: `${stats.totalRevenue.toLocaleString()} ₽` },
    { icon: '📄', label: 'Всего счетов', value: stats.totalInvoices },
    { icon: '✅', label: 'Оплачено', value: stats.paidInvoices },
    { icon: '👤', label: 'Всего клиентов', value: stats.totalClients },
    { icon: '📊', label: 'Средняя выручка/менеджер', value: `${stats.avgRevenue.toLocaleString()} ₽` },
    { icon: '⚠️', label: 'Штрафов (XP)', value: stats.totalPenalties },
    { icon: '🏆', label: 'Лучший менеджер', value: stats.topManager },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">📈 Отчёты</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4 text-center widget-card">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-lg font-bold text-foreground">{item.value}</div>
              <div className="text-xs text-muted-foreground">{item.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
