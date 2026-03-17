import { useState, useCallback, useEffect } from 'react';
import type { AppState, Client, Invoice, Reminder, WidgetConfig, DealStatus, ActionEvent, DailyTask } from '@/types';
import { ACHIEVEMENTS_DATA, COLLECTIONS, BOOST_ITEMS, DEFAULT_WIDGETS, DEFAULT_LEADERBOARD } from './gameData';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

function calcLevel(totalXp: number) {
  let level = 1, xpNeeded = 200, remaining = totalXp;
  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = Math.floor(xpNeeded * 1.3);
  }
  return { level, xp: remaining, xpToNextLevel: xpNeeded };
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

function generateDailyTasksForDate(date: string): DailyTask[] {
  return [
    { id: `dt_cli_${date}`, type: 'clients', title: 'Обработать 5 клиентов', target: 5, current: 0, xpReward: 50, completed: false, date },
    { id: `dt_inv_${date}`, type: 'invoices', title: 'Выставить 3 счёта', target: 3, current: 0, xpReward: 75, completed: false, date },
    { id: `dt_pay_${date}`, type: 'payments', title: 'Получить 2 оплаты', target: 2, current: 0, xpReward: 100, completed: false, date },
  ];
}

const INITIAL_STATE: AppState = {
  profile: {
    name: 'Менеджер', level: 1, xp: 0, xpToNextLevel: 200,
    totalXpEarned: 0, xpSpent: 0, streakDays: 0, lastActiveDate: '', processedClientsCount: 0,
  },
  clients: [], invoices: [], reminders: [],
  achievements: ACHIEVEMENTS_DATA,
  unlockedAchievements: [],
  collections: COLLECTIONS,
  completedCollections: [],
  boostInventory: [],
  skills: { closing: 0, processing: 0, planning: 0, availablePoints: 0 },
  eventLog: [],
  momentum: { value: 0 },
  combo: { count: 0, maxCombo: 0 },
  personalRecords: {
    maxInvoicesPerDay: { value: 0 }, maxPaymentsPerDay: { value: 0 },
    maxClientsPerDay: { value: 0 }, maxRevenuePerDay: { value: 0 },
  },
  dailyTasks: generateDailyTasksForDate(todayStr()),
  focusSession: { isActive: false, durationMinutes: 25, actionsCount: 0, bonusXpPercent: 25 },
  multiLevelPlan: {
    invoices: { min: 10, norm: 15, challenge: 20 },
    payments: { min: 5, norm: 8, challenge: 12 },
  },
  season: { id: 's1', number: 1, startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString(), isActive: true },
  planSettings: { type: 'amount', target: 500000, period: 'monthly' },
  workSchedule: { workDays: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '18:00', timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  dashboardWidgets: DEFAULT_WIDGETS,
  isAdmin: false, leaderboard: DEFAULT_LEADERBOARD,
  managers: [], contests: [], bonusActivities: [],
  customAchievements: [], customBoosts: [],
  planCompletedThisMonth: false,
};

function loadState(userId?: string): AppState {
  try {
    const key = userId ? `sales_app_state_${userId}` : 'sales_app_state';
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      const state = { ...INITIAL_STATE, ...parsed, achievements: ACHIEVEMENTS_DATA, collections: COLLECTIONS };
      const today = todayStr();
      if (!state.dailyTasks?.length || state.dailyTasks[0]?.date !== today) {
        state.dailyTasks = generateDailyTasksForDate(today);
      }
      return state;
    }
  } catch { /* ignore */ }
  return INITIAL_STATE;
}

function saveState(state: AppState, userId?: string) {
  const key = userId ? `sales_app_state_${userId}` : 'sales_app_state';
  localStorage.setItem(key, JSON.stringify(state));
}

