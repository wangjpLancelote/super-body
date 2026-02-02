'use client';

import React from 'react';
import { AuthGuard } from './AuthGuard';
import { useAuthHook } from '../hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'premium' | 'admin';
}

export function RequireAuth({ children, requiredRole = 'user' }: RequireAuthProps) {
  const { loading } = useAuthHook();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole={requiredRole}>
      {children}
    </AuthGuard>
  );
}