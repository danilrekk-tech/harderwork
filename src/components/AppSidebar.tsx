import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import NotificationsBell from '@/components/NotificationsBell';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getSidebarItemsForRole } from '@/config/routes';

export default function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { state } = useApp();
  const { role, signOut, profileName } = useAuth();

  // Auto-synced from src/config/routes.tsx — adding a route there shows it here automatically.
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'Главное' },
    ...getSidebarItemsForRole(role).map((r) => ({
      to: r.path,
      icon: r.icon!,
      label: r.label!,
      section: r.section || 'Прочее',
    })),
  ];

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
