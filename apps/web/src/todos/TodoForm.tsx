'use client';

import { useState } from 'react';
import { Button } from '@/lib/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card';
import { Input } from '@/lib/ui/input';
import { Textarea } from '@/lib/ui/textarea';
import { UpdateTodoInput, CreateTodoInput } from '@/types/todo';
import { useForm } from 'react-hook-form';
import { XIcon, SaveIcon } from 'lucide-react';
import { todoService } from '@/services/todoService';

interface TodoFormProps {
  onSubmit: (data: CreateTodoInput) => void;
  onCancel: () => void;
  initialData?: CreateTodoInput & { id?: string };
}

type TodoFormData = CreateTodoInput & { id?: string };

export function TodoForm({ onSubmit, onCancel, initialData }: TodoFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TodoFormData>({
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      status: initialData?.status || 'todo',
    },
  });

  const handleFormSubmit = async (data: TodoFormData) => {
    setIsLoading(true);
    try {
      if (initialData?.id) {
        // Update existing todo
        await todoService.updateTodo(initialData.id, data);
      } else {
        // Create new todo
        await todoService.createTodo(data);
      }

      // Call parent onSubmit to refresh the list
      onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error saving todo:', error);
      alert('Error saving todo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{initialData ? 'Edit Todo' : 'Create Todo'}</span>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <XIcon className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              placeholder="Enter todo title..."
              {...register('title', {
                required: 'Title is required',
                maxLength: 100,
              })}
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Enter todo description..."
              {...register('description', {
                maxLength: 500,
              })}
              disabled={isLoading}
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              {...register('status')}
              disabled={isLoading}
            >
              <option value="todo">To Do</option>
              <option value="doing">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <SaveIcon className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}