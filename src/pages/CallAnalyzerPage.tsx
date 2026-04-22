import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PhoneCall, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CallAnalyzerPage() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-tools', { body: { task: 'call_analyze', payload: { transcript } } });
      if (error) throw error;
      setAnalysis(data.analysis);
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><PhoneCall className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">AI-разбор звонков</h1><p className="page-subtitle">Вставь расшифровку — получи разбор</p></div>
      </div>

      <Card className="p-5 glass space-y-3">
        <Textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Вставь текст разговора..." rows={10} />
        <Button onClick={analyze} disabled={loading || !transcript.trim()}><Sparkles className="w-4 h-4 mr-2" />{loading ? 'Анализирую...' : 'Разобрать'}</Button>
      </Card>

      {analysis && <Card className="p-5 glass"><div className="prose prose-sm max-w-none whitespace-pre-wrap">{analysis}</div></Card>}
    </div>
  );
}
