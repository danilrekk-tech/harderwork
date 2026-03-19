import { useApp } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function PlanProgressWidget() {
  const { state } = useApp();
  const [teamPlan, setTeamPlan] = useState<{ plan_type: string; plan_target: number } | null>(null);

  useEffect(() => {
    const month = new Date().toISOString().slice(0, 7);
    supabase.from('team_plan').select('*').eq('month', month).maybeSingle()
      .then(({ data }) => {
        if (data) setTeamPlan({ plan_type: (data as any).plan_type, plan_target: Number((data as any).plan_target) });
      });
  }, []);

  const plan = teamPlan || { plan_type: state.planSettings.type, plan_target: state.planSettings.target };

  const issuedCount = state.invoices.length;
  const paidCount = state.invoices.filter(i => i.status === 'paid').length;
  const totalIssued = state.invoices.reduce((s, i) => s + i.amount, 0);
  const totalPaid = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const progressIssued = plan.plan_type === 'amount'
    ? Math.min(100, (totalIssued / plan.plan_target) * 100)
    : Math.min(100, (issuedCount / plan.plan_target) * 100);

  const progressPaid = plan.plan_type === 'amount'
    ? Math.min(100, (totalPaid / plan.plan_target) * 100)
    : Math.min(100, (paidCount / plan.plan_target) * 100);

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-4">📊 Прогресс плана</h3>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Выставлено</span>
            <span className="font-semibold text-foreground">
              {plan.plan_type === 'amount' ? `${totalIssued.toLocaleString()} ₽` : issuedCount} / {plan.plan_type === 'amount' ? `${plan.plan_target.toLocaleString()} ₽` : plan.plan_target}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressIssued}%`, background: 'hsl(var(--info))' }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{progressIssued.toFixed(1)}%</div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Оплачено</span>
            <span className="font-semibold text-foreground">
              {plan.plan_type === 'amount' ? `${totalPaid.toLocaleString()} ₽` : paidCount} / {plan.plan_type === 'amount' ? `${plan.plan_target.toLocaleString()} ₽` : plan.plan_target}
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPaid}%`, background: 'hsl(var(--success))' }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">{progressPaid.toFixed(1)}%</div>
        </div>

        {progressPaid >= 100 && (
          <div className="text-center py-2 rounded-lg text-sm font-semibold animate-pulse-glow" style={{ background: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))' }}>
            🎉 План выполнен!
          </div>
        )}
      </div>
    </div>
  );
}
