import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Crown, Lock, Check } from 'lucide-react';
import { toast } from 'sonner';

const TIERS = Array.from({ length: 20 }, (_, i) => ({
  level: i + 1,
  free: i % 2 === 0 ? `${(i + 1) * 50} XP` : `Стикер #${i + 1}`,
  premium: i % 3 === 0 ? `Буст x2 на 1 час` : `${(i + 1) * 100} XP`,
}));

export default function SeasonPassPage() {
  const { user } = useAuth();
  const [pass, setPass] = useState<any>(null);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from('season_pass').select('*').eq('user_id', user.id).maybeSingle();
    if (!data) {
      await supabase.from('season_pass').insert({ user_id: user.id });
      load();
    } else setPass(data);
  };
  useEffect(() => { load(); }, [user]);

  const claim = async (tier: number, isPremium: boolean) => {
    if (!pass) return;
    const claimed = pass.claimed_tiers ?? [];
    const key = `${tier}-${isPremium ? 'p' : 'f'}`;
    if (claimed.includes(key)) return;
    await supabase.from('season_pass').update({ claimed_tiers: [...claimed, key] }).eq('id', pass.id);
    toast.success(`Награда уровня ${tier} забрана!`);
    load();
  };

  if (!pass) return <div className="text-center p-8">Загрузка...</div>;
  const claimed = new Set(pass.claimed_tiers ?? []);
  const xpToNext = 500;
  const progress = (pass.xp / xpToNext) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Crown className="w-5 h-5 text-primary" /></div>
          <div><h1 className="page-title">Сезонный пропуск #{pass.season_number}</h1><p className="page-subtitle">Уровень {pass.current_tier} из 20</p></div>
        </div>
        {!pass.is_premium && <Button onClick={async () => { await supabase.from('season_pass').update({ is_premium: true }).eq('id', pass.id); load(); }}><Crown className="w-4 h-4 mr-2" />Активировать Premium</Button>}
      </div>

      <Card className="p-4 glass">
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground mt-1">{pass.xp} / {xpToNext} XP до следующего уровня</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TIERS.map(t => (
          <Card key={t.level} className={`p-3 glass ${t.level <= pass.current_tier ? 'ring-1 ring-primary/30' : 'opacity-60'}`}>
            <div className="flex items-center gap-2 mb-2"><Badge>Уровень {t.level}</Badge>{t.level > pass.current_tier && <Lock className="w-3 h-3" />}</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm">🆓 {t.free}</span>
                <Button size="sm" variant="ghost" disabled={t.level > pass.current_tier || claimed.has(`${t.level}-f`)} onClick={() => claim(t.level, false)}>
                  {claimed.has(`${t.level}-f`) ? <Check className="w-4 h-4" /> : 'Забрать'}
                </Button>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-amber-500/10">
                <span className="text-sm">👑 {t.premium}</span>
                <Button size="sm" variant="ghost" disabled={!pass.is_premium || t.level > pass.current_tier || claimed.has(`${t.level}-p`)} onClick={() => claim(t.level, true)}>
                  {claimed.has(`${t.level}-p`) ? <Check className="w-4 h-4" /> : 'Забрать'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
