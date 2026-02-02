'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'premium' | 'admin';
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole = 'user',
  redirectTo = '/login'
}: AuthGuardProps) {
  const { loading, session, role } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading && !isClient) return;

    if (loading) return;

    if (!session) {
      router.push(redirectTo);
      return;
    }

    // Check role requirements
    const roleHierarchy = {
      user: 1,
      premium: 2,
      admin: 3
    };

    if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
      router.push('/unauthorized');
      return;
    }
  }, [loading, session, role, router, requiredRole, redirectTo, isClient]);

  // Show loading state while checking authentication
  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render children if not authenticated (redirecting)
  if (!session) {
    return null;
  }

  return <>{children}</>;
}