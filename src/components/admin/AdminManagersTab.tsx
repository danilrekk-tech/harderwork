import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface ManagerRow {
  user_id: string;
  name: string;
  level: number;
  xp: number;
  total_xp_earned: number;
  streak_days: number;
  processed_clients_count: number;
  last_active_date: string;
}

export default function AdminManagersTab() {
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, { invoices: number; paid: number; revenue: number; clients: number }>>({});

  useEffect(() => {
    loadManagers();
  }, []);

  async function loadManagers() {
    setLoading(true);
    // Get all users with manager role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'manager' as any);

    if (!roles?.length) {
      setManagers([]);
      setLoading(false);
      return;
    }

    const managerIds = roles.map(r => r.user_id);

    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('user_id', managerIds);

    if (profiles) {
      setManagers(profiles as unknown as ManagerRow[]);
    }

    // Get invoice stats per manager
    const { data: invoices } = await supabase
      .from('invoices')
      .select('user_id, amount, status')
      .in('user_id', managerIds);

    // Get client counts per manager
    const { data: clients } = await supabase
      .from('clients')
      .select('user_id')
      .in('user_id', managerIds);

    const statsMap: Record<string, { invoices: number; paid: number; revenue: number; clients: number }> = {};
    managerIds.forEach(id => {
      statsMap[id] = { invoices: 0, paid: 0, revenue: 0, clients: 0 };
    });

    invoices?.forEach(inv => {
      if (!statsMap[inv.user_id]) statsMap[inv.user_id] = { invoices: 0, paid: 0, revenue: 0, clients: 0 };
      statsMap[inv.user_id].invoices++;
      if (inv.status === 'paid') {
        statsMap[inv.user_id].paid++;
        statsMap[inv.user_id].revenue += Number(inv.amount);
      }
    });

    clients?.forEach(c => {
      if (statsMap[c.user_id]) statsMap[c.user_id].clients++;
    });

    setStats(statsMap);
    setLoading(false);
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка менеджеров...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-lg text-foreground">Менеджеры ({managers.length})</h2>
      </div>

      {managers.length === 0 ? (
        <Card className="text-center py-8 text-muted-foreground p-6">
          <p className="text-lg mb-2">Нет зарегистрированных менеджеров</p>
          <p className="text-sm">Создайте инвайт-ссылку в Настройках и отправьте менеджеру для регистрации.</p>
        </Card>
      ) : (
        <div className="widget-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Уровень</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Клиенты</TableHead>
                <TableHead>Счета</TableHead>
                <TableHead>Выручка</TableHead>
                <TableHead>Серия</TableHead>
                <TableHead>Активность</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map(m => {
                const s = stats[m.user_id] || { invoices: 0, paid: 0, revenue: 0, clients: 0 };
                return (
                  <TableRow key={m.user_id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="secondary">Ур. {m.level}</Badge></TableCell>
                    <TableCell className="text-accent font-medium">{m.total_xp_earned}</TableCell>
                    <TableCell>{s.clients}</TableCell>
                    <TableCell>{s.invoices} ({s.paid} оплач.)</TableCell>
                    <TableCell className="font-medium">{s.revenue.toLocaleString('ru-RU')} ₽</TableCell>
                    <TableCell>🔥 {m.streak_days} дн.</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.last_active_date || '—'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
