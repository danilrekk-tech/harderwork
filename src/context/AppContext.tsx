import React, { createContext, useContext } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/contexts/AuthContext';

type AppStoreReturn = ReturnType<typeof useAppStore>;

const AppContext = createContext<AppStoreReturn | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, role, profileName } = useAuth();
  const store = useAppStore(user?.id, role, profileName);
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
