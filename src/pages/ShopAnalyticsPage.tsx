import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface BoostPurchase {
  user_id: string;
  boost_name: string;
  boost_icon: string;
  purchased_at: string;
}

export default function ShopAnalyticsPage() {
  const [purchases, setPurchases] = useState<BoostPurchase[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    const [{ data: boosts }, { data: profs }, { count }] = await Promise.all([
      supabase.from('user_boosts').select('user_id, purchased_at, boost_items(name, icon)').order('purchased_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('user_id, name'),
      supabase.from('boost_items').select('*', { count: 'exact', head: true }),
    ]);

    if (boosts) setPurchases(boosts.map((b: any) => ({
      user_id: b.user_id,
      boost_name: b.boost_items?.name || '?',
      boost_icon: b.boost_items?.icon || '❓',
      purchased_at: b.purchased_at,
    })));
    if (profs) { const map: Record<string, string> = {}; (profs as any[]).forEach(p => map[p.user_id] = p.name); setProfiles(map); }
    setTotalItems(count || 0);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🛍 Аналитика магазина</h1>
      <p className="text-sm text-muted-foreground mb-6">Товаров: {totalItems} • Покупок: {purchases.length}</p>
      {purchases.length === 0 ? (
        <div className="widget-card text-center py-8 text-muted-foreground">Покупок пока нет</div>
      ) : (
        <div className="space-y-2">
          {purchases.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
              <Card className="p-3 widget-card flex items-center gap-3">
                <div className="text-xl">{p.boost_icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{profiles[p.user_id] || '—'}</div>
                  <div className="text-sm text-muted-foreground">{p.boost_name}</div>
                </div>
                <div className="text-xs text-muted-foreground">{new Date(p.purchased_at).toLocaleDateString('ru-RU')}</div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
