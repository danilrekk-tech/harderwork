import { useApp } from '@/context/AppContext';

export default function PersonalRecordsWidget() {
  const { state } = useApp();
  const r = state.personalRecords;

  const records = [
    { label: 'Счетов за день', value: r.maxInvoicesPerDay.value, date: r.maxInvoicesPerDay.date, icon: '📄' },
    { label: 'Оплат за день', value: r.maxPaymentsPerDay.value, date: r.maxPaymentsPerDay.date, icon: '💰' },
    { label: 'Клиентов за день', value: r.maxClientsPerDay.value, date: r.maxClientsPerDay.date, icon: '👥' },
    { label: 'Выручка за день', value: r.maxRevenuePerDay.value, date: r.maxRevenuePerDay.date, icon: '💎', isMoney: true },
  ];

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">🏅 Личные рекорды</h3>
      <div className="grid grid-cols-2 gap-3">
        {records.map(rec => (
          <div key={rec.label} className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-xl mb-1">{rec.icon}</div>
            <div className="font-display font-bold text-lg text-foreground">
              {rec.isMoney ? `${rec.value.toLocaleString()} ₽` : rec.value}
            </div>
            <div className="text-xs text-muted-foreground">{rec.label}</div>
            {rec.date && <div className="text-xs text-muted-foreground mt-0.5">{rec.date}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
