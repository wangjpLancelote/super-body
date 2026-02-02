'use client';

import { useState } from 'react';
import { Button } from '@/lib/ui/button';
import { Card, CardContent } from '@/lib/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/ui/dropdown-menu';
import { TrashIcon, CheckIcon, XIcon } from 'lucide-react';
import { TodoStatus } from '@/types/todo';

interface TodoActionsProps {
  selectedCount: number;
  onDelete: () => void;
  onStatusChange: (status: TodoStatus) => void;
  onCancel: () => void;
}

export function TodoActions({
  selectedCount,
  onDelete,
  onStatusChange,
  onCancel,
}: TodoActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {selectedCount} todo{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            {/* Status Change Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Change Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onStatusChange('todo')}>
                  Mark as To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('doing')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('done')}>
                  Mark as Done
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>

            {/* Cancel Button */}
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <XIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}