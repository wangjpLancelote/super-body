'use client';

import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase';

export function useSessionPersistence() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Handle storage events to sync auth state across tabs
    const handleStorage = (event: StorageEvent) => {
      if (event.key === '__supabase.auth.token') {
        // Force a refresh of the session
        supabase.auth.refreshSession();
      }
    };

    window.addEventListener('storage', handleStorage);

    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);
}