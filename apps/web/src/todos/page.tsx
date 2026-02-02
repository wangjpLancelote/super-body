'use client';

import { useState, useEffect } from 'react';
import { TodoList } from '@/todos/TodoList';
import { TodoForm } from '@/todos/TodoForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui/card';
import { Button } from '@/lib/ui/button';
import { PlusIcon, SearchIcon, FilterIcon } from 'lucide-react';
import { CreateTodoInput } from '@/types/todo';

export default function TodosPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<string | null>(null);
  const [editingTodo, setEditingTodo] = useState<CreateTodoInput | null>(null);

  const handleCreateTodo = async (data: CreateTodoInput) => {
    setShowCreateForm(false);
    setSelectedTodo(null);
    setEditingTodo(null);
  };

  const handleEditTodo = async (todoId: string) => {
    try {
      // Load todo data for editing
      const { data, error } = await api.todos.get({ id: todoId });
      if (error || !data.data) {
        throw new Error('Todo not found');
      }

      setEditingTodo(data.data);
      setSelectedTodo(todoId);
      setShowCreateForm(true);
    } catch (error) {
      console.error('Error loading todo for edit:', error);
      alert('Error loading todo for edit. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setShowCreateForm(false);
    setSelectedTodo(null);
    setEditingTodo(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Todos
        </h1>
        <Button onClick={() => {
          setShowCreateForm(true);
          setSelectedTodo(null);
          setEditingTodo(null);
        }}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Todo
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {selectedTodo ? 'Edit Todo' : 'Create New Todo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TodoForm
              onSubmit={handleCreateTodo}
              onCancel={handleCancelEdit}
              initialData={selectedTodo && editingTodo ? {
                ...editingTodo,
                id: selectedTodo
              } : undefined}
            />
          </CardContent>
        </Card>
      )}

      <TodoList onEdit={handleEditTodo} />
    </div>
  );
}