import { useState, useCallback, useEffect } from 'react';
import type { AppState, Client, Invoice, Reminder, WidgetConfig, DealStatus, BoostItem } from '@/types';

const ACHIEVEMENTS_DATA = [
  { id: 'first_invoice', title: 'Первый счёт', description: 'Выставить первый счёт', icon: '📄', xpReward: 50, condition: { type: 'invoices_issued' as const, target: 1 } },
  { id: 'ten_invoices', title: 'Десятка', description: 'Выставить 10 счетов', icon: '📋', xpReward: 150, condition: { type: 'invoices_issued' as const, target: 10 } },
  { id: 'fifty_invoices', title: 'Полтинник', description: 'Выставить 50 счетов', icon: '🏆', xpReward: 500, condition: { type: 'invoices_issued' as const, target: 50 } },
  { id: 'first_payment', title: 'Первая оплата', description: 'Получить первую оплату', icon: '💰', xpReward: 100, condition: { type: 'invoices_paid' as const, target: 1 } },
  { id: 'ten_payments', title: 'Кассир', description: 'Получить 10 оплат', icon: '💎', xpReward: 300, condition: { type: 'invoices_paid' as const, target: 10 } },
  { id: 'five_clients', title: 'Нетворкер', description: 'Обработать 5 клиентов', icon: '🤝', xpReward: 100, condition: { type: 'clients_processed' as const, target: 5 } },
  { id: 'twenty_clients', title: 'Мастер продаж', description: 'Обработать 20 клиентов', icon: '⭐', xpReward: 400, condition: { type: 'clients_processed' as const, target: 20 } },
  { id: 'streak_3', title: 'На волне', description: '3 дня подряд активности', icon: '🔥', xpReward: 75, condition: { type: 'streak_days' as const, target: 3 } },
  { id: 'streak_7', title: 'Неделя огня', description: '7 дней подряд активности', icon: '🔥', xpReward: 200, condition: { type: 'streak_days' as const, target: 7 } },
  { id: 'revenue_100k', title: 'Стотысячник', description: 'Общая выручка 100 000', icon: '💵', xpReward: 500, condition: { type: 'total_revenue' as const, target: 100000 } },
  { id: 'revenue_1m', title: 'Миллионер', description: 'Общая выручка 1 000 000', icon: '🏅', xpReward: 2000, condition: { type: 'total_revenue' as const, target: 1000000 } },
  { id: 'level_5', title: 'Уровень 5', description: 'Достичь 5 уровня', icon: '🎯', xpReward: 250, condition: { type: 'xp_earned' as const, target: 1000 } },
];

const BOOST_ITEMS = [
  { id: 'coffee', name: '☕ Кофе-брейк', description: '15 минут отдыха заслужено!', icon: '☕', xpCost: 100, effect: 'rest' },
  { id: 'music', name: '🎵 Музыка на час', description: 'Слушай любимую музыку', icon: '🎵', xpCost: 50, effect: 'music' },
  { id: 'late_start', name: '😴 Поздний старт', description: 'Начни смену на 30 мин позже', icon: '😴', xpCost: 200, effect: 'late_start' },
  { id: 'early_finish', name: '🏃 Ранний уход', description: 'Закончи смену на 30 мин раньше', icon: '🏃', xpCost: 300, effect: 'early_finish' },
  { id: 'lunch_ext', name: '🍕 Длинный обед', description: 'Продли обед на 30 минут', icon: '🍕', xpCost: 150, effect: 'lunch' },
  { id: 'theme', name: '🎨 Кастом тема', description: 'Смени цвет интерфейса на день', icon: '🎨', xpCost: 75, effect: 'theme' },
];

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'w1', type: 'plan_progress', position: 0, size: 'large', visible: true },
  { id: 'w2', type: 'invoices', position: 1, size: 'medium', visible: true },
  { id: 'w3', type: 'clients', position: 2, size: 'small', visible: true },
  { id: 'w4', type: 'work_days_left', position: 3, size: 'small', visible: true },
  { id: 'w5', type: 'shift_timer', position: 4, size: 'small', visible: true },
  { id: 'w6', type: 'leaderboard', position: 5, size: 'medium', visible: true },
  { id: 'w7', type: 'motivation', position: 6, size: 'medium', visible: true },
  { id: 'w8', type: 'xp_progress', position: 7, size: 'medium', visible: true },
];

const DEFAULT_LEADERBOARD = [
  { id: '1', name: 'Алексей М.', revenue: 520000, invoicesPaid: 23, level: 8 },
  { id: '2', name: 'Мария К.', revenue: 480000, invoicesPaid: 19, level: 7 },
  { id: '3', name: 'Дмитрий С.', revenue: 350000, invoicesPaid: 15, level: 6 },
  { id: '4', name: 'Елена В.', revenue: 290000, invoicesPaid: 12, level: 5 },
  { id: '5', name: 'Игорь Н.', revenue: 210000, invoicesPaid: 9, level: 4 },
];

