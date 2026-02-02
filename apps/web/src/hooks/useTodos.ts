'use client';

import { useState, useEffect, useCallback } from 'react';
import { TodoService } from '@/services/todoService';
import { Todo, TodoStatus, TodoFilters } from '@/types/todo';

const todoService = new TodoService();

export interface UseTodosOptions {
  search?: string;
  status?: TodoStatus;
  limit?: number;
}

export function useTodos(options: UseTodosOptions = {}) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalCountByStatus, setTotalCountByStatus] = useState<TodoFilters>({
    all: 0,
    todo: 0,
    doing: 0,
    done: 0,
  });
  const [isConnected, setIsConnected] = useState(true);

  const loadData = useCallback(async (search?: string, status?: TodoStatus) => {
    try {
      setLoading(true);

      const { todos: fetchedTodos, totalCount, totalCountByStatus } = await todoService.getTodos({
        search: search || options.search,
        status: status || options.status,
        limit: options.limit,
      });

      setTodos(fetchedTodos);
      setTotalCount(totalCount);
      setTotalCountByStatus(totalCountByStatus);
    } catch (error) {
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  }, [options.search, options.status, options.limit]);

  const checkConnection = useCallback(async () => {
    const connected = await todoService.checkConnection();
    setIsConnected(connected);
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
    checkConnection();
  }, [loadData, checkConnection]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = todoService.subscribeToChanges((payload) => {
      console.log('Todo change received:', payload);
      loadData();
    });

    // Periodic connection check
    const connectionInterval = setInterval(checkConnection, 5000);

    return () => {
      unsubscribe();
      clearInterval(connectionInterval);
    };
  }, [loadData, checkConnection]);

  // Manual refresh function
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    todos,
    loading,
    totalCount,
    totalCountByStatus,
    isConnected,
    refresh,
  };
}