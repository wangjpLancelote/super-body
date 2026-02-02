'use client';

import React from 'react';
import { Home, List, FileText, Bot, Settings, Plus } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  isActive?: boolean;
}

interface MainNavigationProps {
  currentPath?: string;
  onItemClick?: (item: NavItem) => void;
}

export function MainNavigation({ currentPath, onItemClick }: MainNavigationProps) {
  const navItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      isActive: currentPath === '/dashboard',
    },
    {
      title: 'Todos',
      href: '/todos',
      icon: List,
      badge: '12',
      isActive: currentPath === '/todos',
    },
    {
      title: 'Files',
      href: '/files',
      icon: FileText,
      badge: '24',
      isActive: currentPath === '/files',
    },
    {
      title: 'AI Assistant',
      href: '/ai-assistant',
      icon: Bot,
      badge: 'New',
      isActive: currentPath === '/ai-assistant',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: Settings,
      isActive: currentPath === '/settings',
    },
  ];

  return (
    <nav className="flex flex-col space-y-1">
      {navItems.map((item) => (
        <NavigationItem
          key={item.href}
          item={item}
          onClick={onItemClick}
        />
      ))}

      <Button
        variant="default"
        className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        size="sm"
      >
        <Plus className="mr-2 h-4 w-4" />
        New Item
      </Button>
    </nav>
  );
}

interface NavigationItemProps {
  item: NavItem;
  onClick?: (item: NavItem) => void;
}

function NavigationItem({ item, onClick }: NavigationItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
    // Navigation would be handled by the router in a real app
  };

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className={cn(
        'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200',
        item.isActive
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        'hover:border-l-4 hover:border-blue-300',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset'
      )}
    >
      <div className="flex items-center">
        <item.icon className={cn(
          'mr-3 h-5 w-5',
          item.isActive ? 'text-blue-600' : 'text-gray-400'
        )} />
        <span>{item.title}</span>
      </div>
      {item.badge && (
        <span className={cn(
          'inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full',
          item.isActive
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-800'
        )}>
          {item.badge === 'New' ? 'New' : item.badge}
        </span>
      )}
    </a>
  );
}