import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useMemo } from 'react';

export default function AdminAnalyticsTab() {
  const { state } = useApp();

  const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalInvoices = state.invoices.length;
  const paidInvoices = state.invoices.filter(i => i.status === 'paid').length;
  const unpaidInvoices = state.invoices.filter(i => i.status === 'issued');
  const lostRevenue = unpaidInvoices.reduce((s, i) => s + i.amount, 0);
  const conversionRate = totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  // Daily rate for forecast
  const now = new Date();
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = daysInMonth - dayOfMonth;
  const dailyRate = dayOfMonth > 0 ? totalRevenue / dayOfMonth : 0;
  const forecastRevenue = totalRevenue + dailyRate * remainingDays;
  const forecastPct = state.planSettings.target > 0 ? Math.round((forecastRevenue / state.planSettings.target) * 100) : 0;

  // Manager analytics
  const managerStats = useMemo(() => {
    return state.managers.map(m => {
      const disciplineIndex = m.disciplineIndex || Math.round(
        (m.streakDays || 0) * 3 + (m.invoicesIssued || 0) * 2 + (m.invoicesPaid || 0) * 5
      );
      const contribution = totalRevenue > 0 ? Math.round((m.revenue / totalRevenue) * 100) : 0;
      return { ...m, disciplineIndex: Math.min(100, disciplineIndex), contribution };
    }).sort((a, b) => b.disciplineIndex - a.disciplineIndex);
  }, [state.managers, totalRevenue]);

  const disciplineLabel = (idx: number) => {
    if (idx >= 80) return { text: 'Отлично', color: 'text-primary' };
    if (idx >= 60) return { text: 'Хорошо', color: 'text-info' };
    if (idx >= 30) return { text: 'Средне', color: 'text-accent' };
    return { text: 'Низкая', color: 'text-destructive' };
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div>
        <h2 className="font-display font-semibold text-lg text-foreground mb-3">📊 Ключевые метрики</h2>
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
            <div className="text-xs text-muted-foreground">Потенц. потери</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl mb-1">🔮</div>
            <div className="text-xl font-bold text-foreground">{forecastPct}%</div>
            <div className="text-xs text-muted-foreground">Прогноз плана</div>
          </Card>
        </div>
      </div>

      {/* Forecast */}
      <div className="widget-card">
        <h2 className="font-display font-semibold text-foreground mb-3">🔮 Прогноз выполнения плана</h2>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-muted-foreground">Текущий: {totalRevenue.toLocaleString()} ₽</span>
          <span className="text-muted-foreground">Прогноз: {Math.round(forecastRevenue).toLocaleString()} ₽</span>
        </div>
        <Progress value={Math.min(100, forecastPct)} className="h-3" />
        <div className="text-xs text-muted-foreground mt-1">
          План: {state.planSettings.target.toLocaleString()} ₽ | Осталось {remainingDays} дней | Темп: {Math.round(dailyRate).toLocaleString()} ₽/день
        </div>
      </div>

      {/* Lost Revenue Detector */}
      <div className="widget-card">
        <h2 className="font-display font-semibold text-foreground mb-3">📉 Lost Revenue Detector</h2>
        {unpaidInvoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">Все счета оплачены!</p>
        ) : (
          <div className="space-y-2">
            {unpaidInvoices.slice(0, 5).map(inv => {
              const days = Math.floor((Date.now() - new Date(inv.issuedAt).getTime()) / 86400000);
              return (
                <div key={inv.id} className={`flex justify-between items-center p-2 rounded-lg ${days > 7 ? 'bg-destructive/5 border border-destructive/20' : 'bg-muted/50'}`}>
                  <span className="text-sm font-medium">{inv.amount.toLocaleString()} ₽</span>
                  <span className={`text-xs ${days > 7 ? 'text-destructive' : 'text-muted-foreground'}`}>{days} дн. без оплаты</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Discipline Index */}
      {managerStats.length > 0 && (
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-3">🎯 Индекс дисциплины</h2>
          <div className="space-y-3">
            {managerStats.map(m => {
              const label = disciplineLabel(m.disciplineIndex);
              return (
                <div key={m.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{m.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${label.color}`}>{m.disciplineIndex}</span>
                      <span className={`text-xs ${label.color}`}>{label.text}</span>
                    </div>
                  </div>
                  <Progress value={m.disciplineIndex} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contribution */}
      {managerStats.length > 0 && (
        <div className="widget-card">
          <h2 className="font-display font-semibold text-foreground mb-3">📊 Вклад в продажи</h2>
          <div className="space-y-2">
            {managerStats.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-sm w-28 truncate">{m.name}</span>
                <div className="flex-1">
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${m.contribution}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold w-16 text-right">{m.contribution}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
