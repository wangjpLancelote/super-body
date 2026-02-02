// Export shared types
export * from './types';
export * from './constants';

// Export the shared utilities
export { COLORS, ROUTES, PAGINATION, TIME, API, UPLOAD, STORAGE } from './constants';

// Export type aliases
export type {
  Todo,
  TodoStatus,
  FileItem,
  FileType,
  Role,
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
} from '../../types';

// Export utility functions
export {
  validateEnvironment,
  getEnv,
} from '../../env';

// Re-export database types for convenience
import type { Database } from '../../types/api';
export type { Database };