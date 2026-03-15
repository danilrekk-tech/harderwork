import { useApp } from '@/context/AppContext';

export default function InvoicesWidget() {
  const { state } = useApp();
  const issued = state.invoices.length;
  const paid = state.invoices.filter(i => i.status === 'paid').length;
  const conversion = issued > 0 ? ((paid / issued) * 100).toFixed(1) : '0';

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-4">📄 Счета</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="stat-value text-info">{issued}</div>
          <div className="stat-label">Выставлено</div>
        </div>
        <div className="text-center">
          <div className="stat-value text-success">{paid}</div>
          <div className="stat-label">Оплачено</div>
        </div>
        <div className="text-center">
          <div className="stat-value text-accent">{conversion}%</div>
          <div className="stat-label">Конверсия</div>
        </div>
      </div>
    </div>
  );
}
