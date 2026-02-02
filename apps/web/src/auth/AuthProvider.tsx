'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../lib/supabase';
import type { Role } from './AuthContext';
import { AuthContext, AuthContextValue } from './AuthContext';
import { useSessionPersistence } from './useSessionPersistence';

async function fetchUserRole(userId: string, supabaseClient: any): Promise<Role> {
  const { data, error } = await supabaseClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data?.role) {
    return 'user';
  }

  return data.role as Role;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>('user');
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseBrowserClient();

  // Set up session persistence
  useSessionPersistence();

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(data.session);
        setUser(data.session?.user ?? null);

        if (data.session?.user) {
          const nextRole = await fetchUserRole(data.session.user.id, supabase);
          setRole(nextRole);
        } else {
          setRole('user');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);

        if (nextSession?.user) {
          const nextRole = await fetchUserRole(nextSession.user.id, supabase);
          setRole(nextRole);
        } else {
          setRole('user');
        }
      },
    );

    return () => {
      isMounted = false;
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      role,
      loading,
      signInWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return error?.message || null;
      },
      signUpWithEmail: async (email, password) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        // If user already exists, it's not an error for login
        if (error?.message?.includes('already registered')) {
          return null;
        }
        return error?.message || null;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, user, role, loading, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}