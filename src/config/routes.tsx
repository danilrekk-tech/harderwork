import { lazy, ComponentType, LazyExoticComponent } from 'react';
import {
  LayoutDashboard, FileText, Users, Calendar, Trophy, BarChart3, ShoppingBag, Settings,
  Zap, Target, Award, Brain, Crosshair, ListChecks, Medal, AlertTriangle,
  Backpack, Bell, ScrollText, UserCircle, Gavel, ClipboardList, Crown, CalendarRange,
  Package, FileBarChart, BookOpen, Activity, ShoppingCart, Sparkles, Kanban, Gift, Disc3, Shield,
  PawPrint, Swords, MessageSquare, Heart, Lightbulb, Mic, TrendingUp, PhoneCall, MessageCircle,
  StickyNote, Timer, Megaphone, FileDown, LucideIcon
} from 'lucide-react';

// Centralised access roles
export type RouteAccess = 'manager' | 'leader' | 'shared';

export interface AppRoute {
  path: string;
  // Pages are lazy-loaded so registering one new page requires only one record here.
  Component: LazyExoticComponent<ComponentType<unknown>>;
  // Sidebar metadata. Omit `label` to skip the sidebar entry (e.g. detail-only routes).
  label?: string;
  icon?: LucideIcon;
  // Section the link belongs to in the sidebar.
  section?: string;
  // Who is allowed to see and access the route.
  access: RouteAccess;
  // Hide from sidebar but keep route registered.
  hidden?: boolean;
}

