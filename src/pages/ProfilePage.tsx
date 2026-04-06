import { useApp } from '@/context/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { state } = useApp();
  const { role, profileName } = useAuth();

  const xpBalance = state.profile.totalXpEarned - state.profile.xpSpent;
  const xpPercent = state.profile.xpToNextLevel > 0
    ? Math.min(100, (state.profile.xp / state.profile.xpToNextLevel) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-6">👤 Профиль</h1>
      
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 widget-card text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-primary/30 flex items-center justify-center text-3xl font-bold text-primary mx-auto mb-3">
            {(profileName || state.profile.name || 'U').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">{profileName || state.profile.name}</h2>
          <Badge variant="secondary" className="mt-1">{role === 'leader' ? '🛡️ Руководитель' : '📊 Менеджер продаж'}</Badge>
          
          {role !== 'leader' && (
            <div className="mt-4 max-w-xs mx-auto">
              <div className="flex items-center justify-between mb-1">
                <span className="level-badge">Ур. {state.profile.level}</span>
                <span className="text-sm text-muted-foreground">{state.profile.xp} / {state.profile.xpToNextLevel} XP</span>
              </div>
              <div className="xp-bar">
                <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: '⭐', label: 'Всего XP', value: state.profile.totalXpEarned },
          { icon: '💎', label: 'Баланс XP', value: xpBalance },
          { icon: '🔥', label: 'Серия', value: `${state.profile.streakDays} дн.` },
          { icon: '👥', label: 'Клиентов', value: state.profile.processedClientsCount },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
            <Card className="p-4 text-center widget-card">
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
