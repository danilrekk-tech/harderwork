import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

const REWARDS = [
  { type: 'xp', label: '+50 XP', value: 50, weight: 30 },
  { type: 'xp', label: '+100 XP', value: 100, weight: 20 },
  { type: 'xp', label: '+250 XP', value: 250, weight: 10 },
  { type: 'xp', label: '+500 XP', value: 500, weight: 5 },
  { type: 'streak', label: 'Заморозка серии', value: 1, weight: 15 },
  { type: 'multiplier', label: 'x2 XP на 1 час', value: 60, weight: 10 },
  { type: 'jackpot', label: '🎰 ДЖЕКПОТ +1000 XP', value: 1000, weight: 2 },
  { type: 'mystery', label: 'Mystery Box', value: 1, weight: 8 },
];

function pickReward() {
  const total = REWARDS.reduce((s, r) => s + r.weight, 0);
  let rnd = Math.random() * total;
  for (const r of REWARDS) { if ((rnd -= r.weight) <= 0) return r; }
  return REWARDS[0];
}

export default function MysteryBoxPage() {
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [todayCount, setTodayCount] = useState(0);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('mystery_boxes').select('*').eq('user_id', user.id).order('opened_at', { ascending: false }).limit(20);
    setHistory(data || []);
    const today = new Date().toISOString().slice(0, 10);
    setTodayCount((data || []).filter(b => b.opened_at.slice(0, 10) === today).length);
  };

  useEffect(() => { load(); }, []);

  const open = async () => {
    if (todayCount >= 3) return toast.error('Сегодня уже открыто 3 коробки. Возвращайтесь завтра!');
    setOpening(true);
    setReward(null);
    await new Promise(r => setTimeout(r, 1500));
    const r = pickReward();
    setReward(r);
    setOpening(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('mystery_boxes').insert({
        user_id: user.id, reward_type: r.type, reward_value: { value: r.value, label: r.label },
      });
      if (r.type === 'xp' || r.type === 'jackpot') {
        const { data: profile } = await supabase.from('profiles').select('xp, total_xp_earned').eq('user_id', user.id).maybeSingle();
        if (profile) {
          await supabase.from('profiles').update({
            xp: profile.xp + r.value, total_xp_earned: profile.total_xp_earned + r.value,
          }).eq('user_id', user.id);
        }
      }
      toast.success(`Получено: ${r.label}`);
      load();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Gift className="w-5 h-5 text-primary" /></div>
        <div>
          <h1 className="page-title">Mystery Box</h1>
          <p className="page-subtitle">3 бесплатных коробки в день. Откройте — узнаете награду!</p>
        </div>
      </div>

      <Card className="glass p-12 text-center mb-6">
        <AnimatePresence mode="wait">
          {opening ? (
            <motion.div key="open" initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 0.8, 1.3, 1], rotate: [0, -10, 10, -5, 0] }} transition={{ duration: 1.5 }}>
              <Gift className="w-32 h-32 mx-auto text-primary" />
              <p className="mt-4 text-lg font-semibold">Открываем...</p>
            </motion.div>
          ) : reward ? (
            <motion.div key="reward" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
              <Sparkles className="w-32 h-32 mx-auto text-primary mb-4" />
              <p className="text-3xl font-display font-bold text-gradient mb-2">{reward.label}</p>
              <p className="text-muted-foreground">Поздравляем!</p>
            </motion.div>
          ) : (
            <motion.div key="closed">
              <Gift className="w-32 h-32 mx-auto text-primary/60 mb-4" />
              <p className="text-muted-foreground mb-6">Осталось коробок сегодня: <span className="font-bold text-foreground">{3 - todayCount} из 3</span></p>
              <Button onClick={open} disabled={todayCount >= 3} size="lg" className="quick-action-btn">
                <Gift className="w-5 h-5" /> Открыть коробку
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <Card className="glass p-6">
        <h3 className="font-display font-semibold mb-4">История наград</h3>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока пусто</p>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{h.reward_value?.label || h.reward_type}</span>
                <span className="text-xs text-muted-foreground">{new Date(h.opened_at).toLocaleDateString('ru')}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
