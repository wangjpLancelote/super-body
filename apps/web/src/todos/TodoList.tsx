'use client';

import { useState } from 'react';
import { RealtimeIndicator } from '@/components/todo/RealtimeIndicator';
import { SearchTodo } from '@/components/todo/SearchTodo';
import { BulkActions } from '@/components/todo/BulkActions';
import { TodoFilters } from '@/todos/components/TodoFilters';
import { TodoCard } from '@/todos/components/TodoCard';
import { useTodos } from '@/hooks/useTodos';
import { TodoService } from '@/services/todoService';
import { TodoStatus } from '@/types/todo';

interface TodoListProps {
  onEdit: (todoId: string) => void;
}

const todoService = new TodoService();

export function TodoList({ onEdit }: TodoListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const { todos, loading, totalCount, totalCountByStatus, isConnected } = useTodos({
    search: searchQuery,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(todos.map(todo => todo.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await todoService.deleteTodo(todoId);
      // The list will be refreshed automatically via real-time subscription
    } catch (error) {
      console.error('Error deleting todo:', error);
      alert('Error deleting todo. Please try again.');
    }
  };

  const handleSelectTodo = (todoId: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, todoId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} todo${selectedIds.length !== 1 ? 's' : ''}?`)) {
      return;
    }

    setIsBulkLoading(true);
    try {
      await todoService.deleteMultipleTodos(selectedIds);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting todos:', error);
      alert('Error deleting todos. Please try again.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkStatusChange = async (status: TodoStatus) => {
    if (!selectedIds.length) return;

    setIsBulkLoading(true);
    try {
      await todoService.changeMultipleTodoStatus(selectedIds, status);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error updating todos:', error);
      alert('Error updating todos. Please try again.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const hasSelection = selectedIds.length > 0;

  return (
    <div className="space-y-6">
      {/* Realtime indicator */}
      <RealtimeIndicator isConnected={isConnected} />

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchTodo value={searchQuery} onChange={setSearchQuery} />
        </div>
        <TodoFilters
          totalCount={totalCount}
          totalCountByStatus={totalCountByStatus}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />
      </div>

      {/* Bulk Actions */}
      {hasSelection && (
        <BulkActions
          selectedCount={selectedIds.length}
          isLoading={isBulkLoading}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
          onCancel={() => {
            setSelectedIds([]);
          }}
        />
      )}

      {/* Todo List */}
      {loading ? (
        <div className="text-center py-8 text-slate-500">
          Loading todos...
        </div>
      ) : todos.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No todos found. Create your first todo to get started!
        </div>
      ) : (
        <div className="space-y-4">
          {/* Select All Checkbox */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <input
                type="checkbox"
                checked={todos.length > 0 && selectedIds.length === todos.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="mr-2"
                disabled={loading}
              />
              {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select All'}
            </label>
          </div>

          {/* Todo Cards */}
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              isSelected={selectedIds.includes(todo.id)}
              onSelect={handleSelectTodo}
              onEdit={onEdit}
              onDelete={handleDeleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}