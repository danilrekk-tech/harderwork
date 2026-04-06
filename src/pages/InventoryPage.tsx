import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface OwnedBoost {
  id: string;
  purchased_at: string;
  boost: { name: string; description: string; icon: string; effect: string; xp_cost: number };
}

const EFFECT_LABELS: Record<string, string> = {
  visual_theme: '🎨 Тема', visual_badge: '🏅 Бейдж', visual_frame: '🖼️ Рамка',
  xp_boost: '⚡ XP Буст', skip_task: '⏭️ Пропуск', extra_break: '☕ Перерыв',
  early_leave: '🏠 Ранний уход', custom: '✨ Особый',
};

export default function InventoryPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<OwnedBoost[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('user_boosts')
      .select('id, purchased_at, boost_id, boost_items(name, description, icon, effect, xp_cost)')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          setItems(data.map((d: any) => ({
            id: d.id,
            purchased_at: d.purchased_at,
            boost: d.boost_items || { name: '?', description: '', icon: '❓', effect: 'custom', xp_cost: 0 },
          })));
        }
      });
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🎒 Инвентарь</h1>
      <p className="text-muted-foreground text-sm mb-6">Купленные плюшки из магазина ({items.length})</p>
      {items.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Инвентарь пуст. Загляните в магазин!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Card className="p-4 widget-card text-center">
                <div className="text-3xl mb-2">{item.boost.icon}</div>
                <div className="font-semibold text-foreground">{item.boost.name}</div>
                <Badge variant="secondary" className="mt-1 text-xs">{EFFECT_LABELS[item.boost.effect] || item.boost.effect}</Badge>
                <div className="text-xs text-muted-foreground mt-2">{new Date(item.purchased_at).toLocaleDateString('ru-RU')}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
