import type { Achievement, AchievementCollection, BoostItem, WidgetConfig } from '@/types';

export const ACHIEVEMENTS_DATA: Achievement[] = [
  // Invoice collection
  { id: 'inv_1', title: 'Первый счёт', description: 'Выставить первый счёт', icon: '📄', xpReward: 50, condition: { type: 'invoices_issued', target: 1 }, collectionId: 'col_invoices' },
  { id: 'inv_5', title: 'Пятёрка', description: 'Выставить 5 счетов', icon: '📋', xpReward: 100, condition: { type: 'invoices_issued', target: 5 }, collectionId: 'col_invoices' },
  { id: 'inv_10', title: 'Десятка', description: 'Выставить 10 счетов', icon: '📊', xpReward: 150, condition: { type: 'invoices_issued', target: 10 }, collectionId: 'col_invoices' },
  { id: 'inv_25', title: 'Четвертак', description: 'Выставить 25 счетов', icon: '📈', xpReward: 300, condition: { type: 'invoices_issued', target: 25 }, collectionId: 'col_invoices' },
  { id: 'inv_50', title: 'Полтинник', description: 'Выставить 50 счетов', icon: '🏆', xpReward: 500, condition: { type: 'invoices_issued', target: 50 }, collectionId: 'col_invoices' },
  { id: 'inv_100', title: 'Сотня счетов', description: 'Выставить 100 счетов', icon: '👑', xpReward: 1000, condition: { type: 'invoices_issued', target: 100 }, collectionId: 'col_invoices' },
  // Payment collection
  { id: 'pay_1', title: 'Первая оплата', description: 'Получить первую оплату', icon: '💰', xpReward: 100, condition: { type: 'invoices_paid', target: 1 }, collectionId: 'col_payments' },
  { id: 'pay_5', title: 'Кассир', description: 'Получить 5 оплат', icon: '💎', xpReward: 200, condition: { type: 'invoices_paid', target: 5 }, collectionId: 'col_payments' },
  { id: 'pay_10', title: 'Мастер оплат', description: 'Получить 10 оплат', icon: '💳', xpReward: 350, condition: { type: 'invoices_paid', target: 10 }, collectionId: 'col_payments' },
  { id: 'pay_25', title: 'Денежная машина', description: 'Получить 25 оплат', icon: '🏧', xpReward: 600, condition: { type: 'invoices_paid', target: 25 }, collectionId: 'col_payments' },
  { id: 'pay_50', title: 'Золотой кассир', description: 'Получить 50 оплат', icon: '🥇', xpReward: 1000, condition: { type: 'invoices_paid', target: 50 }, collectionId: 'col_payments' },
  // Client collection
  { id: 'cli_5', title: 'Нетворкер', description: 'Обработать 5 клиентов', icon: '🤝', xpReward: 100, condition: { type: 'clients_processed', target: 5 }, collectionId: 'col_clients' },
  { id: 'cli_10', title: 'Контактёр', description: 'Обработать 10 клиентов', icon: '📞', xpReward: 200, condition: { type: 'clients_processed', target: 10 }, collectionId: 'col_clients' },
  { id: 'cli_20', title: 'Мастер продаж', description: 'Обработать 20 клиентов', icon: '⭐', xpReward: 400, condition: { type: 'clients_processed', target: 20 }, collectionId: 'col_clients' },
  { id: 'cli_50', title: 'Гуру контактов', description: 'Обработать 50 клиентов', icon: '🌟', xpReward: 700, condition: { type: 'clients_processed', target: 50 }, collectionId: 'col_clients' },
  { id: 'cli_100', title: 'Легенда', description: 'Обработать 100 клиентов', icon: '👑', xpReward: 1500, condition: { type: 'clients_processed', target: 100 }, collectionId: 'col_clients' },
  // Revenue collection
  { id: 'rev_50k', title: 'Полтинник', description: 'Общая выручка 50 000', icon: '💵', xpReward: 300, condition: { type: 'total_revenue', target: 50000 }, collectionId: 'col_revenue' },
  { id: 'rev_100k', title: 'Стотысячник', description: 'Общая выручка 100 000', icon: '💶', xpReward: 500, condition: { type: 'total_revenue', target: 100000 }, collectionId: 'col_revenue' },
  { id: 'rev_500k', title: 'Полмиллиона', description: 'Общая выручка 500 000', icon: '💷', xpReward: 1000, condition: { type: 'total_revenue', target: 500000 }, collectionId: 'col_revenue' },
  { id: 'rev_1m', title: 'Миллионер', description: 'Общая выручка 1 000 000', icon: '🏅', xpReward: 2000, condition: { type: 'total_revenue', target: 1000000 }, collectionId: 'col_revenue' },
  { id: 'rev_5m', title: 'Магнат', description: 'Общая выручка 5 000 000', icon: '💎', xpReward: 5000, condition: { type: 'total_revenue', target: 5000000 }, collectionId: 'col_revenue' },
  // Streak collection
  { id: 'str_3', title: 'На волне', description: '3 дня подряд', icon: '🔥', xpReward: 75, condition: { type: 'streak_days', target: 3 }, collectionId: 'col_streaks' },
  { id: 'str_7', title: 'Неделя огня', description: '7 дней подряд', icon: '🔥', xpReward: 200, condition: { type: 'streak_days', target: 7 }, collectionId: 'col_streaks' },
  { id: 'str_14', title: 'Две недели', description: '14 дней подряд', icon: '🔥', xpReward: 400, condition: { type: 'streak_days', target: 14 }, collectionId: 'col_streaks' },
  { id: 'str_30', title: 'Месяц мощи', description: '30 дней подряд', icon: '🔥', xpReward: 1000, condition: { type: 'streak_days', target: 30 }, collectionId: 'col_streaks' },
  // Special
  { id: 'combo_5', title: 'Комбо x5', description: 'Набрать комбо 5', icon: '⚡', xpReward: 150, condition: { type: 'combo_max', target: 5 } },
  { id: 'combo_10', title: 'Комбо x10', description: 'Набрать комбо 10', icon: '⚡', xpReward: 400, condition: { type: 'combo_max', target: 10 } },
  { id: 'plan_done', title: 'План выполнен', description: 'Выполнить месячный план', icon: '✅', xpReward: 500, condition: { type: 'plan_completed', target: 1 } },
  { id: 'plan_150', title: 'Перевыполнение', description: 'Перевыполнить план на 150%', icon: '🚀', xpReward: 1000, condition: { type: 'plan_overfulfilled', target: 150 } },
  { id: 'level_10', title: 'Десятый уровень', description: 'Достичь 10 уровня', icon: '🎯', xpReward: 1000, condition: { type: 'level_reached', target: 10 } },
];

