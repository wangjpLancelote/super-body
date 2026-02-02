'use client';

import React, { useState } from 'react';
import { useAuth } from '@/auth/hooks/useAuth';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className={cn(
        'flex-1 transition-all duration-300',
        sidebarOpen ? 'md:ml-64' : 'md:ml-0'
      )}>
        {/* Mobile Bottom Navigation */}
        <BottomNav
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Page Content */}
        <main className="min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}