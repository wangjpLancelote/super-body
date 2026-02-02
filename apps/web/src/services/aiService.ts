import { Message } from '@/types/ai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const edgeBaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_EDGE_URL || `${supabaseUrl.replace(/\/$/, '')}/functions/v1`;

interface AIChatRequest {
  message: string;
  context?: {
    userId?: string;
    chatHistory?: Message[];
  };
}

interface AIChatResponse {
  content: string;
  type: 'text' | 'search-results' | 'action';
  data?: any;
}

interface DocumentSearchRequest {
  query: string;
  limit?: number;
  userId: string;
}

interface DocumentSearchResponse {
  success: boolean;
  count: number;
  documents: Array<{
    id: string;
    title: string;
    content: string;
    similarity: number;
  }>;
}

interface CreateTodoRequest {
  title: string;
  description?: string;
  due_at?: string;
  userId: string;
  dry_run?: boolean;
}

interface CreateTodoResponse {
  success: boolean;
  data?: any;
  dryRun?: boolean;
  message?: string;
}

// Helper function to get auth token
export const getAuthHeaders = (accessToken: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`,
  'apikey': supabaseAnonKey,
});

// AI Chat Service
export class AIService {
  private static async callEdgeFunction(
    path: string,
    accessToken: string,
    options: {
      method?: 'GET' | 'POST';
      body?: any;
      query?: Record<string, string | undefined>;
    } = {}
  ) {
    const method = options.method || 'GET';
    const query = options.query || {};
    const url = new URL(`${edgeBaseUrl}/${path}`);

    Object.entries(query).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });

    const res = await fetch(url.toString(), {
      method,
      headers: getAuthHeaders(accessToken),
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload?.error || `AI Service error: ${res.status}`);
    }
    return payload;
  }

  // Send message to AI assistant
  static async chat(
    request: AIChatRequest,
    accessToken: string,
    options: {
      stream?: boolean;
      dryRun?: boolean;
    } = {}
  ): Promise<AIChatResponse> {
    try {
      const response = await this.callEdgeFunction('ai-assistant', accessToken, {
        method: 'POST',
        body: {
          action: 'chat',
          input: request.message,
          context: request.context,
          stream: options.stream || false,
          dry_run: options.dryRun !== false,
        },
      });

      if (options.stream) {
        // For streaming responses, we need to handle the EventSource
        return {
          content: response.response || '开始处理...',
          type: response.type || 'text',
          data: response,
        };
      }

      return {
        content: response.response || '我收到了您的消息，正在处理...',
        type: response.type || 'text',
        data: response.data,
      };
    } catch (error) {
      console.error('AI chat error:', error);
      return {
        content: '抱歉，处理您的消息时出现了错误。请稍后再试。',
        type: 'text',
      };
    }
  }

  // Send message to AI assistant with streaming
  static async *chatStream(
    request: AIChatRequest,
    accessToken: string,
    options: {
      dryRun?: boolean;
    } = {}
  ): AsyncIterable<AIChatResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_EDGE_URL}/ai-assistant`, {
        method: 'POST',
        headers: this.getAuthHeaders(accessToken),
        body: JSON.stringify({
          action: 'chat_stream',
          input: request.message,
          context: request.context,
          stream: true,
          dry_run: options.dryRun !== false,
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'chunk') {
                yield {
                  content: parsed.content || '',
                  type: parsed.type || 'text',
                  data: parsed.data,
                };
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI chat stream error:', error);
      yield {
        content: '抱歉，处理您的消息时出现了错误。请稍后再试。',
        type: 'text',
      };
    }
  }

  // Search documents
  static async searchDocuments(
    request: DocumentSearchRequest,
    accessToken: string
  ): Promise<DocumentSearchResponse> {
    try {
      const response = await this.callEdgeFunction('ai-assistant', accessToken, {
        method: 'POST',
        body: {
          action: 'search_documents',
          query: request.query,
          limit: request.limit || 10,
          user_id: request.userId,
        },
      });

      return {
        success: response.success || false,
        count: response.count || 0,
        documents: response.documents || [],
      };
    } catch (error) {
      console.error('Document search error:', error);
      return {
        success: false,
        count: 0,
        documents: [],
      };
    }
  }

  // Create todo
  static async createTodo(
    request: CreateTodoRequest,
    accessToken: string
  ): Promise<CreateTodoResponse> {
    try {
      const response = await this.callEdgeFunction('todos', accessToken, {
        method: 'POST',
        body: {
          title: request.title,
          description: request.description,
          due_at: request.due_at,
          status: 'todo',
        },
      });

      return {
        success: true,
        data: response,
        dryRun: false,
        message: '任务创建成功！',
      };
    } catch (error) {
      console.error('Create todo error:', error);
      return {
        success: false,
        message: '创建任务失败，请重试。',
      };
    }
  }

  // Get todos
  static async getTodos(
    accessToken: string,
    status?: string
  ): Promise<any> {
    try {
      const response = await this.callEdgeFunction('todos', accessToken, {
        method: 'GET',
        query: { status },
      });
      return response;
    } catch (error) {
      console.error('Get todos error:', error);
      return [];
    }
  }
}

// Mock data for development
export const mockResponses = {
  welcome: {
    content: `你好！我是你的 AI 助手。我可以帮助你：

1. **搜索和总结文档** - 我可以帮你查找和总结你的文档内容
2. **管理待办事项** - 创建、查看和管理你的待办任务
3. **提供操作建议** - 基于你的数据和上下文提供智能建议
4. **数据分析** - 帮助你理解和分析数据

请告诉我你需要什么帮助！`,
    type: 'text' as const,
  },

  searchDocuments: (query: string) => ({
    success: true,
    count: 3,
    documents: [
      {
        id: 'doc-1',
        title: `${query}相关项目文档`,
        content: `这是关于${query}的详细项目文档，包含了技术规范、实施计划和注意事项。文档涵盖了多个方面，包括架构设计、开发流程和质量保证等内容。`,
        similarity: 0.95,
      },
      {
        id: 'doc-2',
        title: `${query}技术报告`,
        content: `技术报告详细分析了${query}的实现方案，包括技术选型、性能优化和未来发展方向。报告提供了具体的数据支持和代码示例。`,
        similarity: 0.88,
      },
      {
        id: 'doc-3',
        title: `${query}工作总结`,
        content: `本周工作总结：我们完成了${query}的主要功能开发，进行了单元测试，并修复了几个关键问题。下周计划继续完善功能并进行集成测试。`,
        similarity: 0.82,
      },
    ],
  }),

  createTodo: (title: string, description?: string) => ({
    success: true,
    data: {
      id: `todo-${Date.now()}`,
      title,
      description,
      status: 'todo',
      created_at: new Date().toISOString(),
    },
    message: `任务"${title}"已创建成功！`,
  }),
};