// Core action processor
function performAction(prev: AppState, actionType: ActionEvent['type'], xpBase: number, description: string): AppState {
  const now = new Date().toISOString();
  const today = todayStr();

  const comboWindow = 30000;
  const timeSinceLast = prev.combo.lastActionAt ? Date.now() - new Date(prev.combo.lastActionAt).getTime() : Infinity;
  const newCombo = timeSinceLast < comboWindow ? prev.combo.count + 1 : 1;
  const comboMult = 1 + Math.min(newCombo - 1, 10) * 0.1;
  const maxCombo = Math.max(prev.combo.maxCombo, newCombo);

  const decayRate = 2;
  const timeSinceMomentum = prev.momentum.lastActionAt ? (Date.now() - new Date(prev.momentum.lastActionAt).getTime()) / 60000 : 0;
  const decayed = Math.max(0, prev.momentum.value - timeSinceMomentum * decayRate);
  const newMomentum = Math.min(100, decayed + 10);
  const isMomentumActive = prev.momentum.bonusActiveUntil ? new Date(prev.momentum.bonusActiveUntil) > new Date() : false;
  const momentumMult = isMomentumActive ? 1.5 : 1;
  let bonusActiveUntil = prev.momentum.bonusActiveUntil;
  if (newMomentum >= 100 && !isMomentumActive) {
    bonusActiveUntil = new Date(Date.now() + 180000).toISOString();
    toast('🔥 Sales Momentum MAX! XP x1.5 на 3 минуты!');
  }

  let skillMult = 1;
  if (actionType === 'client_added') skillMult = 1 + prev.skills.processing * 0.05;
  if (actionType === 'invoice_issued') skillMult = 1 + prev.skills.planning * 0.05;
  if (actionType === 'invoice_paid') skillMult = 1 + prev.skills.closing * 0.05;

  const focusMult = prev.focusSession.isActive ? 1 + prev.focusSession.bonusXpPercent / 100 : 1;

  const totalXp = Math.round(xpBase * comboMult * momentumMult * skillMult * focusMult);
  const newTotalXp = prev.profile.totalXpEarned + totalXp;
  const { level, xp, xpToNextLevel } = calcLevel(newTotalXp - prev.profile.xpSpent);
  const oldLevel = prev.profile.level;
  const skillPointsGained = Math.max(0, level - oldLevel);

  if (newCombo >= 3) toast(`⚡ Комбо x${newCombo}! +${Math.round((comboMult - 1) * 100)}% XP`);
  const bonusInfo = totalXp > xpBase ? ` (x${(totalXp / xpBase).toFixed(1)})` : '';
  toast(`+${totalXp} XP${bonusInfo}`);
  if (level > oldLevel) toast.success(`🎉 Уровень ${level}! +${skillPointsGained} очков навыков`);

  const event: ActionEvent = { id: crypto.randomUUID(), type: actionType, description, xpEarned: totalXp, timestamp: now, managerName: prev.profile.name };

  const lastActive = prev.profile.lastActiveDate;
  let streakDays = prev.profile.streakDays;
  if (lastActive !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    streakDays = lastActive === yesterday ? streakDays + 1 : 1;
  }

  const dailyTasks = prev.dailyTasks.map(task => {
    if (task.date !== today || task.completed) return task;
    const match = (task.type === 'clients' && actionType === 'client_added')
      || (task.type === 'invoices' && actionType === 'invoice_issued')
      || (task.type === 'payments' && actionType === 'invoice_paid');
    if (!match) return task;
    const newCurrent = task.current + 1;
    const completed = newCurrent >= task.target;
    if (completed && !task.completed) toast.success(`✅ Задание "${task.title}" выполнено! +${task.xpReward} XP`);
    return { ...task, current: newCurrent, completed };
  });

  const dailyTaskXp = dailyTasks.filter(t => t.completed && !prev.dailyTasks.find(pt => pt.id === t.id)?.completed).reduce((s, t) => s + t.xpReward, 0);
  const finalTotalXp = newTotalXp + dailyTaskXp;
  const finalLevel = calcLevel(finalTotalXp - prev.profile.xpSpent);

  return {
    ...prev,
    profile: {
      ...prev.profile,
      level: finalLevel.level, xp: finalLevel.xp, xpToNextLevel: finalLevel.xpToNextLevel,
      totalXpEarned: finalTotalXp, streakDays, lastActiveDate: today,
    },
    skills: { ...prev.skills, availablePoints: prev.skills.availablePoints + skillPointsGained },
    combo: { count: newCombo, maxCombo, lastActionAt: now },
    momentum: { value: newMomentum, lastActionAt: now, bonusActiveUntil },
    eventLog: [event, ...prev.eventLog].slice(0, 200),
    dailyTasks,
    focusSession: prev.focusSession.isActive ? { ...prev.focusSession, actionsCount: prev.focusSession.actionsCount + 1 } : prev.focusSession,
  };
}

