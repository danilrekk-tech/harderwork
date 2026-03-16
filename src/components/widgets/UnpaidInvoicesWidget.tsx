import { useApp } from '@/context/AppContext';
import { useMemo } from 'react';

export default function UnpaidInvoicesWidget() {
  const { state, quickPayInvoice } = useApp();

  const unpaid = useMemo(() => {
    return state.invoices
      .filter(i => i.status === 'issued')
      .map(i => {
        const days = Math.floor((Date.now() - new Date(i.issuedAt).getTime()) / 86400000);
        return { ...i, daysAgo: days };
      })
      .sort((a, b) => b.daysAgo - a.daysAgo);
  }, [state.invoices]);

  const totalUnpaid = unpaid.reduce((s, i) => s + i.amount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-semibold text-foreground">⏳ Неоплаченные счета</h3>
        <span className="text-sm font-bold text-destructive">{totalUnpaid.toLocaleString()} ₽</span>
      </div>
      {unpaid.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Все счета оплачены! 🎉</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {unpaid.map(inv => (
            <div
              key={inv.id}
              className={`flex items-center justify-between p-2 rounded-lg border ${inv.daysAgo > 7 ? 'border-destructive/30 bg-destructive/5' : 'border-border'} cursor-pointer hover:bg-muted/50`}
              onClick={() => quickPayInvoice(inv.id)}
            >
              <div>
                <span className="text-sm font-medium">{inv.amount.toLocaleString()} ₽</span>
                <span className={`text-xs ml-2 ${inv.daysAgo > 7 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {inv.daysAgo === 0 ? 'сегодня' : `${inv.daysAgo} дн. назад`}
                </span>
              </div>
              <span className="text-xs text-primary">Оплатить →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