export const COLLECTIONS: AchievementCollection[] = [
  { id: 'col_invoices', name: 'Счётовод', icon: '📄', achievementIds: ['inv_1', 'inv_5', 'inv_10', 'inv_25', 'inv_50', 'inv_100'], bonusXp: 2000 },
  { id: 'col_payments', name: 'Кассир', icon: '💰', achievementIds: ['pay_1', 'pay_5', 'pay_10', 'pay_25', 'pay_50'], bonusXp: 1500 },
  { id: 'col_clients', name: 'Нетворкер', icon: '🤝', achievementIds: ['cli_5', 'cli_10', 'cli_20', 'cli_50', 'cli_100'], bonusXp: 2000 },
  { id: 'col_revenue', name: 'Миллионер', icon: '💎', achievementIds: ['rev_50k', 'rev_100k', 'rev_500k', 'rev_1m', 'rev_5m'], bonusXp: 5000 },
  { id: 'col_streaks', name: 'На огне', icon: '🔥', achievementIds: ['str_3', 'str_7', 'str_14', 'str_30'], bonusXp: 1000 },
];

export const BOOST_ITEMS: BoostItem[] = [
  { id: 'coffee', name: '☕ Кофе-брейк', description: '15 минут отдыха заслужено!', icon: '☕', xpCost: 100, effect: 'rest' },
  { id: 'music', name: '🎵 Музыка на час', description: 'Слушай любимую музыку', icon: '🎵', xpCost: 50, effect: 'music' },
  { id: 'late_start', name: '😴 Поздний старт', description: 'Начни смену на 30 мин позже', icon: '😴', xpCost: 200, effect: 'late_start' },
  { id: 'early_finish', name: '🏃 Ранний уход', description: 'Закончи смену на 30 мин раньше', icon: '🏃', xpCost: 300, effect: 'early_finish' },
  { id: 'lunch_ext', name: '🍕 Длинный обед', description: 'Продли обед на 30 минут', icon: '🍕', xpCost: 150, effect: 'lunch' },
  { id: 'theme', name: '🎨 Кастом тема', description: 'Смени цвет интерфейса на день', icon: '🎨', xpCost: 75, effect: 'theme' },
  { id: 'xp_boost', name: '🚀 XP Буст x2', description: 'Двойной XP на 30 минут', icon: '🚀', xpCost: 250, effect: 'xp_boost' },
  { id: 'title', name: '🏷 Кастомный титул', description: 'Выбери свой титул', icon: '🏷', xpCost: 500, effect: 'title' },
];

