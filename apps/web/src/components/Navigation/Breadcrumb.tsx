'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/lib/ui/button';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  title: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function Breadcrumb({ items, homeHref = '/' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm">
      {/* Home Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        asChild
      >
        <a href={homeHref} className="hover:text-blue-600">
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </a>
      </Button>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <React.Fragment key={item.title}>
          {/* Chevron Separator */}
          <ChevronRight className="h-4 w-4 text-gray-400" />

          {/* Breadcrumb Item */}
          {item.href && !item.isCurrentPage ? (
            <a
              href={item.href}
              className={cn(
                'text-gray-500 hover:text-gray-700',
                'transition-colors duration-200'
              )}
            >
              {item.title}
            </a>
          ) : (
            <span
              className={cn(
                'font-medium text-gray-900',
                item.isCurrentPage && 'text-blue-600'
              )}
            >
              {item.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// Usage example for common pages:
export const DashboardBreadcrumb = (
  <Breadcrumb items={[
    { title: 'Dashboard', isCurrentPage: true }
  ]} />
);

export const TodosBreadcrumb = (
  <Breadcrumb items={[
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Todos', isCurrentPage: true }
  ]} />
);

export const FilesBreadcrumb = (
  <Breadcrumb items={[
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Files', isCurrentPage: true }
  ]} />
);

export const AIAssistantBreadcrumb = (
  <Breadcrumb items={[
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'AI Assistant', isCurrentPage: true }
  ]} />
);

export const SettingsBreadcrumb = (
  <Breadcrumb items={[
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', isCurrentPage: true }
  ]} />
);