function checkAllAchievements(state: AppState): AppState {
  const issuedCount = state.invoices.length;
  const paidCount = state.invoices.filter(i => i.status === 'paid').length;
  const clientCount = state.profile.processedClientsCount;
  const totalRevenue = state.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);

  const planProgress = state.planSettings.type === 'amount'
    ? (totalRevenue / state.planSettings.target) * 100
    : (issuedCount / state.planSettings.target) * 100;
  const planCompleted = planProgress >= 100;

  const newUnlocks: string[] = [];
  for (const ach of state.achievements) {
    if (state.unlockedAchievements.includes(ach.id)) continue;
    let met = false;
    switch (ach.condition.type) {
      case 'invoices_issued': met = issuedCount >= ach.condition.target; break;
      case 'invoices_paid': met = paidCount >= ach.condition.target; break;
      case 'clients_processed': met = clientCount >= ach.condition.target; break;
      case 'streak_days': met = state.profile.streakDays >= ach.condition.target; break;
      case 'total_revenue': met = totalRevenue >= ach.condition.target; break;
      case 'xp_earned': met = state.profile.totalXpEarned >= ach.condition.target; break;
      case 'combo_max': met = state.combo.maxCombo >= ach.condition.target; break;
      case 'plan_completed': met = planCompleted; break;
      case 'plan_overfulfilled': met = planProgress >= ach.condition.target; break;
      case 'level_reached': met = state.profile.level >= ach.condition.target; break;
    }
    if (met) newUnlocks.push(ach.id);
  }

  if (newUnlocks.length === 0) return { ...state, planCompletedThisMonth: planCompleted };

  const xpGain = newUnlocks.reduce((s, id) => s + (state.achievements.find(a => a.id === id)?.xpReward || 0), 0);
  const newTotal = state.profile.totalXpEarned + xpGain;
  const lvl = calcLevel(newTotal - state.profile.xpSpent);

  newUnlocks.forEach(id => {
    const ach = state.achievements.find(a => a.id === id);
    if (ach) toast.success(`🏆 ${ach.title} — +${ach.xpReward} XP`);
  });

  const allUnlocked = [...state.unlockedAchievements, ...newUnlocks];
  const newCompletedCollections: string[] = [];
  let collectionXp = 0;
  for (const col of state.collections) {
    if (state.completedCollections.includes(col.id)) continue;
    if (col.achievementIds.every(aid => allUnlocked.includes(aid))) {
      newCompletedCollections.push(col.id);
      collectionXp += col.bonusXp;
      toast.success(`🎖 Коллекция "${col.name}" собрана! +${col.bonusXp} XP`);
    }
  }

  const finalTotal = newTotal + collectionXp;
  const finalLvl = calcLevel(finalTotal - state.profile.xpSpent);

  return {
    ...state,
    unlockedAchievements: allUnlocked,
    completedCollections: [...state.completedCollections, ...newCompletedCollections],
    profile: { ...state.profile, level: finalLvl.level, xp: finalLvl.xp, xpToNextLevel: finalLvl.xpToNextLevel, totalXpEarned: finalTotal },
    planCompletedThisMonth: planCompleted,
  };
}

function checkRecords(state: AppState): AppState {
  const today = todayStr();
  const todayEvents = state.eventLog.filter(e => e.timestamp.startsWith(today));
  const todayInvoices = todayEvents.filter(e => e.type === 'invoice_issued').length;
  const todayPayments = todayEvents.filter(e => e.type === 'invoice_paid').length;
  const todayClients = todayEvents.filter(e => e.type === 'client_added').length;
  const todayRevenue = state.invoices
    .filter(i => i.status === 'paid' && i.paidAt?.startsWith(today))
    .reduce((s, i) => s + i.amount, 0);

  const records = { ...state.personalRecords };
  let broken = false;

  if (todayInvoices > records.maxInvoicesPerDay.value) { records.maxInvoicesPerDay = { value: todayInvoices, date: today }; broken = true; }
  if (todayPayments > records.maxPaymentsPerDay.value) { records.maxPaymentsPerDay = { value: todayPayments, date: today }; broken = true; }
  if (todayClients > records.maxClientsPerDay.value) { records.maxClientsPerDay = { value: todayClients, date: today }; broken = true; }
  if (todayRevenue > records.maxRevenuePerDay.value) { records.maxRevenuePerDay = { value: todayRevenue, date: today }; broken = true; }

  if (broken) toast('🏅 Новый личный рекорд!');
  return { ...state, personalRecords: records };
}