const INITIAL_STATE: AppState = {
  profile: {
    name: 'Менеджер',
    level: 1,
    xp: 0,
    xpToNextLevel: 200,
    totalXpEarned: 0,
    streakDays: 0,
    lastActiveDate: '',
  },
  clients: [],
  invoices: [],
  reminders: [],
  achievements: ACHIEVEMENTS_DATA,
  unlockedAchievements: [],
  boostInventory: [],
  planSettings: { type: 'amount', target: 500000, period: 'monthly' },
  workSchedule: {
    workDays: [1, 2, 3, 4, 5],
    startTime: '09:00',
    endTime: '18:00',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  dashboardWidgets: DEFAULT_WIDGETS,
  isAdmin: false,
  leaderboard: DEFAULT_LEADERBOARD,
  managers: [],
  contests: [],
  bonusActivities: [],
  customAchievements: [],
  customBoosts: [],
};

function loadState(): AppState {
  try {
    const saved = localStorage.getItem('sales_app_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_STATE, ...parsed, achievements: ACHIEVEMENTS_DATA };
    }
  } catch { /* ignore */ }
  return INITIAL_STATE;
}

function saveState(state: AppState) {
  localStorage.setItem('sales_app_state', JSON.stringify(state));
}

function calcLevel(totalXp: number): { level: number; xp: number; xpToNextLevel: number } {
  let level = 1;
  let xpNeeded = 200;
  let remaining = totalXp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.3);
  }
  return { level, xp: remaining, xpToNextLevel: xpNeeded };
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => { saveState(state); }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => Partial<AppState>) => {
    setState(prev => {
      const updates = updater(prev);
      return { ...prev, ...updates };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const newTotal = prev.profile.totalXpEarned + amount;
      const { level, xp, xpToNextLevel } = calcLevel(newTotal);
      return {
        ...prev,
        profile: { ...prev.profile, level, xp, xpToNextLevel, totalXpEarned: newTotal },
      };
    });
  }, []);

  const addClient = useCallback((client: Client) => {
    setState(prev => ({ ...prev, clients: [...prev.clients, client] }));
    addXp(25);
  }, [addXp]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
    }));
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    setState(prev => ({ ...prev, invoices: [...prev.invoices, invoice] }));
    addXp(50);
  }, [addXp]);

  const payInvoice = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      invoices: prev.invoices.map(inv =>
        inv.id === id ? { ...inv, status: 'paid' as const, paidAt: new Date().toISOString() } : inv
      ),
    }));
    addXp(100);
  }, [addXp]);

  const addReminder = useCallback((reminder: Reminder) => {
    setState(prev => ({ ...prev, reminders: [...prev.reminders, reminder] }));
  }, []);

  const completeReminder = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, completed: true } : r),
    }));
    addXp(15);
  }, [addXp]);

  const updateWidgets = useCallback((widgets: WidgetConfig[]) => {
    setState(prev => ({ ...prev, dashboardWidgets: widgets }));
  }, []);

  const purchaseBoost = useCallback((boostId: string) => {
    const boost = BOOST_ITEMS.find(b => b.id === boostId);
    if (!boost) return false;
    let success = false;
    setState(prev => {
      if (prev.profile.xp >= boost.xpCost) {
        // We deduct from totalXpEarned conceptually but keep xp as spendable
        const newTotal = prev.profile.totalXpEarned - boost.xpCost;
        const { level, xp, xpToNextLevel } = calcLevel(Math.max(0, newTotal));
        success = true;
        return {
          ...prev,
          profile: { ...prev.profile, level, xp, xpToNextLevel, totalXpEarned: Math.max(0, newTotal) },
          boostInventory: [...prev.boostInventory, boostId],
        };
      }
      return prev;
    });
    return success;
  }, []);

  const checkAchievements = useCallback(() => {
    setState(prev => {
      const issuedCount = prev.invoices.length;
      const paidCount = prev.invoices.filter(i => i.status === 'paid').length;
      const clientCount = prev.clients.length;
      const totalRevenue = prev.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

      const newUnlocks: string[] = [];
      for (const ach of prev.achievements) {
        if (prev.unlockedAchievements.includes(ach.id)) continue;
        let met = false;
        switch (ach.condition.type) {
          case 'invoices_issued': met = issuedCount >= ach.condition.target; break;
          case 'invoices_paid': met = paidCount >= ach.condition.target; break;
          case 'clients_processed': met = clientCount >= ach.condition.target; break;
          case 'streak_days': met = prev.profile.streakDays >= ach.condition.target; break;
          case 'total_revenue': met = totalRevenue >= ach.condition.target; break;
          case 'xp_earned': met = prev.profile.totalXpEarned >= ach.condition.target; break;
        }
        if (met) newUnlocks.push(ach.id);
      }

      if (newUnlocks.length === 0) return prev;

      const xpGain = newUnlocks.reduce((s, id) => s + (prev.achievements.find(a => a.id === id)?.xpReward || 0), 0);
      const newTotal = prev.profile.totalXpEarned + xpGain;
      const { level, xp, xpToNextLevel } = calcLevel(newTotal);

      return {
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newUnlocks],
        profile: { ...prev.profile, level, xp, xpToNextLevel, totalXpEarned: newTotal },
      };
    });
  }, []);

  const updateDealStatus = useCallback((clientId: string, status: DealStatus) => {
    updateClient(clientId, { dealStatus: status });
    if (status === 'invoice_sent') addXp(30);
    if (status === 'invoice_paid') addXp(80);
  }, [updateClient, addXp]);

  return {
    state,
    updateState,
    addXp,
    addClient,
    updateClient,
    addInvoice,
    payInvoice,
    addReminder,
    completeReminder,
    updateWidgets,
    purchaseBoost,
    checkAchievements,
    updateDealStatus,
    boostItems: BOOST_ITEMS,
  };
}
