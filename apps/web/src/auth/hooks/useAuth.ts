'use client';

import { useAuth } from '../AuthProvider';

export function useAuthHook() {
  return useAuth();
}