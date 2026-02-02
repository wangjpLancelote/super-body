'use client';

import React from 'react';
import { Home, List, FileText, Bot, Settings, LogOut, ChevronDown, ChevronRight, X } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { Badge } from '@/lib/ui/badge';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Todos',
    href: '/todos',
    icon: List,
    badge: '12',
  },
  {
    title: 'Files',
    href: '/files',
    icon: FileText,
    badge: '24',
  },
  {
    title: 'AI Assistant',
    href: '/ai-assistant',
    icon: Bot,
    badge: 'New',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none',
          'h-full',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="ml-2 text-lg font-semibold text-gray-900">LifeByte</h2>
            </div>

            {/* Close Button (Mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItemComponent key={item.href} item={item} />
            ))}
          </nav>

          {/* User Info (Bottom) */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  U
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">User</p>
                  <p className="text-xs text-gray-500">Free Plan</p>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface NavItemComponentProps {
  item: NavItem;
}

function NavItemComponent({ item }: NavItemComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <a
        href={item.href}
        className={cn(
          'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
          'hover:bg-gray-100 hover:text-gray-900',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
        )}
      >
        <div className="flex items-center">
          <item.icon className="mr-3 h-5 w-5 text-gray-400" />
          <span>{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {item.badge}
            </Badge>
          )}
        </div>
        {hasChildren && (
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400" />
            )}
          </div>
        )}
      </a>

      {/* Submenu */}
      {hasChildren && (
        <div className="ml-8 mt-1 space-y-1">
          {item.children?.map((child) => (
            <a
              key={child.href}
              href={child.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
                'hover:bg-gray-100 hover:text-gray-900',
                'pl-8'
              )}
            >
              <child.icon className="mr-2 h-4 w-4 text-gray-400" />
              <span>{child.title}</span>
              {child.badge && (
                <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                  {child.badge}
                </Badge>
              )}
            </a>
          ))}
        </div>
      )}
    </>
  );
}