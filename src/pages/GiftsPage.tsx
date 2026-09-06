import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Gift as GiftIcon, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHeader from '@/components/PageHeader';

interface Grant {
  id: string;
  reason: string;
  status: string;
  claimed_at: string | null;
  created_at: string;
  gift_id: string | null;
  gifts?: { title: string; description: string; icon: string; kind: string; value: number } | null;
}

export default function GiftsPage() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);
    const { data } = await supabase
      .from('gift_grants')
      .select('*, gifts(title, description, icon, kind, value)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setGrants((data as unknown as Grant[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const claim = async (g: Grant) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('gift_grants')
      .update({ status: 'claimed', claimed_at: new Date().toISOString() })
      .eq('id', g.id);
    if (error) return toast.error('Не удалось забрать подарок');

    if (g.gifts?.kind === 'xp' && g.gifts.value > 0) {
      const { data: p } = await supabase.from('profiles').select('xp, total_xp_earned').eq('user_id', user.id).maybeSingle();
      if (p) {
        await supabase.from('profiles').update({
          xp: p.xp + g.gifts.value,
          total_xp_earned: p.total_xp_earned + g.gifts.value,
        }).eq('user_id', user.id);
      }
    }
    toast.success(`Подарок получен: ${g.gifts?.title || 'награда'}`);
    load();
  };

  const pending = grants.filter(g => g.status !== 'claimed');
  const claimed = grants.filter(g => g.status === 'claimed');

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Мои подарки" subtitle="Награды от руководителя и призы за конкурсы" icon={GiftIcon} />

      {loading ? (
        <div className="widget-card text-center py-10 text-muted-foreground">Загрузка…</div>
      ) : grants.length === 0 ? (
        <div className="widget-card text-center py-12">
          <GiftIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Подарков пока нет — участвуйте в конкурсах и активностях!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="section-label mb-2">Ждут получения</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {pending.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="widget-card-glass">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">{g.gifts?.icon || '🎁'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{g.gifts?.title || 'Подарок'}</div>
                          <p className="text-sm text-muted-foreground">{g.gifts?.description}</p>
                          {g.reason && <p className="text-xs text-muted-foreground mt-1">За: {g.reason}</p>}
                          <Button size="sm" className="mt-3" onClick={() => claim(g)}>
                            <Sparkles className="w-4 h-4 mr-1" /> Забрать
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {claimed.length > 0 && (
            <div>
              <h2 className="section-label mb-2">Полученные</h2>
              <div className="space-y-2">
                {claimed.map(g => (
                  <Card key={g.id} className="p-4 flex items-center gap-3">
                    <span className="text-2xl">{g.gifts?.icon || '🎁'}</span>
                    <span className="flex-1 text-sm font-medium">{g.gifts?.title || 'Подарок'}</span>
                    <Badge variant="secondary">{g.claimed_at ? new Date(g.claimed_at).toLocaleDateString('ru-RU') : ''}</Badge>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
