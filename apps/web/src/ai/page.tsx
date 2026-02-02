'use client';

import { useState, useEffect, useRef } from 'react';
import { AIAssistant } from '@/ai/components/AIAssistant';
import { useAuth } from '@/auth/AuthContext';
import { Unauthorized } from '@/app/unauthorized/page';

export default function AIAssistantPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!mounted || !user) {
    return null;
  }

  // Check user permissions - assuming admin and member roles have access
  const hasAccess = user.role === 'admin' || user.role === 'member';

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return <AIAssistant />;
}