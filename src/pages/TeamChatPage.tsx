import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Send, Smile } from 'lucide-react';

const EMOJIS = ['👍', '🔥', '🎉', '❤️', '👏', '🚀'];

export default function TeamChatPage() {
  const { user, role } = useAuth();
  const [channels, setChannels] = useState<any[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [reactions, setReactions] = useState<any[]>([]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const loadChannels = async () => {
    let { data } = await supabase.from('chat_channels').select('*').order('created_at');
    if (!data?.length && role === 'leader' && user) {
      await supabase.from('chat_channels').insert({ name: 'Общий', is_general: true, created_by: user.id });
      const r = await supabase.from('chat_channels').select('*');
      data = r.data;
    }
    setChannels(data ?? []);
    if (data?.length) setActiveId(data[0].id);
    const { data: p } = await supabase.from('profiles').select('user_id, name, avatar_url');
    const map: Record<string, any> = {};
    (p ?? []).forEach((x: any) => { map[x.user_id] = x; });
    setProfiles(map);
  };
  useEffect(() => { loadChannels(); }, [user, role]);

  const loadMessages = async () => {
    if (!activeId) return;
    const { data } = await supabase.from('chat_messages').select('*').eq('channel_id', activeId).order('created_at').limit(100);
    setMessages(data ?? []);
    const { data: r } = await supabase.from('message_reactions').select('*').in('message_id', (data ?? []).map((m: any) => m.id));
    setReactions(r ?? []);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };
  useEffect(() => {
    if (!activeId) return;
    loadMessages();
    const ch = supabase.channel(`chat-${activeId}-${Math.random().toString(36).slice(2)}`);
    ch.on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `channel_id=eq.${activeId}` }, loadMessages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' }, loadMessages)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [activeId]);

  const send = async () => {
    if (!user || !text.trim() || !activeId) return;
    await supabase.from('chat_messages').insert({ channel_id: activeId, user_id: user.id, content: text });
    setText('');
  };

  const react = async (mid: string, emoji: string) => {
    if (!user) return;
    const exist = reactions.find(r => r.message_id === mid && r.user_id === user.id && r.emoji === emoji);
    if (exist) await supabase.from('message_reactions').delete().eq('id', exist.id);
    else await supabase.from('message_reactions').insert({ message_id: mid, user_id: user.id, emoji });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex gap-4">
      <Card className="w-56 p-3 glass overflow-auto">
        <div className="flex items-center gap-2 mb-3"><MessageSquare className="w-4 h-4" /><h2 className="font-semibold">Каналы</h2></div>
        {channels.map(c => (
          <button key={c.id} onClick={() => setActiveId(c.id)} className={`w-full text-left p-2 rounded-lg text-sm ${activeId === c.id ? 'bg-primary/20' : 'hover:bg-muted'}`}># {c.name}</button>
        ))}
      </Card>

      <Card className="flex-1 flex flex-col glass">
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map(m => {
            const p = profiles[m.user_id];
            const reacts = reactions.filter(r => r.message_id === m.id);
            const grouped = reacts.reduce((a: any, r) => { (a[r.emoji] = a[r.emoji] ?? []).push(r); return a; }, {});
            return (
              <div key={m.id} className="flex gap-2 group">
                <Avatar className="w-8 h-8"><AvatarFallback>{(p?.name ?? '?')[0]}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{p?.name ?? '—'} · {new Date(m.created_at).toLocaleTimeString()}</div>
                  <div className="text-sm">{m.content}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {Object.entries(grouped).map(([e, arr]: any) => (
                      <button key={e} onClick={() => react(m.id, e)} className="text-xs px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80">{e} {arr.length}</button>
                    ))}
                    <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
                      {EMOJIS.map(e => <button key={e} onClick={() => react(m.id, e)} className="text-xs hover:scale-125 transition">{e}</button>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3 flex gap-2">
          <Input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Написать..." />
          <Button onClick={send}><Send className="w-4 h-4" /></Button>
        </div>
      </Card>
    </div>
  );
}
