import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Flame } from 'lucide-react';
import { toast } from 'sonner';

const REWARDS = [50, 75, 100, 150, 200, 300, 500];

export default function DailyRewardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const today = new Date().toISOString().slice(0, 10);
  const claimedToday = history.find(h => h.claimed_date === today);
  const streak = history.length;
  const nextDay = (streak % 7) + 1;
  const nextReward = REWARDS[(nextDay - 1) % 7];

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('daily_rewards').select('*').eq('user_id', user.id).order('claimed_date', { ascending: false }).limit(30);
    setHistory(data ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const claim = async () => {
    if (!user || claimedToday) return;
    await supabase.from('daily_rewards').insert({ user_id: user.id, claimed_date: today, day_number: nextDay, xp_reward: nextReward });
    toast.success(`+${nextReward} XP! День ${nextDay}/7`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Gift className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Ежедневный бонус</h1><p className="page-subtitle">Заходи каждый день и получай XP</p></div>
      </div>

      <Card className="p-6 glass text-center">
        <div className="flex items-center justify-center gap-2 text-orange-500 mb-2"><Flame className="w-5 h-5" /><span className="font-bold text-lg">Серия: {streak} дней</span></div>
        <div className="text-6xl mb-4">🎁</div>
        <Button size="lg" disabled={!!claimedToday} onClick={claim}>
          {claimedToday ? `Уже забрано (+${claimedToday.xp_reward} XP)` : `Забрать +${nextReward} XP`}
        </Button>
      </Card>

      <div className="grid grid-cols-7 gap-2">
        {REWARDS.map((r, i) => (
          <Card key={i} className={`p-3 text-center glass ${i + 1 === nextDay ? 'ring-2 ring-primary' : ''}`}>
            <div className="text-xs text-muted-foreground">День {i + 1}</div>
            <div className="text-2xl">{i === 6 ? '💎' : '⭐'}</div>
            <div className="text-sm font-semibold">+{r}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
