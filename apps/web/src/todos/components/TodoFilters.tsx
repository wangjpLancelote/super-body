'use client';

import { Button } from '@/lib/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/ui/dropdown-menu';
import { FilterIcon } from 'lucide-react';
import { TodoStatus } from '@/types/todo';

interface TodoFiltersProps {
  totalCount: number;
  totalCountByStatus: Record<TodoStatus, number>;
  selectedStatus: TodoStatus | 'all';
  onStatusChange: (status: TodoStatus | 'all') => void;
}

export function TodoFilters({
  totalCount,
  totalCountByStatus,
  selectedStatus,
  onStatusChange,
}: TodoFiltersProps) {
  const filterOptions = [
    { key: 'all', label: 'All', count: totalCount },
    { key: 'todo' as TodoStatus, label: 'To Do', count: totalCountByStatus.todo },
    { key: 'doing' as TodoStatus, label: 'In Progress', count: totalCountByStatus.doing },
    { key: 'done' as TodoStatus, label: 'Done', count: totalCountByStatus.done },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FilterIcon className="w-4 h-4 mr-2" />
          Filter by Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {filterOptions.map((option) => (
          <DropdownMenuItem
            key={option.key}
            onClick={() => onStatusChange(option.key)}
            className={selectedStatus === option.key ? 'bg-slate-100 dark:bg-slate-800' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{option.label}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                {option.count}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}