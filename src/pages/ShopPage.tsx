import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_cost: number;
  effect: string;
}

const EFFECT_LABELS: Record<string, string> = {
  visual_theme: '🎨 Тема',
  visual_badge: '🏅 Бейдж',
  visual_frame: '🖼️ Рамка',
  xp_boost: '⚡ XP Буст',
  skip_task: '⏭️ Пропуск',
  extra_break: '☕ Перерыв',
  early_leave: '🏠 Ранний уход',
  custom: '✨ Особый',
};

export default function ShopPage() {
  const { user } = useAuth();
  const { state } = useApp();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const xpBalance = state.profile.totalXpEarned - state.profile.xpSpent;

  useEffect(() => {
    loadShop();
  }, [user]);

  async function loadShop() {
    const { data: boosts } = await supabase.from('boost_items').select('*').order('xp_cost');
    if (boosts) setItems(boosts as unknown as ShopItem[]);

    if (user) {
      const { data: purchases } = await supabase
        .from('user_boosts')
        .select('boost_id')
        .eq('user_id', user.id);
      if (purchases) setOwned(purchases.map(p => p.boost_id));
    }
    setLoading(false);
  }

  async function handleBuy(item: ShopItem) {
    if (!user) return;
    if (xpBalance < item.xp_cost) {
      toast.error('Недостаточно XP!');
      return;
    }

    // Save to DB
    const { error } = await supabase.from('user_boosts').insert({
      user_id: user.id,
      boost_id: item.id,
    });
    if (error) { toast.error('Ошибка покупки'); return; }

    // Deduct XP from profile
    await supabase.from('profiles').update({
      xp_spent: state.profile.xpSpent + item.xp_cost,
    }).eq('user_id', user.id);

    toast.success(`🎉 Куплено: ${item.name}`);
    setOwned(prev => [...prev, item.id]);
    loadShop();
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Загрузка магазина...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🛍 Магазин плюшек</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Тратьте XP на плюшки! У вас: <span className="font-semibold text-accent">{xpBalance} XP</span>
      </p>

      {items.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">
          <p className="text-lg mb-1">Магазин пока пуст</p>
          <p className="text-sm">Руководитель еще не добавил плюшки в магазин</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const canAfford = xpBalance >= item.xp_cost;
            const isOwned = owned.includes(item.id);
            const ownedCount = owned.filter(id => id === item.id).length;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="widget-card flex flex-col"
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-display font-semibold text-foreground">{item.name}</div>
                <Badge variant="secondary" className="w-fit mt-1 text-xs">
                  {EFFECT_LABELS[item.effect] || item.effect}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2 flex-1">{item.description}</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-accent">{item.xp_cost} XP</span>
                  <Button
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleBuy(item)}
                  >
                    Купить
                  </Button>
                </div>
                {ownedCount > 0 && <div className="text-xs text-primary mt-2 font-medium">✅ Куплено: {ownedCount}</div>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
