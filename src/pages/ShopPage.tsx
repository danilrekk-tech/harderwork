import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/context/AppContext';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Sparkles, Check, Coins } from 'lucide-react';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_cost: number;
  effect: string;
}

const EFFECT_LABELS: Record<string, { label: string; color: string }> = {
  visual_theme: { label: '🎨 Тема', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  visual_badge: { label: '🏅 Бейдж', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  visual_frame: { label: '🖼️ Рамка', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  xp_boost: { label: '⚡ XP Буст', color: 'bg-primary/10 text-primary' },
  skip_task: { label: '⏭️ Пропуск', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  extra_break: { label: '☕ Перерыв', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  early_leave: { label: '🏠 Ранний уход', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  custom: { label: '✨ Особый', color: 'bg-primary/10 text-primary' },
};

export default function ShopPage() {
  const { user } = useAuth();
  const { state } = useApp();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const xpBalance = state.profile.totalXpEarned - state.profile.xpSpent;

  useEffect(() => { loadShop(); }, [user]);

  async function loadShop() {
    const { data: boosts } = await supabase.from('boost_items').select('*').order('xp_cost');
    if (boosts) setItems(boosts as unknown as ShopItem[]);
    if (user) {
      const { data: purchases } = await supabase.from('user_boosts').select('boost_id').eq('user_id', user.id);
      if (purchases) setOwned(purchases.map(p => p.boost_id));
    }
    setLoading(false);
  }

  async function handleBuy(item: ShopItem) {
    if (!user) return;
    if (xpBalance < item.xp_cost) { toast.error('Недостаточно XP!'); return; }

    setPurchasing(item.id);
    const { error } = await supabase.from('user_boosts').insert({ user_id: user.id, boost_id: item.id });
    if (error) { toast.error('Ошибка покупки'); setPurchasing(null); return; }

    await supabase.from('profiles').update({ xp_spent: state.profile.xpSpent + item.xp_cost }).eq('user_id', user.id);
    toast.success(`🎉 Куплено: ${item.name}`);
    setOwned(prev => [...prev, item.id]);
    setPurchasing(null);
    loadShop();
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 w-48 bg-muted rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-muted rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-primary" />
            Магазин плюшек
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Обменивайте XP на крутые бонусы</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 border border-accent/20">
          <Coins className="w-4 h-4 text-accent" />
          <span className="font-display font-bold text-accent">{xpBalance} XP</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="widget-card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-display font-semibold text-foreground mb-1">Магазин пока пуст</p>
          <p className="text-sm text-muted-foreground">Руководитель еще не добавил плюшки</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const canAfford = xpBalance >= item.xp_cost;
            const ownedCount = owned.filter(id => id === item.id).length;
            const effectInfo = EFFECT_LABELS[item.effect] || { label: item.effect, color: 'bg-muted text-muted-foreground' };
            const isPurchasing = purchasing === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`widget-card flex flex-col group hover:scale-[1.02] transition-all duration-200 ${ownedCount > 0 ? 'border-primary/20' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{item.icon}</div>
                  {ownedCount > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                      <Check className="w-3 h-3" /> {ownedCount}
                    </div>
                  )}
                </div>
                <div className="font-display font-semibold text-foreground text-sm">{item.name}</div>
                <Badge variant="secondary" className={`w-fit mt-1.5 text-[10px] border-0 ${effectInfo.color}`}>
                  {effectInfo.label}
                </Badge>
                <div className="text-xs text-muted-foreground mt-2 flex-1 leading-relaxed">{item.description}</div>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <span className="text-sm font-bold text-accent">{item.xp_cost} XP</span>
                  </div>
                  <Button
                    size="sm"
                    disabled={!canAfford || isPurchasing}
                    onClick={() => handleBuy(item)}
                    className="h-8 text-xs"
                  >
                    {isPurchasing ? '...' : 'Купить'}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
