'use client';

import { Card, CardContent } from '@/lib/ui/card';
import { Button } from '@/lib/ui/button';
import { TodoStatusBadge } from '@/todos/components/TodoStatusBadge';
import { EditIcon, TrashIcon } from 'lucide-react';
import { Todo } from '@/types/todo';
import { todoService } from '@/services/todoService';

interface TodoCardProps {
  todo: Todo;
  isSelected: boolean;
  onSelect: (todoId: string, checked: boolean) => void;
  onEdit: (todoId: string) => void;
  onDelete?: (todoId: string) => void;
}

export function TodoCard({ todo, isSelected, onSelect, onEdit, onDelete }: TodoCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(todo.id, e.target.checked);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todoService.deleteTodo(todo.id);
      onDelete?.(todo.id);
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Error deleting todo. Please try again.');
    }
  };

  return (
    <Card
      className={`transition-all ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } hover:shadow-md`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="mt-1"
          />

          {/* Todo Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-900 dark:text-slate-100">
                {todo.title}
              </h3>
              <TodoStatusBadge status={todo.status} />
            </div>

            {todo.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {todo.description}
              </p>
            )}

            {/* Timestamp */}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Created: {new Date(todo.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(todo.id)}
            >
              <EditIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-500 hover:text-red-700"
              onClick={handleDelete}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}