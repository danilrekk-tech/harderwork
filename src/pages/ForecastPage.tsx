import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ForecastPage() {
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('revenue_forecasts').select('*').order('created_at', { ascending: false }).limit(10);
    setForecasts(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const { data: invoices } = await supabase.from('invoices').select('amount, status, issued_at, paid_at').limit(500);
      const { data, error } = await supabase.functions.invoke('ai-tools', { body: { task: 'forecast', payload: { history: invoices } } });
      if (error) throw error;
      const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
      await supabase.from('revenue_forecasts').insert({ scope: 'team', forecast_month: nextMonth.toISOString().slice(0, 7), ...data });
      toast.success(`Прогноз: ${data.predicted_amount.toLocaleString()} ₽`);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><TrendingUp className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Прогноз выручки</h1><p className="page-subtitle">AI-прогноз на следующий месяц</p></div>
        </div>
        <Button onClick={generate} disabled={loading}><Sparkles className="w-4 h-4 mr-2" />{loading ? 'Считаю...' : 'Новый прогноз'}</Button>
      </div>

      <div className="space-y-3">
        {forecasts.map(f => (
          <Card key={f.id} className="p-5 glass">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{f.forecast_month}</h3>
              <span className="text-2xl font-bold text-primary">{Number(f.predicted_amount).toLocaleString()} ₽</span>
            </div>
            <div className="text-sm text-muted-foreground">Уверенность: {f.confidence}%</div>
            <Progress value={f.confidence} className="mt-1" />
            {f.factors?.length > 0 && (
              <ul className="text-xs mt-3 space-y-1">{f.factors.map((x: string, i: number) => <li key={i}>• {x}</li>)}</ul>
            )}
          </Card>
        ))}
        {forecasts.length === 0 && <Card className="p-8 text-center text-muted-foreground glass">Прогнозов ещё нет</Card>}
      </div>
    </div>
  );
}
