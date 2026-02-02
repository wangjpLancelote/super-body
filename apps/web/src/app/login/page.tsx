'use client';

import React from 'react';
import { LoginForm } from '@/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <LoginForm />
    </div>
  );
}