// One record per page – sidebar + router stay in sync automatically.
export const APP_ROUTES: AppRoute[] = [
  // ───────── Shared root ─────────
  { path: '/', Component: lazy(() => import('@/pages/DashboardPage')), label: 'Dashboard', icon: LayoutDashboard, section: 'Главное', access: 'shared', hidden: true },

  // ───────── Manager routes ─────────
  { path: '/ai-assistant', Component: lazy(() => import('@/pages/AIAssistantPage')), label: 'AI-ассистент', icon: Sparkles, section: 'AI & Продажи', access: 'manager' },
  { path: '/funnel', Component: lazy(() => import('@/pages/DealFunnelPage')), label: 'Воронка сделок', icon: Kanban, section: 'AI & Продажи', access: 'manager' },
  { path: '/clients', Component: lazy(() => import('@/pages/ClientsPage')), label: 'Клиенты', icon: Users, section: 'AI & Продажи', access: 'manager' },
  { path: '/invoices', Component: lazy(() => import('@/pages/InvoicesPage')), label: 'Счета', icon: FileText, section: 'AI & Продажи', access: 'manager' },
  { path: '/calendar', Component: lazy(() => import('@/pages/CalendarPage')), label: 'Календарь', icon: Calendar, section: 'AI & Продажи', access: 'manager' },
  { path: '/reminders', Component: lazy(() => import('@/pages/RemindersPage')), label: 'Напоминания', icon: Bell, section: 'AI & Продажи', access: 'manager' },
  { path: '/my-analytics', Component: lazy(() => import('@/pages/MyAnalyticsPage')), label: 'Моя аналитика', icon: BarChart3, section: 'Прогресс', access: 'manager' },
  { path: '/daily-tasks', Component: lazy(() => import('@/pages/DailyTasksPage')), label: 'Задачи дня', icon: ListChecks, section: 'Прогресс', access: 'manager' },
  { path: '/focus', Component: lazy(() => import('@/pages/FocusPage')), label: 'Фокус-сессия', icon: Crosshair, section: 'Прогресс', access: 'manager' },
  { path: '/skills', Component: lazy(() => import('@/pages/SkillsPage')), label: 'Навыки', icon: Brain, section: 'Прогресс', access: 'manager' },
  { path: '/records', Component: lazy(() => import('@/pages/RecordsPage')), label: 'Рекорды', icon: Medal, section: 'Прогресс', access: 'manager' },
  { path: '/event-log', Component: lazy(() => import('@/pages/EventLogPage')), label: 'Журнал действий', icon: ScrollText, section: 'Прогресс', access: 'manager' },
  { path: '/achievements', Component: lazy(() => import('@/pages/AchievementsPage')), label: 'Достижения', icon: Trophy, section: 'Геймификация', access: 'manager' },
  { path: '/mystery-box', Component: lazy(() => import('@/pages/MysteryBoxPage')), label: 'Mystery Box', icon: Gift, section: 'Геймификация', access: 'manager' },
  { path: '/fortune-wheel', Component: lazy(() => import('@/pages/FortuneWheelPage')), label: 'Колесо удачи', icon: Disc3, section: 'Геймификация', access: 'manager' },
  { path: '/leaderboard', Component: lazy(() => import('@/pages/LeaderboardPage')), label: 'Лидерборд', icon: Crown, section: 'Геймификация', access: 'manager' },
  { path: '/view-contests', Component: lazy(() => import('@/pages/ViewContestsPage')), label: 'Конкурсы', icon: Award, section: 'Геймификация', access: 'manager' },
  { path: '/view-activities', Component: lazy(() => import('@/pages/ViewActivitiesPage')), label: 'Активности', icon: Target, section: 'Геймификация', access: 'manager' },
  { path: '/shop', Component: lazy(() => import('@/pages/ShopPage')), label: 'Магазин', icon: ShoppingBag, section: 'Геймификация', access: 'manager' },
  { path: '/inventory', Component: lazy(() => import('@/pages/InventoryPage')), label: 'Инвентарь', icon: Backpack, section: 'Геймификация', access: 'manager' },
  { path: '/daily-reward', Component: lazy(() => import('@/pages/DailyRewardPage')), label: 'Ежедневный бонус', icon: Gift, section: 'Геймификация+', access: 'manager' },
  { path: '/pet', Component: lazy(() => import('@/pages/PetPage')), label: 'Питомец', icon: PawPrint, section: 'Геймификация+', access: 'manager' },
  { path: '/duels', Component: lazy(() => import('@/pages/DuelsPage')), label: 'Дуэли', icon: Swords, section: 'Геймификация+', access: 'manager' },
  { path: '/season-pass', Component: lazy(() => import('@/pages/SeasonPassPage')), label: 'Сезонный пропуск', icon: Crown, section: 'Геймификация+', access: 'manager' },
  { path: '/lead-scoring', Component: lazy(() => import('@/pages/LeadScoringPage')), label: 'AI-скоринг лидов', icon: Target, section: 'AI Pro', access: 'manager' },
  { path: '/ai-coach', Component: lazy(() => import('@/pages/AICoachPage')), label: 'AI-коуч', icon: Sparkles, section: 'AI Pro', access: 'manager' },
  { path: '/voice-notes', Component: lazy(() => import('@/pages/VoiceNotesPage')), label: 'Голосовые заметки', icon: Mic, section: 'AI Pro', access: 'manager' },
  { path: '/call-analyzer', Component: lazy(() => import('@/pages/CallAnalyzerPage')), label: 'AI-разбор звонков', icon: PhoneCall, section: 'AI Pro', access: 'manager' },
  { path: '/templates', Component: lazy(() => import('@/pages/MessageTemplatesPage')), label: 'Шаблоны сообщений', icon: MessageCircle, section: 'Продуктивность', access: 'manager' },
  { path: '/sticky-notes', Component: lazy(() => import('@/pages/StickyNotesPage')), label: 'Стикеры', icon: StickyNote, section: 'Продуктивность', access: 'manager' },
  { path: '/checklists', Component: lazy(() => import('@/pages/ChecklistsPage')), label: 'Чек-листы', icon: ListChecks, section: 'Продуктивность', access: 'manager' },
  { path: '/pomodoro', Component: lazy(() => import('@/pages/PomodoroProPage')), label: 'Pomodoro Pro', icon: Timer, section: 'Продуктивность', access: 'manager' },
  { path: '/call-timer', Component: lazy(() => import('@/pages/CallTimerPage')), label: 'Таймер звонков', icon: PhoneCall, section: 'Продуктивность', access: 'manager' },
  { path: '/my-penalties', Component: lazy(() => import('@/pages/MyPenaltiesPage')), label: 'Мои штрафы', icon: AlertTriangle, section: 'Прочее', access: 'manager' },
  { path: '/profile', Component: lazy(() => import('@/pages/ProfilePage')), label: 'Профиль', icon: UserCircle, section: 'Прочее', access: 'manager' },

  // ───────── Leader routes ─────────
  { path: '/ai-insights', Component: lazy(() => import('@/pages/AIInsightsPage')), label: 'AI-инсайты', icon: Brain, section: 'AI & Аналитика', access: 'leader' },
  { path: '/analytics', Component: lazy(() => import('@/pages/AnalyticsPage')), label: 'Аналитика', icon: BarChart3, section: 'AI & Аналитика', access: 'leader' },
  { path: '/reports', Component: lazy(() => import('@/pages/ReportsPage')), label: 'Отчёты', icon: FileBarChart, section: 'AI & Аналитика', access: 'leader' },
  { path: '/forecast', Component: lazy(() => import('@/pages/ForecastPage')), label: 'Прогноз выручки', icon: TrendingUp, section: 'AI & Аналитика', access: 'leader' },
  { path: '/managers', Component: lazy(() => import('@/pages/ManagersPage')), label: 'Менеджеры', icon: Users, section: 'Команда', access: 'leader' },
  { path: '/team-kpi', Component: lazy(() => import('@/pages/TeamKPIPage')), label: 'KPI менеджеров', icon: Target, section: 'Команда', access: 'leader' },
  { path: '/team-plan', Component: lazy(() => import('@/pages/TeamPlanPage')), label: 'План команды', icon: ClipboardList, section: 'Команда', access: 'leader' },
  { path: '/team-leaderboard', Component: lazy(() => import('@/pages/TeamLeaderboardPage')), label: 'Лидерборд', icon: Crown, section: 'Команда', access: 'leader' },
  { path: '/discipline', Component: lazy(() => import('@/pages/DisciplinePage')), label: 'Дисциплина', icon: Activity, section: 'Команда', access: 'leader' },
  { path: '/team-activity', Component: lazy(() => import('@/pages/TeamActivityPage')), label: 'Лента активности', icon: ScrollText, section: 'Команда', access: 'leader' },
  { path: '/automation', Component: lazy(() => import('@/pages/AutomationPage')), label: 'Автоматизация', icon: Zap, section: 'Управление', access: 'leader' },
  { path: '/penalties-management', Component: lazy(() => import('@/pages/PenaltiesManagementPage')), label: 'Штрафы', icon: Gavel, section: 'Управление', access: 'leader' },
  { path: '/broadcasts', Component: lazy(() => import('@/pages/BroadcastsPage')), label: 'Рассылки', icon: Megaphone, section: 'Управление', access: 'leader' },
  { path: '/reports-export', Component: lazy(() => import('@/pages/ReportsExportPage')), label: 'Экспорт отчётов', icon: FileDown, section: 'Управление', access: 'leader' },
  { path: '/all-invoices', Component: lazy(() => import('@/pages/AllInvoicesPage')), label: 'Все счета', icon: FileText, section: 'Данные', access: 'leader' },
  { path: '/all-clients', Component: lazy(() => import('@/pages/AllClientsPage')), label: 'Все клиенты', icon: Users, section: 'Данные', access: 'leader' },
  { path: '/contests', Component: lazy(() => import('@/pages/ContestsPage')), label: 'Конкурсы', icon: Trophy, section: 'Контент', access: 'leader' },
  { path: '/activities', Component: lazy(() => import('@/pages/ActivitiesPage')), label: 'Активности', icon: Target, section: 'Контент', access: 'leader' },
  { path: '/manage-achievements', Component: lazy(() => import('@/pages/ManageAchievementsPage')), label: 'Достижения', icon: Award, section: 'Контент', access: 'leader' },
  { path: '/collections', Component: lazy(() => import('@/pages/CollectionsPage')), label: 'Коллекции', icon: Package, section: 'Контент' , access: 'leader' },
  { path: '/seasons', Component: lazy(() => import('@/pages/SeasonsPage')), label: 'Сезоны', icon: CalendarRange, section: 'Контент', access: 'leader' },
  { path: '/manage-boosts', Component: lazy(() => import('@/pages/ManageBoostsPage')), label: 'Настройки магазина', icon: Zap, section: 'Контент', access: 'leader' },
  { path: '/shop-analytics', Component: lazy(() => import('@/pages/ShopAnalyticsPage')), label: 'Аналитика магазина', icon: ShoppingCart, section: 'Контент', access: 'leader' },
  { path: '/admin', Component: lazy(() => import('@/pages/AdminPage')), label: 'Админ-панель', icon: Shield, section: 'Система', access: 'leader' },
  { path: '/invites', Component: lazy(() => import('@/pages/InvitesPage')), label: 'Инвайты', icon: Bell, section: 'Система', access: 'leader' },

  // ───────── Shared (visible to both roles) ─────────
  { path: '/quests', Component: lazy(() => import('@/pages/QuestsPage')), label: 'Квесты', icon: ScrollText, section: 'Геймификация+', access: 'shared' },
  { path: '/leagues', Component: lazy(() => import('@/pages/LeaguesPage')), label: 'Лиги', icon: Trophy, section: 'Геймификация+', access: 'shared' },
  { path: '/team-chat', Component: lazy(() => import('@/pages/TeamChatPage')), label: 'Чат команды', icon: MessageSquare, section: 'Команда', access: 'shared' },
  { path: '/kudos', Component: lazy(() => import('@/pages/KudosPage')), label: 'Kudos', icon: Heart, section: 'Команда', access: 'shared' },
  { path: '/ideas', Component: lazy(() => import('@/pages/IdeasPage')), label: 'Идеи', icon: Lightbulb, section: 'Команда', access: 'shared' },
  { path: '/polls', Component: lazy(() => import('@/pages/PollsPage')), label: 'Опросы', icon: BarChart3, section: 'Команда', access: 'shared' },
  { path: '/okr', Component: lazy(() => import('@/pages/OKRPage')), label: 'OKR', icon: Target, section: 'Команда', access: 'shared' },
  { path: '/knowledge', Component: lazy(() => import('@/pages/KnowledgeBasePage')), label: 'База знаний', icon: BookOpen, section: 'Прочее', access: 'shared' },
  { path: '/settings', Component: lazy(() => import('@/pages/SettingsPage')), label: 'Настройки', icon: Settings, section: 'Прочее', access: 'shared' },
];

export function getRoutesForRole(role: 'leader' | 'manager' | null): AppRoute[] {
  if (!role) return APP_ROUTES.filter((r) => r.access === 'shared');
  return APP_ROUTES.filter((r) => r.access === 'shared' || r.access === role);
}

export function getSidebarItemsForRole(role: 'leader' | 'manager' | null): AppRoute[] {
  return getRoutesForRole(role).filter((r) => !r.hidden && r.label && r.icon);
}
