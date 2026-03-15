import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Calendar, Trophy, BarChart3, ShoppingBag, Settings, Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices', icon: FileText, label: 'Счета' },
  { to: '/clients', icon: Users, label: 'Клиенты' },
  { to: '/calendar', icon: Calendar, label: 'Календарь' },
  { to: '/achievements', icon: Trophy, label: 'Достижения' },
  { to: '/leaderboard', icon: BarChart3, label: 'Лидерборд' },
  { to: '/shop', icon: ShoppingBag, label: 'Магазин' },
  { to: '/settings', icon: Settings, label: 'Настройки' },
];

export default function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useApp();
  const location = useLocation();

  const xpPercent = state.profile.xpToNextLevel > 0
    ? Math.min(100, (state.profile.xp / state.profile.xpToNextLevel) * 100)
    : 0;

  const sidebar = (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="font-display text-xl font-bold text-foreground">SalesForce</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Менеджер продаж</p>
      </div>

      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="level-badge text-xs">Ур. {state.profile.level}</div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">{state.profile.xp} / {state.profile.xpToNextLevel} XP</div>
            <div className="xp-bar">
              <div className="xp-bar-fill" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        {state.isAdmin && (
          <NavLink
            to="/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            <span>Админ-панель</span>
          </NavLink>
        )}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground">
          🔥 Серия: {state.profile.streakDays} дн.
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 h-screen sticky top-0 flex-shrink-0">
        {sidebar}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-md"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 z-50 shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1"
              >
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
