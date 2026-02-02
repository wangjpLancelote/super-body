import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/api';

// Browser-side Supabase client (for web)
export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    // Global configuration for all operations
    global: {
      headers: {
        'X-Client-Info': 'super-body-web',
      },
    },
  });
}

// Server-side Supabase client (for SSR, edge functions, etc.)
export function createSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    // Use service role key for server-side operations
    global: {
      headers: {
        'X-Client-Info': 'super-body-server',
        'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      },
    },
  });
}

// Supabase client component for React Server Components
export function createServerComponentClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'super-body-server-component',
      },
    },
  });
}

// Singleton instance for browser usage (client-side)
let browserClient: ReturnType<typeof createSupabaseClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createSupabaseClient();
  }
  return browserClient;
}

// Utility function to get the appropriate client based on environment
export function getSupabaseClient() {
  if (typeof window === 'undefined') {
    // Server-side
    return createServerComponentClient();
  }
  // Client-side
  return getSupabaseBrowserClient();
}

// Type for Supabase client with Database type
export type SupabaseClient = ReturnType<typeof createSupabaseClient>;