import { Todo, TodoStatus } from '../../types/todo';
import { FileItem, FileType } from '../../types/file';
import { Role } from '../../types/auth';

// Re-export types for convenience
export type { Todo, TodoStatus, FileItem, FileType, Role };

// Shared interfaces used across the application
export interface BaseItem {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface WithUserId {
  user_id: string;
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

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API Response wrapper
export interface ApiResponseWrapper<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Common constants
export const API_DEFAULT_PAGE_SIZE = 20;
export const API_MAX_PAGE_SIZE = 100;
export const API_DEFAULT_PAGE = 1;

// Error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

// Common validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// Common status colors
export const STATUS_COLORS = {
  todo: '#F59E0B', // amber-500
  doing: '#3B82F6', // blue-500
  done: '#10B981', // emerald-500
  user: '#6B7280', // gray-500
  premium: '#8B5CF6', // violet-500
  admin: '#EF4444', // red-500
} as const;