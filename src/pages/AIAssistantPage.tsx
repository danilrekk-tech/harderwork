import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

type Msg = { role: 'user' | 'assistant'; content: string };

const STARTERS = [
  '💬 Скрипт холодного звонка для IT-компании',
  '🛡️ Как обработать возражение «дорого»?',
  '📧 Шаблон письма для повторного контакта',
  '🎯 Тактика дожима зависшей сделки',
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let acc = '';
    const upsert = (chunk: string) => {
      acc += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: acc } : m);
        }
        return [...prev, { role: 'assistant', content: acc }];
      });
    };

    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;
      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg], mode: 'sales' }),
      });
      if (resp.status === 429) { toast.error('Превышен лимит запросов'); setLoading(false); return; }
      if (resp.status === 402) { toast.error('Закончились AI-кредиты'); setLoading(false); return; }
      if (!resp.ok || !resp.body) throw new Error('AI error');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;
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
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsert(content);
          } catch { buffer = line + '\n' + buffer; break; }
        }
      }
    } catch (e) {
      toast.error('Ошибка AI');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center premium-glow">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="page-title">AI-ассистент продаж</h1>
          <p className="page-subtitle">Скрипты, возражения, шаблоны писем — мгновенно</p>
        </div>
      </div>

      <Card className="glass flex-1 flex flex-col overflow-hidden rounded-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Bot className="w-16 h-16 mx-auto mb-4 text-primary/40" />
              <p className="text-muted-foreground mb-4">Начните диалог или выберите подсказку:</p>
              <div className="grid gap-2 max-w-md mx-auto">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)} className="px-4 py-3 rounded-xl glass-shine text-sm text-left hover:border-primary/40 transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass'}`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>
              <div className={`rounded-2xl px-4 py-3 max-w-[80%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass'}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*]:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full glass flex items-center justify-center"><Loader2 className="w-4 h-4 animate-spin text-primary" /></div>
              <div className="glass rounded-2xl px-4 py-3 text-sm text-muted-foreground">Думаю...</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={e => { e.preventDefault(); send(input); }} className="p-4 border-t border-border flex gap-2">
          <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Спросите AI о продажах..." disabled={loading} className="flex-1" />
          <Button type="submit" disabled={loading || !input.trim()} className="quick-action-btn">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </form>
      </Card>
    </div>
  );
}
