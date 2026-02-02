'use client';

import React, { useState } from 'react';
import { Home, List, FileText, Bot, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  { title: 'Todos', href: '/todos', icon: List, badge: '12' },
  { title: 'Files', href: '/files', icon: FileText, badge: '24' },
  { title: 'AI', href: '/ai-assistant', icon: Bot, badge: 'New' },
  { title: 'Settings', href: '/settings', icon: Settings },
];

interface BottomNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BottomNav({ isOpen, onClose }: BottomNavProps) {
  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Bottom Navigation Panel */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out',
          'h-16',
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'
        )}
      >
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} onClose={onClose} />
          ))}
        </div>
      </div>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
  onClose: () => void;
}

function NavItemComponent({ item, onClose }: NavItemComponentProps) {
  return (
    <a
      href={item.href}
      onClick={(e) => {
        e.preventDefault();
        // In a real app, you would handle navigation here
        onClose();
      }}
      className={cn(
        'flex flex-col items-center justify-center flex-1 h-full py-2 text-xs font-medium transition-colors duration-200',
        'hover:text-blue-600',
        'focus:outline-none focus:text-blue-600'
      )}
    >
      <div className="relative mb-1">
        <item.icon className="h-5 w-5 text-gray-600" />
        {item.badge && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {item.badge === 'New' ? '!' : item.badge}
          </span>
        )}
      </div>
      <span className="text-gray-600">{item.title}</span>
    </a>
  );
}