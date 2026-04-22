import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Coffee, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AICoachPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const morningPlan = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
      const { data: tasks } = await supabase.from('daily_tasks').select('*').eq('user_id', user.id).limit(10);
      const { data, error } = await supabase.functions.invoke('ai-tools', { body: { task: 'morning_coach', payload: { stats: { profile: p, tasks } } } });
      if (error) throw error;
      setPlan(data.plan);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  const daySummary = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: events } = await supabase.from('action_events').select('*').eq('user_id', user.id).order('timestamp', { ascending: false }).limit(20);
      const { data, error } = await supabase.functions.invoke('ai-tools', { body: { task: 'day_summary', payload: { events } } });
      if (error) throw error;
      setSummary(data.summary);
      const today = new Date().toISOString().slice(0, 10);
      await supabase.from('day_summaries').upsert({ user_id: user.id, summary_date: today, summary: data.summary }, { onConflict: 'user_id,summary_date' });
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Sparkles className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">AI-Коуч</h1><p className="page-subtitle">План на день и сводка вечером</p></div>
      </div>

      <Card className="p-5 glass">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2"><Coffee className="w-5 h-5" />Утренний план</h2>
          <Button onClick={morningPlan} disabled={loading}><Sparkles className="w-4 h-4 mr-2" />Сгенерировать</Button>
        </div>
        {plan && <div className="prose prose-sm max-w-none whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">{plan}</div>}
      </Card>

      <Card className="p-5 glass">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2"><FileText className="w-5 h-5" />Сводка дня</h2>
          <Button onClick={daySummary} disabled={loading}><Sparkles className="w-4 h-4 mr-2" />Сгенерировать</Button>
        </div>
        {summary && <div className="prose prose-sm max-w-none whitespace-pre-wrap p-3 bg-muted/30 rounded-lg">{summary}</div>}
      </Card>
    </div>
  );
}
