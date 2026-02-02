import { Session, User } from '@supabase/supabase-js';

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

export interface AuthState {
  session: Session | null;
  user: User | null;
  role: Role;
  loading: boolean;
}

export interface AuthError {
  message: string;
  code?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword: string;
}