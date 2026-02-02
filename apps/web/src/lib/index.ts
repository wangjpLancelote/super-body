// Core utilities and clients
export * from './supabase';
export * from './api';

// Shared types and constants
export * from './shared';

// Export the main API client
export { apiClient, api } from './api';

// Export environment utilities
export {
  supabase,
  api as apiConfig,
  auth,
  upload,
  app,
  config,
  validateEnvironment,
  getEnv,
} from './env';

// Export convenience types
export type {
  ApiResponse,
  PaginatedResponse,
  FilterOptions,
  UserProfile,
} from './types/api';