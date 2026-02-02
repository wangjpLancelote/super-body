'use client';

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { clearSessionPersistence } from '../hooks/useSessionPersistence';
import { LogOut, User, Crown } from 'lucide-react';

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className = '' }: LogoutButtonProps) {
  const { user, signOut, role } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      clearSessionPersistence();
      // Redirect after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        {getRoleIcon()}
        <span>{user?.email}</span>
        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
          {role}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </div>
  );
}