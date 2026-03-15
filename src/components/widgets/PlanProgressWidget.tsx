import { useApp } from '@/context/AppContext';

export default function PlanProgressWidget() {
  const { state } = useApp();
  const { planSettings, invoices } = state;

  const issuedCount = invoices.length;
  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const totalIssued = invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const progressIssued = planSettings.type === 'amount'
    ? Math.min(100, (totalIssued / planSettings.target) * 100)
    : Math.min(100, (issuedCount / planSettings.target) * 100);

  const progressPaid = planSettings.type === 'amount'
    ? Math.min(100, (totalPaid / planSettings.target) * 100)
    : Math.min(100, (paidCount / planSettings.target) * 100);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-4">📊 Прогресс плана</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Выставлено</span>
            <span className="font-semibold text-foreground">
              {planSettings.type === 'amount' ? `${totalIssued.toLocaleString()} ₽` : issuedCount} / {planSettings.type === 'amount' ? `${planSettings.target.toLocaleString()} ₽` : planSettings.target}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-info transition-all duration-700 ease-out"
              style={{ width: `${progressIssued}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{progressIssued.toFixed(1)}%</div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Оплачено</span>
            <span className="font-semibold text-foreground">
              {planSettings.type === 'amount' ? `${totalPaid.toLocaleString()} ₽` : paidCount} / {planSettings.type === 'amount' ? `${planSettings.target.toLocaleString()} ₽` : planSettings.target}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-success transition-all duration-700 ease-out"
              style={{ width: `${progressPaid}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{progressPaid.toFixed(1)}%</div>
        </div>

        {progressPaid >= 100 && (
          <div className="text-center py-2 rounded-lg bg-success/10 text-success font-semibold text-sm animate-pulse-glow">
            🎉 План выполнен!
          </div>
        )}
      </div>
    </div>
  );
}
