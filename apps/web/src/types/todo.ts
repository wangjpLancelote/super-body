export interface Todo {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type TodoStatus = 'todo' | 'doing' | 'done';

export interface TodoFilters {
  all: number;
  todo: number;
  doing: number;
  done: number;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  status?: TodoStatus;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  description?: string | null;
  status?: TodoStatus;
}

export interface TodoFormData {
  title: string;
  description: string;
}

export interface TodoStats {
  total: number;
  byStatus: Record<TodoStatus, number>;
}