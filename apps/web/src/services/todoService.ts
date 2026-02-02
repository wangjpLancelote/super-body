import { createSupabaseClient } from '@/lib/supabase';
import { Todo, CreateTodoInput, UpdateTodoInput, TodoStatus } from '@/types/todo';
import { api } from '@/lib/api';

export interface TodoServiceOptions {
  search?: string;
  status?: TodoStatus;
  limit?: number;
}

export class TodoService {
  private supabase = createSupabaseClient();

  async createTodo(data: CreateTodoInput): Promise<Todo> {
    const { data: newTodo, error } = await this.supabase
      .from('todos')
      .insert([
        {
          ...data,
          user_id: (await this.supabase.auth.getUser()).data.user?.id || '',
        }
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return newTodo;
  }

  async updateTodo(id: string, updates: UpdateTodoInput): Promise<Todo> {
    const { data: updatedTodo, error } = await this.supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedTodo;
  }

  async deleteTodo(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async getTodos(options: TodoServiceOptions = {}): Promise<{ todos: Todo[], totalCount: number, totalCountByStatus: { [key in TodoStatus]: number }, all: number }> {
    const { search, status, limit } = options;

    // Base query
    let query = this.supabase
      .from('todos')
      .select('*', { count: 'exact' })
      .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id || '');

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    // Apply ordering
    query = query.order('created_at', { ascending: false });

    const { data: todos, error, count } = await query;

    if (error) throw new Error(error.message);

    // Get counts by status
    const user = (await this.supabase.auth.getUser()).data.user;
    if (!user) {
      return {
        todos: todos || [],
        totalCount: 0,
        totalCountByStatus: { todo: 0, doing: 0, done: 0 },
        all: 0
      };
    }

    const { data: allTodos } = await this.supabase
      .from('todos')
      .select('status')
      .eq('user_id', user.id);

    const totalCountByStatus = allTodos?.reduce((acc, todo) => {
      acc[todo.status]++;
      return acc;
    }, { todo: 0, doing: 0, done: 0 }) || { todo: 0, doing: 0, done: 0 };

    return {
      todos: todos || [],
      totalCount: count || 0,
      totalCountByStatus,
      all: count || 0
    };
  }

  async changeTodoStatus(id: string, status: TodoStatus): Promise<Todo> {
    const { data: updatedTodo, error } = await this.supabase
      .from('todos')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return updatedTodo;
  }

  async deleteMultipleTodos(ids: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('todos')
      .delete()
      .in('id', ids);

    if (error) throw new Error(error.message);
  }

  async changeMultipleTodoStatus(ids: string[], status: TodoStatus): Promise<Todo[]> {
    const { data: updatedTodos, error } = await this.supabase
      .from('todos')
      .update({ status })
      .in('id', ids)
      .select();

    if (error) throw new Error(error.message);
    return updatedTodos || [];
  }

  // Subscribe to todo changes
  subscribeToChanges(callback: (payload: any) => void): () => void {
    const channel = this.supabase
      .channel('todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'todos',
          filter: `user_id=eq.${(this.supabase.auth.getUser()).data.user?.id || ''}`,
        },
        callback
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  // Check connection status
  async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('todos')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }
}