import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';

export default function SalesMomentumWidget() {
  const { state } = useApp();

  const momentumDecayed = state.momentum.lastActionAt
    ? Math.max(0, state.momentum.value - ((Date.now() - new Date(state.momentum.lastActionAt).getTime()) / 60000) * 2)
    : 0;
  const pct = Math.min(100, Math.round(momentumDecayed));
  const isActive = state.momentum.bonusActiveUntil ? new Date(state.momentum.bonusActiveUntil) > new Date() : false;

  return (
    <div>
      <h3 className="font-display font-semibold text-foreground mb-3">🔥 Sales Momentum</h3>
      <div className="flex items-center gap-4 mb-3">
        <div className="flex-1">
          <div className="momentum-bar h-4">
            <motion.div
              className={`momentum-bar-fill ${isActive ? 'momentum-active' : ''}`}
              animate={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="stat-value text-2xl">{pct}%</span>
      </div>
      {isActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-accent font-semibold text-center">
          🔥 BOOST АКТИВЕН — XP x1.5!
        </motion.div>
      )}
      {!isActive && pct < 100 && (
        <p className="text-xs text-muted-foreground text-center">Выполняйте действия, чтобы заполнить шкалу и получить бонус XP</p>
      )}
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Комбо: x{state.combo.count}</span>
        <span>Макс. комбо: x{state.combo.maxCombo}</span>
      </div>
    </div>
  );
}
