import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../types/api';
import { ApiResponse, PaginatedResponse, PaginatedParams, FilterOptions } from '../types/api';
import { API, STORAGE } from './shared/constants';

// API client configuration
class ApiClient {
  private client: ReturnType<typeof createClient<Database>>;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;

    // Create Supabase client with database types
    this.client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
        },
      }
    );
  }

  // Generic HTTP request method
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
      data?: any;
      params?: Record<string, string>;
      headers?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', data, params = {}, headers = {} } = options;

    // Build URL with query parameters
    const url = new URL(endpoint, this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value);
      }
    });

    // Prepare headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if user is authenticated
    const token = this.getAuthToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Make request with retries
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < API.retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method,
          headers: requestHeaders,
          body: data ? JSON.stringify(data) : undefined,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const result = await response.json();
        return {
          success: true,
          data: result.data || result,
        };
      } catch (error) {
        lastError = error as Error;
        if (attempt < API.retries - 1) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, API.retryDelay * (attempt + 1)));
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Network error',
    };
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<ApiResponse<any>> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  }

  async signUp(email: string, password: string): Promise<ApiResponse<any>> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  }

  async signOut(): Promise<ApiResponse<void>> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Clear local storage
    localStorage.removeItem(STORAGE.auth.session);
    localStorage.removeItem(STORAGE.auth.user);

    return {
      success: true,
    };
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    const { data: { user }, error } = await this.client.auth.getUser();

    if (error || !user) {
      return {
        success: false,
        error: error?.message || 'Not authenticated',
      };
    }

    return {
      success: true,
      data: user,
    };
  }

  // Todo methods
  async getTodos(params: PaginatedParams & FilterOptions = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const { page = 1, pageSize = 20, status, dateRange } = params;

    let query = this.client
      .from('todos')
      .select('*', { count: 'exact' });

    // Apply filters
    if (status && status.length > 0) {
      query = query.in('status', status);
    }

    // Apply date range filter
    if (dateRange) {
      query = query.gte('created_at', dateRange.start.toISOString());
      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end.toISOString());
      }
    }

    // Apply pagination
    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasNext: count !== null && offset + pageSize < count,
        hasPrev: page > 1,
      },
    };
  }

  async createTodo(todo: any): Promise<ApiResponse<any>> {
    const { data, error } = await this.client
      .from('todos')
      .insert([todo])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  }

  async updateTodo(id: string, updates: any): Promise<ApiResponse<any>> {
    const { data, error } = await this.client
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  }

  async deleteTodo(id: string): Promise<ApiResponse<void>> {
    const { error } = await this.client
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
    };
  }

  // File methods
  async uploadFile(file: File, path?: string): Promise<ApiResponse<string>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const filePath = path || `${userId}/${Date.now()}-${file.name}`;

    const { data, error } = await this.client.storage
      .from('files')
      .upload(filePath, file);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Create file record in database
    const fileRecord = {
      user_id: userId,
      type: this.getFileType(file.type),
      storage_path: data.path,
    };

    const { data: fileData, error: dbError } = await this.client
      .from('files')
      .insert([fileRecord])
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insertion fails
      await this.client.storage.from('files').remove([filePath]);
      return {
        success: false,
        error: dbError.message,
      };
    }

    return {
      success: true,
      data: fileData?.id || data.path,
    };
  }

  async getFiles(params: PaginatedParams = {}): Promise<ApiResponse<PaginatedResponse<any>>> {
    const { page = 1, pageSize = 20 } = params;
    const userId = this.getCurrentUserId();

    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    let query = this.client
      .from('files')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    const offset = (page - 1) * pageSize;
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query.order('created_at', { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        hasNext: count !== null && offset + pageSize < count,
        hasPrev: page > 1,
      },
    };
  }

  async deleteFile(id: string): Promise<ApiResponse<void>> {
    const userId = this.getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    // Get file record to get storage path
    const { data: fileData, error: fetchError } = await this.client
      .from('files')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !fileData) {
      return {
        success: false,
        error: 'File not found',
      };
    }

    // Delete from storage
    const { error: storageError } = await this.client.storage
      .from('files')
      .remove([fileData.storage_path]);

    if (storageError) {
      return {
        success: false,
        error: storageError.message,
      };
    }

    // Delete from database
    const { error: dbError } = await this.client
      .from('files')
      .delete()
      .eq('id', id);

    if (dbError) {
      return {
        success: false,
        error: dbError.message,
      };
    }

    return {
      success: true,
    };
  }

  getFileUrl(path: string): string {
    const { data } = this.client.storage
      .from('files')
      .getPublicUrl(path);

    return data.publicUrl;
  }

  // Helper methods
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE.auth.session);
  }

  private getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(STORAGE.auth.user);
    return userData ? JSON.parse(userData)?.id : null;
  }

  private getFileType(mimeType: string): 'image' | 'video' | 'other' {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    return 'other';
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  auth: {
    signIn: (email: string, password: string) => apiClient.signIn(email, password),
    signUp: (email: string, password: string) => apiClient.signUp(email, password),
    signOut: () => apiClient.signOut(),
    getCurrentUser: () => apiClient.getCurrentUser(),
  },
  todos: {
    get: (params?: any) => apiClient.getTodos(params),
    create: (todo: any) => apiClient.createTodo(todo),
    update: (id: string, updates: any) => apiClient.updateTodo(id, updates),
    delete: (id: string) => apiClient.deleteTodo(id),
  },
  files: {
    upload: (file: File, path?: string) => apiClient.uploadFile(file, path),
    get: (params?: any) => apiClient.getFiles(params),
    delete: (id: string) => apiClient.deleteFile(id),
    getUrl: (path: string) => apiClient.getFileUrl(path),
  },
};