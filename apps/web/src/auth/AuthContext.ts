import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type Role = 'user' | 'premium' | 'admin';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);