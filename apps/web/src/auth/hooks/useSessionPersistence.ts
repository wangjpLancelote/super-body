'use client';

import { useEffect } from 'react';
import { useAuth } from './useAuth';

const SESSION_STORAGE_KEY = 'supabase.auth.token';

export function useSessionPersistence() {
  const { session } = useAuth();

  useEffect(() => {
    // Save session to localStorage for persistence
    if (session) {
      const tokenData = {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        provider_token: session.provider_token,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(tokenData));
    } else {
      // Clear session when logging out
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [session]);

  // Initialize session from localStorage on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem(SESSION_STORAGE_KEY);
    if (storedToken) {
      try {
        const tokenData = JSON.parse(storedToken);
        // You can use this to restore session if needed
        console.log('Stored session found:', tokenData);
      } catch (error) {
        console.error('Error parsing stored session:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);
}

// Helper function to clear all session data
export function clearSessionPersistence() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}