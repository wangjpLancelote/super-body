'use client';

import { Badge } from '@/lib/ui/badge';
import { cn } from '@/lib/utils';
import { TodoStatus } from '@/types/todo';

interface TodoStatusBadgeProps {
  status: TodoStatus;
}

const statusConfig = {
  todo: {
    label: 'To Do',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  doing: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  },
  done: {
    label: 'Done',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
};

export function TodoStatusBadge({ status }: TodoStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}