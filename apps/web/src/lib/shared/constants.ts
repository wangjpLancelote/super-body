// Color constants (matching mobile app design)
export const COLORS = {
  // Background colors
  background: {
    primary: '#0B0F14',
    secondary: '#121823',
    card: '#131B26',
    overlay: '#16261F',
  },

  // Text colors
  text: {
    primary: '#F5F7FA',
    secondary: '#B8C0CC',
    muted: '#9AA3AF',
    disabled: '#6B7280',
  },

  // Status colors
  status: {
    todo: '#F59E0B',
    doing: '#3B82F6',
    done: '#10B981',
    user: '#6B7280',
    premium: '#8B5CF6',
    admin: '#EF4444',
  },

  // Action colors
  action: {
    primary: '#6EE7B7',
    primaryText: '#0B0F14',
    danger: '#7F1D1D',
    dangerText: '#FECACA',
    border: '#2E3A48',
    borderActive: '#334155',
  },

  // Theme colors
  theme: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
} as const;

// Route constants
export const ROUTES = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
  },
  dashboard: {
    home: '/',
    todos: '/todos',
    files: '/files',
    profile: '/profile',
    settings: '/settings',
  },
  api: {
    auth: {
      login: '/api/auth/login',
      logout: '/api/auth/logout',
      profile: '/api/auth/profile',
    },
    todos: {
      list: '/api/todos',
      create: '/api/todos',
      update: '/api/todos/[id]',
      delete: '/api/todos/[id]',
    },
    files: {
      upload: '/api/files/upload',
      list: '/api/files',
      delete: '/api/files/[id]',
      url: '/api/files/[id]/url',
    },
  },
} as const;

// Pagination constants
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizes: [10, 20, 50, 100],
} as const;

// Time constants
export const TIME = {
  // Cache durations in milliseconds
  cache: {
    short: 5 * 60 * 1000, // 5 minutes
    medium: 30 * 60 * 1000, // 30 minutes
    long: 60 * 60 * 1000, // 1 hour
  },

  // Session timeout in milliseconds
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
} as const;

// API constants
export const API = {
  timeout: 10000, // 10 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
} as const;

// File upload constants
export const UPLOAD = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm',
    'application/pdf',
    'text/plain',
  ],
  chunkSize: 1024 * 1024, // 1MB chunks
} as const;

// Storage keys
export const STORAGE = {
  auth: {
    session: 'auth_session',
    user: 'auth_user',
    preferences: 'auth_preferences',
  },
  app: {
    theme: 'app_theme',
    language: 'app_language',
    notifications: 'app_notifications',
  },
} as const;