export const MOTIVATIONAL_QUOTES = [
  'Каждый звонок — шаг к сделке.',
  'Сегодня ты можешь побить свой рекорд.',
  'Сильные продавцы делают больше попыток.',
  'Сделка начинается с первого контакта.',
  'Успех — это привычка действовать.',
  'Твоя следующая сделка уже ждёт.',
  'Настоящий результат — за пределами зоны комфорта.',
  'Каждое "нет" приближает к "да".',
  'Продажи — это марафон, а не спринт.',
  'Ты уже лучше, чем вчера.',
];

export const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'w1', type: 'plan_progress', position: 0, size: 'large', visible: true },
  { id: 'w2', type: 'sales_momentum', position: 1, size: 'medium', visible: true },
  { id: 'w3', type: 'daily_tasks', position: 2, size: 'medium', visible: true },
  { id: 'w4', type: 'invoices', position: 3, size: 'medium', visible: true },
  { id: 'w5', type: 'clients', position: 4, size: 'small', visible: true },
  { id: 'w6', type: 'work_days_left', position: 5, size: 'small', visible: true },
  { id: 'w7', type: 'shift_timer', position: 6, size: 'small', visible: true },
  { id: 'w8', type: 'xp_progress', position: 7, size: 'medium', visible: true },
  { id: 'w9', type: 'near_achievements', position: 8, size: 'medium', visible: true },
  { id: 'w10', type: 'sales_feed', position: 9, size: 'medium', visible: true },
  { id: 'w11', type: 'leaderboard', position: 10, size: 'medium', visible: false },
  { id: 'w12', type: 'motivation', position: 11, size: 'medium', visible: false },
  { id: 'w13', type: 'activity_heatmap', position: 12, size: 'large', visible: false },
  { id: 'w14', type: 'focus_session', position: 13, size: 'small', visible: false },
  { id: 'w15', type: 'unpaid_invoices', position: 14, size: 'medium', visible: false },
  { id: 'w16', type: 'personal_records', position: 15, size: 'medium', visible: false },
  { id: 'w17', type: 'skills', position: 16, size: 'medium', visible: false },
];

export const DEFAULT_LEADERBOARD = [
  { id: '1', name: 'Алексей М.', revenue: 520000, invoicesPaid: 23, level: 8, xp: 4200 },
  { id: '2', name: 'Мария К.', revenue: 480000, invoicesPaid: 19, level: 7, xp: 3800 },
  { id: '3', name: 'Дмитрий С.', revenue: 350000, invoicesPaid: 15, level: 6, xp: 2900 },
  { id: '4', name: 'Елена В.', revenue: 290000, invoicesPaid: 12, level: 5, xp: 2200 },
  { id: '5', name: 'Игорь Н.', revenue: 210000, invoicesPaid: 9, level: 4, xp: 1600 },
];
