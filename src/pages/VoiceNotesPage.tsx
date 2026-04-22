import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, MicOff, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const recRef = useRef<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('voice_notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setNotes(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const start = () => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { toast.error('Браузер не поддерживает распознавание речи'); return; }
    const rec = new SR();
    rec.lang = 'ru-RU';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e: any) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
      setTranscript(text);
    };
    rec.onend = () => setRecording(false);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };
  const stop = () => { recRef.current?.stop(); setRecording(false); };

  const save = async () => {
    if (!user || !transcript.trim()) return;
    await supabase.from('voice_notes').insert({ user_id: user.id, transcript });
    setTranscript('');
    toast.success('Заметка сохранена');
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Mic className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Голосовые заметки</h1><p className="page-subtitle">Диктуй — мы расшифруем</p></div>
      </div>

      <Card className="p-5 glass">
        <div className="flex gap-2 mb-3">
          {!recording ? <Button onClick={start}><Mic className="w-4 h-4 mr-2" />Начать запись</Button> : <Button variant="destructive" onClick={stop}><MicOff className="w-4 h-4 mr-2" />Остановить</Button>}
          <Button onClick={save} disabled={!transcript.trim()}><Save className="w-4 h-4 mr-2" />Сохранить</Button>
        </div>
        <Textarea value={transcript} onChange={e => setTranscript(e.target.value)} placeholder="Текст появится здесь..." rows={6} />
      </Card>

      <div className="space-y-2">
        {notes.map(n => (
          <Card key={n.id} className="p-3 glass">
            <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
            <p className="text-sm mt-1">{n.transcript}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
