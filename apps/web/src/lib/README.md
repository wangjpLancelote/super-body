# Shared Library Configuration

This directory contains the shared configuration and utilities for the web application, designed to be compatible with the mobile app and provide cross-platform type consistency.

## Structure

```
src/
├── types/              # Shared TypeScript types
│   ├── index.ts       # Main export file
│   ├── todo.ts        # Todo-related types
│   ├── file.ts        # File-related types
│   ├── auth.ts        # Authentication types
│   └── api.ts         # API response types
├── lib/               # Core libraries and utilities
│   ├── shared/        # Shared constants and utilities
│   │   ├── types.ts   # Common type definitions
│   │   └── constants.ts # Application constants
│   ├── supabase.ts    # Supabase client configuration
│   ├── api.ts         # API client for edge functions
│   ├── env.ts         # Environment variable configuration
│   └── index.ts       # Main export file
└── env.ts             # Environment variable management
```

## Types

### Todo Types (`types/todo.ts`)
- `Todo`: Main todo interface with id, title, description, status, user_id, timestamps
- `TodoStatus`: Union type for 'todo' | 'doing' | 'done'
- `TodoFilters`: Filter statistics for todos
- `CreateTodoInput` / `UpdateTodoInput`: Input interfaces for CRUD operations

### File Types (`types/file.ts`)
- `FileItem`: File metadata interface with id, user_id, type, storage_path, timestamps
- `FileType`: Union type for 'image' | 'video' | 'other'
- `FileUploadResult`: Result type for file upload operations

### Auth Types (`types/auth.ts`)
- `Role`: User role type ('user' | 'premium' | 'admin')
- `AuthContextValue`: React context value for authentication
- `AuthState`: Authentication state interface
- `LoginCredentials` / `RegisterCredentials`: Authentication input interfaces

### API Types (`types/api.ts`)
- `ApiResponse<T>`: Generic API response wrapper
- `PaginatedResponse<T>`: Paginated response structure
- `Database`: Supabase database type definitions
- `FilterOptions`: Common filtering interface

## Shared Utilities

### Types (`lib/shared/types.ts`)
- Re-export of all core types
- Common utility types (BaseItem, WithUserId, etc.)
- Response wrapper types
- Common validation patterns and error codes

### Constants (`lib/shared/constants.ts`)
- **COLORS**: Design system colors matching mobile app
- **ROUTES**: Application routes and API endpoints
- **PAGINATION**: Pagination configuration
- **TIME**: Cache and timeout durations
- **API**: API configuration
- **UPLOAD**: File upload limits and allowed types
- **STORAGE**: Local storage keys

## Supabase Client

### Features
- **Browser client**: For client-side operations with SSR support
- **Server client**: For server-side operations with service role
- **Server component client**: For React Server Components
- **Singleton pattern**: Efficient client reuse

### Usage
```typescript
import { getSupabaseClient, createSupabaseServerClient } from './lib/supabase';

// Client-side
const supabase = getSupabaseClient();

// Server-side
const serverSupabase = createSupabaseServerClient();
```

## API Client

### Features
- **Comprehensive CRUD operations**: For todos and files
- **Authentication methods**: Login, signup, logout, profile management
- **File handling**: Upload, download, delete with progress tracking
- **Error handling**: Retry logic and error responses
- **Type safety**: Full TypeScript support with database types

### Usage
```typescript
import { api } from './lib/api';

// Authentication
const result = await api.auth.signIn(email, password);

// Todos
const todos = await api.todos.get({ page: 1, pageSize: 20 });
const newTodo = await api.todos.create({ title: 'New todo' });

// Files
const fileResult = await api.files.upload(file);
const files = await api.files.get();
```

## Environment Configuration

### Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)

### Configuration Structure
```typescript
import { config } from './lib/env';

// Access configuration
const supabaseConfig = config.supabase;
const apiConfig = config.api;
```

## Cross-Platform Compatibility

### Shared Types
All types are designed to be compatible between web and mobile platforms:
- Todo status types match between both platforms
- File type classifications are consistent
- User roles and authentication structures are identical

### Consistent API Design
- Similar method signatures between web and mobile
- Consistent error handling patterns
- Shared response formats

## Development Workflow

1. **Type Definitions**: Start by updating types in `src/types/`
2. **Constants**: Update in `src/lib/shared/constants.ts`
3. **API Changes**: Update in `src/lib/api.ts`
4. **Supabase Schema**: Update database types in `src/types/api.ts`

## Testing

- Verify type definitions with TypeScript compiler
- Test API client with mocked responses
- Ensure environment variables are properly configured
- Test cross-platform compatibility

## Dependencies

- `@supabase/supabase-js`: Supabase client library
- `@supabase/ssr`: Server-side rendering support
- TypeScript: Type definitions and checking