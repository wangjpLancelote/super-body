'use client';

import { useState } from 'react';
import { Button } from '@/lib/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/lib/ui/dropdown-menu';
import { TrashIcon, CheckIcon, XIcon } from 'lucide-react';
import { TodoStatus } from '@/types/todo';

interface BulkActionsProps {
  selectedCount: number;
  isLoading?: boolean;
  onDelete: () => void;
  onStatusChange: (status: TodoStatus) => void;
  onCancel: () => void;
}

export function BulkActions({
  selectedCount,
  isLoading = false,
  onDelete,
  onStatusChange,
  onCancel,
}: BulkActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const isProcessing = isLoading || isDeleting;

  return (
    <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {selectedCount} todo{selectedCount !== 1 ? 's' : ''} selected
      </span>
      <div className="flex gap-2">
        {/* Status Change Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isProcessing}>
              <CheckIcon className="w-4 h-4 mr-2" />
              Change Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onStatusChange('todo')} disabled={isProcessing}>
              Mark as To Do
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('doing')} disabled={isProcessing}>
              Mark as In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange('done')} disabled={isProcessing}>
              Mark as Done
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete Button */}
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isProcessing}
        >
          <TrashIcon className="w-4 h-4 mr-2" />
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>

        {/* Cancel Button */}
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isProcessing}>
          <XIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}