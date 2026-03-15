import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';

export default function AdminStatsTab() {
  const { state } = useApp();

  const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalInvoices = state.invoices.length;
  const paidInvoices = state.invoices.filter(i => i.status === 'paid').length;
  const conversionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;
  const totalClients = state.clients.length;
  const activeManagers = state.managers.filter(m => !m.isBlocked).length;
  const blockedManagers = state.managers.filter(m => m.isBlocked).length;
  const activeContests = state.contests.filter(c => c.isActive).length;
  const activeActivities = state.bonusActivities.filter(a => a.isActive).length;

  const stats = [
    { label: 'Общая выручка', value: `${totalRevenue.toLocaleString('ru-RU')} ₽`, icon: '💰' },
    { label: 'Всего счетов', value: totalInvoices, icon: '📄' },
    { label: 'Оплаченных', value: paidInvoices, icon: '✅' },
    { label: 'Конверсия', value: `${conversionRate}%`, icon: '📊' },
    { label: 'Клиентов', value: totalClients, icon: '👥' },
    { label: 'Менеджеров', value: `${activeManagers} акт. / ${blockedManagers} заблок.`, icon: '👤' },
    { label: 'Активных конкурсов', value: activeContests, icon: '🏆' },
    { label: 'Активных активностей', value: activeActivities, icon: '🎯' },
    { label: 'Достижений', value: state.achievements.length + state.customAchievements.length, icon: '⭐' },
    { label: 'Разблокировано ачивок', value: state.unlockedAchievements.length, icon: '🔓' },
    { label: 'Уровень менеджера', value: state.profile.level, icon: '🎮' },
    { label: 'Всего XP', value: state.profile.totalXpEarned.toLocaleString('ru-RU'), icon: '✨' },
  ];

  return (
    <div>
      <h2 className="font-display font-semibold text-lg text-foreground mb-4">Статистика системы</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-bold text-foreground">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
