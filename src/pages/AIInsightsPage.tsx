import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Loader2, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import aiOrb from '@/assets/ai-orb.png';
import leaderBanner from '@/assets/leader-banner.jpg';

export default function AIInsightsPage() {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const generate = async () => {
    setLoading(true);
    setInsights('');

    const monthStart = new Date();
    monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [{ data: invoices }, { data: profiles }] = await Promise.all([
      supabase.from('invoices').select('*').gte('issued_at', monthStart.toISOString()),
      supabase.from('profiles').select('user_id, name, level, total_xp_earned, processed_clients_count'),
    ]);

    const totalRevenue = (invoices || []).filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
    const paidCount = (invoices || []).filter(i => i.status === 'paid').length;
    const issuedCount = (invoices || []).length;
    const conversion = issuedCount ? Math.round((paidCount / issuedCount) * 100) : 0;

    const summary = {
      totalRevenue, paidCount, issuedCount, conversion,
      managers: (profiles || []).map(p => ({ name: p.name, level: p.level, xp: p.total_xp_earned, clients: p.processed_clients_count })),
    };
    setStats(summary);

    const prompt = `Проанализируй данные команды продаж за этот месяц и дай 3-5 ключевых инсайтов:
Выручка: ${totalRevenue.toLocaleString('ru')} ₽
Счетов выставлено: ${issuedCount}, оплачено: ${paidCount} (конверсия ${conversion}%)
Менеджеры: ${summary.managers.map(m => `${m.name} (ур.${m.level}, ${m.xp} XP, ${m.clients} клиентов)`).join('; ')}

Выдели: кто проседает, кто лидер, рекомендации по бустам и обучению.`;

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], mode: 'analytics' }),
      });
      if (resp.status === 429) { toast.error('Лимит'); setLoading(false); return; }
      if (resp.status === 402) { toast.error('Нет AI-кредитов'); setLoading(false); return; }
      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '', acc = '', done = false;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        let idx;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const json = line.slice(6).trim();
          if (json === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(json);
            const c = parsed.choices?.[0]?.delta?.content;
            if (c) { acc += c; setInsights(acc); }
          } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch { toast.error('Ошибка AI'); }
    setLoading(false);
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden mb-6 h-32 md:h-40">
        <img src={leaderBanner} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        <div className="relative h-full flex items-center gap-4 px-6">
          <img src={aiOrb} alt="" className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_30px_hsl(var(--primary)/0.6)]" width={1024} height={1024} />
          <div>
            <h1 className="page-title">AI-аналитика команды</h1>
            <p className="page-subtitle">Автоматические инсайты на основе ваших данных</p>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: TrendingUp, label: 'Выручка', value: `${stats.totalRevenue.toLocaleString('ru')} ₽` },
            { icon: AlertTriangle, label: 'Конверсия', value: `${stats.conversion}%` },
            { icon: Lightbulb, label: 'Оплачено', value: stats.paidCount },
            { icon: Brain, label: 'Менеджеров', value: stats.managers.length },
          ].map((s, i) => (
            <Card key={i} className="glass p-4">
              <s.icon className="w-5 h-5 text-primary mb-2" />
              <div className="stat-label">{s.label}</div>
              <div className="stat-value text-xl mt-1">{s.value}</div>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Инсайты от AI</h3>
          <Button onClick={generate} disabled={loading} size="sm" variant="outline">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Обновить'}
          </Button>
        </div>
        {loading && !insights ? (
          <div className="text-center py-8"><Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" /></div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{insights || 'Нажмите «Обновить» для генерации'}</ReactMarkdown>
          </div>
        )}
      </Card>
    </div>
  );
}
