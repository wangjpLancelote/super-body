import { Todo, TodoStatus } from './todo';
import { FileItem, FileType } from './file';
import { Role } from './auth';

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: Todo;
        Insert: Omit<Todo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Todo>;
      };
      files: {
        Row: FileItem;
        Insert: Omit<FileItem, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<FileItem>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          role: Role;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          role?: Role;
        };
        Update: Partial<{
          email: string;
          role: Role;
        }>;
      };
    };
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponseError {
  code: string;
  message: string;
  details?: any;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface PaginatedParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterOptions {
  status?: TodoStatus[];
  type?: FileType[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface APIEndpoints {
  auth: {
    login: string;
    logout: string;
    profile: string;
  };
  todos: {
    list: string;
    create: string;
    update: string;
    delete: string;
  };
  files: {
    upload: string;
    list: string;
    delete: string;
    url: string;
  };
}