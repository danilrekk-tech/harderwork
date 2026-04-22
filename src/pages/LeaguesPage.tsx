import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const TIER_INFO: Record<string, { color: string; emoji: string; min: number }> = {
  bronze: { color: 'text-amber-700', emoji: '🥉', min: 0 },
  silver: { color: 'text-slate-400', emoji: '🥈', min: 1000 },
  gold: { color: 'text-yellow-500', emoji: '🥇', min: 3000 },
  platinum: { color: 'text-cyan-400', emoji: '💎', min: 7000 },
};

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('leagues').select('*').order('points', { ascending: false });
      const { data: profs } = await supabase.from('profiles').select('user_id, name, avatar_url');
      const map = new Map((profs ?? []).map((p: any) => [p.user_id, p]));
      setLeagues((data ?? []).map((l: any) => ({ ...l, profile: map.get(l.user_id) })));
    })();
  }, []);

  const grouped = leagues.reduce((acc: any, l) => {
    (acc[l.tier] = acc[l.tier] ?? []).push(l);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Trophy className="w-5 h-5 text-primary" /></div>
        <div><h1 className="page-title">Лиги</h1><p className="page-subtitle">Соревнуйся за повышение в лиге</p></div>
      </div>

      {Object.entries(TIER_INFO).map(([tier, info]) => (
        <Card key={tier} className="p-5 glass">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl">{info.emoji}</span>
            <h2 className={`text-xl font-bold capitalize ${info.color}`}>{tier}</h2>
            <Badge variant="outline">от {info.min} очков</Badge>
          </div>
          <div className="space-y-2">
            {(grouped[tier] ?? []).map((l: any, i: number) => (
              <div key={l.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2"><span className="text-muted-foreground w-6">{i + 1}</span><span>{l.profile?.name ?? '—'}</span></div>
                <Badge>{l.points} очков</Badge>
              </div>
            ))}
            {!grouped[tier]?.length && <p className="text-sm text-muted-foreground text-center py-2">Пусто</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}
