import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Notification {
  id: string; type: string; title: string; body: string; link: string | null;
  read_at: string | null; created_at: string;
}

export default function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const unread = items.filter(n => !n.read_at).length;

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30);
      setItems((data as Notification[]) || []);
    };
    load();

    const channel = supabase.channel('notif-' + user.id)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => {
        const n = payload.new as Notification;
        setItems(prev => [n, ...prev]);
        toast(n.title, { description: n.body });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', user.id).is('read_at', null);
    setItems(prev => prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
  };

  const dismiss = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setItems(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-strong p-0" align="end">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <span className="font-semibold text-sm">Уведомления</span>
          {unread > 0 && <Button size="sm" variant="ghost" onClick={markAllRead} className="text-xs h-7"><Check className="w-3 h-3 mr-1" />Прочитать все</Button>}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {items.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Нет уведомлений</div>
          ) : items.map(n => (
            <div key={n.id} className={`p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${!n.read_at ? 'bg-primary/5' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{n.title}</div>
                  {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ru })}</div>
                </div>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => dismiss(n.id)}><X className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
