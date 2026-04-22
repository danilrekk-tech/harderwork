import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, Calendar, Trophy, BarChart3, ShoppingBag, Settings,
  Menu, X, LogOut, Zap, Target, Award, Brain, Crosshair, ListChecks, Medal, AlertTriangle,
  Backpack, Bell, ScrollText, UserCircle, Gavel, ClipboardList, Crown, CalendarRange,
  Package, Send, FileBarChart, BookOpen, Activity, ShoppingCart, Sparkles, Kanban, Gift, Disc3, Shield,
  PawPrint, Swords, MessageSquare, Heart, Lightbulb, Mic, TrendingUp, PhoneCall, MessageCircle, StickyNote, Timer, Megaphone, FileDown
} from 'lucide-react';
import NotificationsBell from '@/components/NotificationsBell';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

const managerNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Главное' },
  { to: '/ai-assistant', icon: Sparkles, label: 'AI-ассистент', section: 'AI & Продажи' },
  { to: '/funnel', icon: Kanban, label: 'Воронка сделок', section: 'AI & Продажи' },
  { to: '/clients', icon: Users, label: 'Клиенты', section: 'AI & Продажи' },
  { to: '/invoices', icon: FileText, label: 'Счета', section: 'AI & Продажи' },
  { to: '/calendar', icon: Calendar, label: 'Календарь', section: 'AI & Продажи' },
  { to: '/reminders', icon: Bell, label: 'Напоминания', section: 'AI & Продажи' },
  { to: '/my-analytics', icon: BarChart3, label: 'Моя аналитика', section: 'Прогресс' },
  { to: '/daily-tasks', icon: ListChecks, label: 'Задачи дня', section: 'Прогресс' },
  { to: '/focus', icon: Crosshair, label: 'Фокус-сессия', section: 'Прогресс' },
  { to: '/skills', icon: Brain, label: 'Навыки', section: 'Прогресс' },
  { to: '/records', icon: Medal, label: 'Рекорды', section: 'Прогресс' },
  { to: '/event-log', icon: ScrollText, label: 'Журнал действий', section: 'Прогресс' },
  { to: '/achievements', icon: Trophy, label: 'Достижения', section: 'Геймификация' },
  { to: '/mystery-box', icon: Gift, label: 'Mystery Box', section: 'Геймификация' },
  { to: '/fortune-wheel', icon: Disc3, label: 'Колесо удачи', section: 'Геймификация' },
  { to: '/leaderboard', icon: Crown, label: 'Лидерборд', section: 'Геймификация' },
  { to: '/view-contests', icon: Award, label: 'Конкурсы', section: 'Геймификация' },
  { to: '/view-activities', icon: Target, label: 'Активности', section: 'Геймификация' },
  { to: '/shop', icon: ShoppingBag, label: 'Магазин', section: 'Геймификация' },
  { to: '/inventory', icon: Backpack, label: 'Инвентарь', section: 'Геймификация' },
  { to: '/quests', icon: ScrollText, label: 'Квесты', section: 'Геймификация+' },
  { to: '/daily-reward', icon: Gift, label: 'Ежедневный бонус', section: 'Геймификация+' },
  { to: '/pet', icon: PawPrint, label: 'Питомец', section: 'Геймификация+' },
  { to: '/duels', icon: Swords, label: 'Дуэли', section: 'Геймификация+' },
  { to: '/leagues', icon: Trophy, label: 'Лиги', section: 'Геймификация+' },
  { to: '/season-pass', icon: Crown, label: 'Сезонный пропуск', section: 'Геймификация+' },
  { to: '/lead-scoring', icon: Target, label: 'AI-скоринг лидов', section: 'AI Pro' },
  { to: '/ai-coach', icon: Sparkles, label: 'AI-коуч', section: 'AI Pro' },
  { to: '/voice-notes', icon: Mic, label: 'Голосовые заметки', section: 'AI Pro' },
  { to: '/call-analyzer', icon: PhoneCall, label: 'AI-разбор звонков', section: 'AI Pro' },
  { to: '/team-chat', icon: MessageSquare, label: 'Чат команды', section: 'Команда' },
  { to: '/kudos', icon: Heart, label: 'Kudos', section: 'Команда' },
  { to: '/ideas', icon: Lightbulb, label: 'Идеи', section: 'Команда' },
  { to: '/polls', icon: BarChart3, label: 'Опросы', section: 'Команда' },
  { to: '/okr', icon: Target, label: 'OKR', section: 'Команда' },
  { to: '/templates', icon: MessageCircle, label: 'Шаблоны сообщений', section: 'Продуктивность' },
  { to: '/sticky-notes', icon: StickyNote, label: 'Стикеры', section: 'Продуктивность' },
  { to: '/checklists', icon: ListChecks, label: 'Чек-листы', section: 'Продуктивность' },
  { to: '/pomodoro', icon: Timer, label: 'Pomodoro Pro', section: 'Продуктивность' },
  { to: '/call-timer', icon: PhoneCall, label: 'Таймер звонков', section: 'Продуктивность' },
  { to: '/my-penalties', icon: AlertTriangle, label: 'Мои штрафы', section: 'Прочее' },
  { to: '/profile', icon: UserCircle, label: 'Профиль', section: 'Прочее' },
  { to: '/settings', icon: Settings, label: 'Настройки', section: 'Прочее' },
];

const leaderNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Главное' },
  { to: '/ai-insights', icon: Brain, label: 'AI-инсайты', section: 'AI & Аналитика' },
  { to: '/analytics', icon: BarChart3, label: 'Аналитика', section: 'AI & Аналитика' },
  { to: '/reports', icon: FileBarChart, label: 'Отчёты', section: 'AI & Аналитика' },
  { to: '/managers', icon: Users, label: 'Менеджеры', section: 'Команда' },
  { to: '/team-kpi', icon: Target, label: 'KPI менеджеров', section: 'Команда' },
  { to: '/team-plan', icon: ClipboardList, label: 'План команды', section: 'Команда' },
  { to: '/team-leaderboard', icon: Crown, label: 'Лидерборд', section: 'Команда' },
  { to: '/discipline', icon: Activity, label: 'Дисциплина', section: 'Команда' },
  { to: '/team-activity', icon: ScrollText, label: 'Лента активности', section: 'Команда' },
  { to: '/automation', icon: Zap, label: 'Автоматизация', section: 'Управление' },
  { to: '/penalties-management', icon: Gavel, label: 'Штрафы', section: 'Управление' },
  { to: '/all-invoices', icon: FileText, label: 'Все счета', section: 'Данные' },
  { to: '/all-clients', icon: Users, label: 'Все клиенты', section: 'Данные' },
  { to: '/contests', icon: Trophy, label: 'Конкурсы', section: 'Контент' },
  { to: '/activities', icon: Target, label: 'Активности', section: 'Контент' },
  { to: '/manage-achievements', icon: Award, label: 'Достижения', section: 'Контент' },
  { to: '/collections', icon: Package, label: 'Коллекции', section: 'Контент' },
  { to: '/seasons', icon: CalendarRange, label: 'Сезоны', section: 'Контент' },
  { to: '/manage-boosts', icon: Zap, label: 'Настройки магазина', section: 'Контент' },
  { to: '/shop-analytics', icon: ShoppingCart, label: 'Аналитика магазина', section: 'Контент' },
  { to: '/forecast', icon: TrendingUp, label: 'Прогноз выручки', section: 'AI & Аналитика' },
  { to: '/quests', icon: ScrollText, label: 'Квесты', section: 'Геймификация+' },
  { to: '/leagues', icon: Trophy, label: 'Лиги', section: 'Геймификация+' },
  { to: '/team-chat', icon: MessageSquare, label: 'Чат команды', section: 'Команда' },
  { to: '/kudos', icon: Heart, label: 'Kudos', section: 'Команда' },
  { to: '/ideas', icon: Lightbulb, label: 'Идеи', section: 'Команда' },
  { to: '/polls', icon: BarChart3, label: 'Опросы', section: 'Команда' },
  { to: '/okr', icon: Target, label: 'OKR', section: 'Команда' },
  { to: '/broadcasts', icon: Megaphone, label: 'Рассылки', section: 'Управление' },
  { to: '/reports-export', icon: FileDown, label: 'Экспорт отчётов', section: 'Управление' },
  { to: '/admin', icon: Shield, label: 'Админ-панель', section: 'Система' },
  { to: '/settings', icon: Settings, label: 'Настройки', section: 'Система' },
];

export default function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useApp();
  const { role, signOut, profileName } = useAuth();

  const navItems = role === 'leader' ? leaderNavItems : managerNavItems;

  const xpPercent = state.profile.xpToNextLevel > 0
    ? Math.min(100, (state.profile.xp / state.profile.xpToNextLevel) * 100)
    : 0;

  const displayName = profileName || state.profile.name || (role === 'leader' ? 'Руководитель' : 'Менеджер');
  const roleLabel = role === 'leader' ? '🛡️ Руководитель' : '📊 Менеджер продаж';

  const sidebar = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">MegaGroup Team</h1>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground truncate">{displayName}</div>
            <div className="text-xs text-muted-foreground">{roleLabel}</div>
          </div>
        </div>

        {role !== 'leader' && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="level-badge text-xs">Ур. {state.profile.level}</span>
              <span className="text-xs text-muted-foreground flex-1 text-right">{state.profile.xp} / {state.profile.xpToNextLevel} XP</span>
            </div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
            </div>
            {state.profile.streakDays > 0 && (
              <div className="text-xs text-muted-foreground mt-1.5">
                🔥 Серия: {state.profile.streakDays} дн.
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item, idx) => {
          const prevSection = idx > 0 ? (navItems[idx - 1] as any).section : null;
          const showHeader = (item as any).section && (item as any).section !== prevSection;
          return (
            <div key={item.to}>
              {showHeader && (
                <div className="section-label px-3 pt-3 pb-1.5">{(item as any).section}</div>
              )}
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" /> Выйти
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebar}
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 glass border-b border-border flex items-center px-4">
        <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-foreground ml-2 flex-1">MegaGroup Team</span>
        <NotificationsBell />
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-xl"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1 z-10">
                <X className="w-5 h-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
