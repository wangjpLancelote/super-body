'use client';

import React from 'react';
import { Home, List, FileText, Bot, Settings, X, Plus } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/lib/ui/sheet';
import { cn } from '@/lib/utils';

interface MobileMenuProps {
  children: React.ReactNode;
}

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
  { title: 'AI Assistant', href: '/ai-assistant', icon: Bot, badge: 'New' },
  { title: 'Settings', href: '/settings', icon: Settings },
];

export function MobileMenu({ children }: MobileMenuProps) {
  return (
    <div className="flex items-center">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Plus className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0">
          <MobileMenuContent />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MobileMenuContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">LifeByte</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-1">
          {navItems.map((item) => (
            <MobileMenuItem key={item.href} item={item} />
          ))}
        </div>

        {/* Divider */}
        <div className="px-4 py-3 border-t border-gray-200">
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Profile
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      {/* Bottom Quick Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" size="sm" className="h-9">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MobileMenuItemProps {
  item: NavItem;
}

function MobileMenuItem({ item }: MobileMenuItemProps) {
  return (
    <a
      href={item.href}
      className={cn(
        'flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
        'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
      )}
    >
      <div className="flex items-center">
        <item.icon className="mr-3 h-5 w-5 text-gray-400" />
        <span>{item.title}</span>
      </div>
      {item.badge && (
        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
          {item.badge === 'New' ? 'New' : item.badge}
        </span>
      )}
    </a>
  );
}