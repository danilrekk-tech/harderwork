import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

type UserRole = 'leader' | 'manager' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  loading: boolean;
  roleReady: boolean;
  profileName: string;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, inviteCode?: string) => Promise<{ error: string | null }>;
  signUpAsLeader: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [roleReady, setRoleReady] = useState(false);
  const [profileName, setProfileName] = useState('');
  const currentUserIdRef = useRef<string | null>(null);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) {
        console.error('[Auth] fetchRole error:', error.message);
      }
      // Guard against race conditions when user changes
      if (currentUserIdRef.current !== userId) return;
      setRole((data?.role as UserRole) || null);
    } catch (e) {
      console.error('[Auth] fetchRole exception:', e);
      if (currentUserIdRef.current === userId) setRole(null);
    } finally {
      if (currentUserIdRef.current === userId) setRoleReady(true);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', userId)
        .maybeSingle();
      if (currentUserIdRef.current !== userId) return;
      setProfileName(data?.name || '');
    } catch (e) {
      console.error('[Auth] fetchProfile exception:', e);
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (currentUserIdRef.current) {
      setRoleReady(false);
      await fetchRole(currentUserIdRef.current);
    }
  }, [fetchRole]);

  useEffect(() => {
    let initialized = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      const uid = newSession?.user?.id ?? null;
      currentUserIdRef.current = uid;

      if (uid) {
        setRoleReady(false);
        // Defer to avoid Supabase deadlock
        setTimeout(() => {
          fetchRole(uid);
          fetchProfile(uid);
        }, 0);
      } else {
        setRole(null);
        setProfileName('');
        setRoleReady(true);
      }
      if (initialized) setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: initial } }) => {
      initialized = true;
      setSession(initial);
      setUser(initial?.user ?? null);
      const uid = initial?.user?.id ?? null;
      currentUserIdRef.current = uid;
      if (uid) {
        fetchRole(uid);
        fetchProfile(uid);
      } else {
        setRoleReady(true);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchRole, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        return { error: 'Неверный email или пароль' };
      }
      if (msg.includes('email not confirmed')) {
        return { error: 'Email не подтверждён. Проверьте почту.' };
      }
      return { error: error.message };
    }
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string, inviteCode?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (inviteCode) {
      const { data: invite } = await supabase
        .from('invites')
        .select('id')
        .eq('code', inviteCode)
        .is('used_by', null)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      if (!invite) return { error: 'Недействительный или истёкший код приглашения' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return { error: 'Этот email уже зарегистрирован' };
      }
      return { error: error.message };
    }

    if (inviteCode && data.user) {
      await supabase.rpc('use_invite', { _code: inviteCode, _user_id: data.user.id });
    }
    return { error: null };
  }, []);

  const signUpAsLeader = useCallback(async (email: string, password: string, name: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('already registered') || msg.includes('already exists')) {
        return { error: 'Этот email уже зарегистрирован' };
      }
      return { error: error.message };
    }

    if (data.user) {
      // Триггер handle_new_user уже назначает роль leader первому пользователю.
      // Здесь страхуемся для последующих регистраций "как руководитель".
      const { data: existing } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id);
      const hasLeader = (existing ?? []).some((r: any) => r.role === 'leader');
      if (!hasLeader) {
        const { error: roleErr } = await supabase
          .from('user_roles')
          .insert({ user_id: data.user.id, role: 'leader' as 'leader' });
        if (roleErr && roleErr.code !== '23505') {
          console.error('[Auth] failed to assign leader role:', roleErr);
          return { error: 'Аккаунт создан, но не удалось назначить роль руководителя. Обратитесь в поддержку.' };
        }
      }
    }
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setRole(null);
    setProfileName('');
    setRoleReady(true);
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, role, loading, roleReady, profileName, signIn, signUp, signUpAsLeader, signOut, refreshRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
