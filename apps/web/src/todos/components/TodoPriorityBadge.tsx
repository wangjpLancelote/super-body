'use client';

import { Badge } from '@/lib/ui/badge';
import { cn } from '@/lib/utils';

type TodoPriority = 'low' | 'medium' | 'high';

interface TodoPriorityBadgeProps {
  priority: TodoPriority;
}

const priorityConfig = {
  low: {
    label: 'Low',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  },
  medium: {
    label: 'Medium',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
};

export function TodoPriorityBadge({ priority }: TodoPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}