import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ShopPage() {
  const { state, purchaseBoost, boostItems } = useApp();
  const allBoosts = [...boostItems, ...state.customBoosts];

  function handleBuy(boostId: string, name: string, cost: number) {
    if (state.profile.totalXpEarned < cost) {
      toast.error('Недостаточно XP!');
      return;
    }
    const success = purchaseBoost(boostId);
    if (success) {
      toast.success(`🎉 Куплено: ${name}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">🛍 Магазин бустов</h1>
      <p className="text-muted-foreground text-sm mb-6">Тратьте XP на плюшки! У вас: <span className="font-semibold text-accent">{state.profile.totalXpEarned} XP</span></p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {boostItems.map((item, i) => {
          const canAfford = state.profile.totalXpEarned >= item.xpCost;
          const owned = state.boostInventory.filter(b => b === item.id).length;
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
              <div className="text-sm text-muted-foreground mt-1 flex-1">{item.description}</div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-bold text-accent">{item.xpCost} XP</span>
                <Button
                  size="sm"
                  disabled={!canAfford}
                  onClick={() => handleBuy(item.id, item.name, item.xpCost)}
                >
                  Купить
                </Button>
              </div>
              {owned > 0 && <div className="text-xs text-muted-foreground mt-2">Куплено: {owned}</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