// Sync key profile data to Supabase
async function syncProfileToDb(userId: string, state: AppState) {
  try {
    await supabase.from('profiles').update({
      level: state.profile.level,
      xp: state.profile.xp,
      xp_to_next_level: state.profile.xpToNextLevel,
      total_xp_earned: state.profile.totalXpEarned,
      xp_spent: state.profile.xpSpent,
      streak_days: state.profile.streakDays,
      last_active_date: state.profile.lastActiveDate,
      processed_clients_count: state.profile.processedClientsCount,
    }).eq('user_id', userId);
  } catch { /* silent */ }
}

export function useAppStore(userId?: string, role?: string | null, profileName?: string) {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadState(userId);
    return {
      ...loaded,
      isAdmin: role === 'leader',
      profile: { ...loaded.profile, name: profileName || loaded.profile.name },
    };
  });

  // Update isAdmin when role changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isAdmin: role === 'leader',
      profile: { ...prev.profile, name: profileName || prev.profile.name },
    }));
  }, [role, profileName]);

  useEffect(() => { saveState(state, userId); }, [state, userId]);

  // Sync profile to DB periodically (debounced)
  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => syncProfileToDb(userId, state), 2000);
    return () => clearTimeout(timer);
  }, [userId, state.profile.level, state.profile.totalXpEarned, state.profile.streakDays, state.profile.processedClientsCount]);

  useEffect(() => {
    const today = todayStr();
    if (!state.dailyTasks.length || state.dailyTasks[0]?.date !== today) {
      setState(prev => ({ ...prev, dailyTasks: generateDailyTasksForDate(today) }));
    }
  }, []);

  const updateState = useCallback((updater: (prev: AppState) => Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updater(prev) }));
  }, []);

  const quickAddClient = useCallback(() => {
    setState(prev => {
      const count = prev.profile.processedClientsCount + 1;
      let s = { ...prev, profile: { ...prev.profile, processedClientsCount: count } };
      s = performAction(s, 'client_added', 25, `Обработан клиент #${count}`);
      s = checkAllAchievements(s);
      s = checkRecords(s);
      return s;
    });
  }, []);

  const quickAddInvoice = useCallback((amount: number) => {
    setState(prev => {
      const invoice: Invoice = { id: crypto.randomUUID(), clientId: '', amount, status: 'issued', issuedAt: new Date().toISOString() };
      let s = { ...prev, invoices: [...prev.invoices, invoice] };
      s = performAction(s, 'invoice_issued', 50, `Выставлен счёт на ${amount.toLocaleString()} ₽`);
      s = checkAllAchievements(s);
      s = checkRecords(s);
      return s;
    });
  }, []);

  const quickPayInvoice = useCallback((invoiceId: string) => {
    setState(prev => {
      const inv = prev.invoices.find(i => i.id === invoiceId);
      if (!inv || inv.status === 'paid') return prev;
      let s = {
        ...prev,
        invoices: prev.invoices.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString() } : i),
      };
      s = performAction(s, 'invoice_paid', 100, `Оплачен счёт на ${inv.amount.toLocaleString()} ₽`);
      s = checkAllAchievements(s);
      s = checkRecords(s);
      return s;
    });
  }, []);

  const addClient = useCallback((client: Client) => {
    setState(prev => {
      let s = { ...prev, clients: [...prev.clients, client], profile: { ...prev.profile, processedClientsCount: prev.profile.processedClientsCount + 1 } };
      s = performAction(s, 'client_added', 25, `Добавлен клиент: ${client.name}`);
      s = checkAllAchievements(s);
      return s;
    });
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setState(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c),
    }));
  }, []);

  const addInvoice = useCallback((invoice: Invoice) => {
    setState(prev => {
      let s = { ...prev, invoices: [...prev.invoices, invoice] };
      s = performAction(s, 'invoice_issued', 50, `Выставлен счёт на ${invoice.amount.toLocaleString()} ₽`);
      s = checkAllAchievements(s);
      return s;
    });
  }, []);

  const payInvoice = useCallback((id: string) => {
    setState(prev => {
      const inv = prev.invoices.find(i => i.id === id);
      if (!inv) return prev;
      let s = { ...prev, invoices: prev.invoices.map(i => i.id === id ? { ...i, status: 'paid' as const, paidAt: new Date().toISOString() } : i) };
      s = performAction(s, 'invoice_paid', 100, `Оплачен счёт на ${inv.amount.toLocaleString()} ₽`);
      s = checkAllAchievements(s);
      return s;
    });
  }, []);

  const addReminder = useCallback((reminder: Reminder) => {
    setState(prev => ({ ...prev, reminders: [...prev.reminders, reminder] }));
  }, []);

  const completeReminder = useCallback((id: string) => {
    setState(prev => {
      let s = { ...prev, reminders: prev.reminders.map(r => r.id === id ? { ...r, completed: true } : r) };
      s = performAction(s, 'client_added', 15, 'Напоминание выполнено');
      return s;
    });
  }, []);

  const updateWidgets = useCallback((widgets: WidgetConfig[]) => {
    setState(prev => ({ ...prev, dashboardWidgets: widgets }));
  }, []);

  const purchaseBoost = useCallback((boostId: string) => {
    const allBoosts = [...BOOST_ITEMS];
    const boost = allBoosts.find(b => b.id === boostId) || state.customBoosts.find(b => b.id === boostId);
    if (!boost) return false;
    const balance = state.profile.totalXpEarned - state.profile.xpSpent;
    if (balance < boost.xpCost) return false;
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, xpSpent: prev.profile.xpSpent + boost.xpCost },
      boostInventory: [...prev.boostInventory, boostId],
    }));
    return true;
  }, [state.profile.totalXpEarned, state.profile.xpSpent, state.customBoosts]);

  const checkAchievements = useCallback(() => {
    setState(prev => checkAllAchievements(prev));
  }, []);

  const updateDealStatus = useCallback((clientId: string, status: DealStatus) => {
    setState(prev => {
      let s = { ...prev, clients: prev.clients.map(c => c.id === clientId ? { ...c, dealStatus: status, updatedAt: new Date().toISOString() } : c) };
      if (status === 'invoice_sent') s = performAction(s, 'invoice_issued', 30, 'Счёт выставлен клиенту');
      if (status === 'invoice_paid') s = performAction(s, 'invoice_paid', 80, 'Сделка закрыта');
      return checkAllAchievements(s);
    });
  }, []);

  const allocateSkillPoint = useCallback((skill: 'closing' | 'processing' | 'planning') => {
    setState(prev => {
      if (prev.skills.availablePoints <= 0 || prev.skills[skill] >= 10) return prev;
      return {
        ...prev,
        skills: { ...prev.skills, [skill]: prev.skills[skill] + 1, availablePoints: prev.skills.availablePoints - 1 },
      };
    });
  }, []);

  const startFocusSession = useCallback((minutes: number) => {
    setState(prev => ({
      ...prev,
      focusSession: { isActive: true, startedAt: new Date().toISOString(), durationMinutes: minutes, actionsCount: 0, bonusXpPercent: 25 },
    }));
    toast('🎯 Фокус-сессия начата! +25% к XP');
  }, []);

  const endFocusSession = useCallback(() => {
    setState(prev => {
      if (!prev.focusSession.isActive) return prev;
      const bonus = prev.focusSession.actionsCount * 10;
      if (bonus > 0) toast.success(`🎯 Фокус-сессия завершена! ${prev.focusSession.actionsCount} действий, +${bonus} бонус XP`);
      const newTotal = prev.profile.totalXpEarned + bonus;
      const lvl = calcLevel(newTotal - prev.profile.xpSpent);
      const event: ActionEvent = { id: crypto.randomUUID(), type: 'focus_completed', description: `Фокус-сессия: ${prev.focusSession.actionsCount} действий`, xpEarned: bonus, timestamp: new Date().toISOString(), managerName: prev.profile.name };
      return {
        ...prev,
        profile: { ...prev.profile, totalXpEarned: newTotal, level: lvl.level, xp: lvl.xp, xpToNextLevel: lvl.xpToNextLevel },
        focusSession: { ...prev.focusSession, isActive: false },
        eventLog: [event, ...prev.eventLog].slice(0, 200),
      };
    });
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const newTotal = prev.profile.totalXpEarned + amount;
      const lvl = calcLevel(newTotal - prev.profile.xpSpent);
      return { ...prev, profile: { ...prev.profile, totalXpEarned: newTotal, level: lvl.level, xp: lvl.xp, xpToNextLevel: lvl.xpToNextLevel } };
    });
  }, []);

  return {
    state, updateState, addXp,
    quickAddClient, quickAddInvoice, quickPayInvoice,
    addClient, updateClient, addInvoice, payInvoice,
    addReminder, completeReminder, updateWidgets,
    purchaseBoost, checkAchievements, updateDealStatus,
    allocateSkillPoint, startFocusSession, endFocusSession,
    boostItems: BOOST_ITEMS,
  };
}
