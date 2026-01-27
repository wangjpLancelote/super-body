/**
 * LangChain Tool Definitions
 *
 * These tools call Supabase Edge Functions (BFF) instead of accessing the DB directly.
 * All write operations default to dry-run mode.
 */

import { z } from 'zod';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';
const edgeBaseUrl =
  process.env.SUPABASE_EDGE_URL ?? `${supabaseUrl.replace(/\/$/, '')}/functions/v1`;

function requireEdgeConfig() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
  }
}

async function callEdge(
  path: string,
  accessToken: string,
  options: {
    method?: string;
    body?: Record<string, unknown>;
    query?: Record<string, string | undefined>;
  } = {},
) {
  requireEdgeConfig();
  const method = options.method ?? 'GET';
  const query = options.query ?? {};
  const url = new URL(`${edgeBaseUrl}/${path}`);
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: supabaseAnonKey,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error ?? `Edge error: ${res.status}`);
  }
  return payload;
}

const baseAuthSchema = z.object({
  user_id: z.string().uuid().describe('The UUID of the user'),
  access_token: z
    .string()
    .min(1)
    .describe('Supabase user access token for Edge Function auth'),
});

// ============================================================================
// GET_TODOS Tool
// ============================================================================

export const getTodosTool = {
  name: 'get_todos',
  description:
    'Retrieve all todos for a user. Returns title, description, status, and due date.',
  schema: baseAuthSchema.extend({
    status: z
      .enum(['todo', 'doing', 'done'])
      .optional()
      .describe('Filter by status (optional)'),
  }),
  async execute({
    access_token,
    status,
  }: {
    user_id: string;
    access_token: string;
    status?: string;
  }) {
    const data = await callEdge('todos', access_token, {
      method: 'GET',
      query: { status },
    });
    return data;
  },
};

// ============================================================================
// CREATE_TODO Tool (with dry-run mode)
// ============================================================================

export const createTodoTool = {
  name: 'create_todo',
  description:
    'Create a new todo item. Runs in DRY-RUN mode by default, showing what would be created.',
  schema: baseAuthSchema.extend({
    title: z.string().min(1).describe('The title of the todo'),
    description: z.string().optional().describe('Optional description'),
    due_at: z
      .string()
      .optional()
      .describe('Due date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)'),
    dry_run: z.boolean().default(true).describe('Run in dry-run mode (default: true)'),
  }),
  async execute({
    access_token,
    title,
    description,
    due_at,
    dry_run = true,
  }: {
    user_id: string;
    access_token: string;
    title: string;
    description?: string;
    due_at?: string;
    dry_run?: boolean;
  }) {
    const todoData = {
      title,
      description,
      due_at,
      status: 'todo',
    };

    if (dry_run) {
      return {
        success: true,
        dryRun: true,
        action: 'create_todo',
        wouldCreate: todoData,
        message: 'Dry-run: This todo would be created. Call with dry_run=false to execute.',
      };
    }

    const data = await callEdge('todos', access_token, {
      method: 'POST',
      body: todoData,
    });
    return data;
  },
};

// ============================================================================
// SEARCH_DOCUMENTS Tool
// ============================================================================

export const searchDocumentsTool = {
  name: 'search_documents',
  description:
    'Search documents using semantic similarity. Returns relevant documents with similarity scores.',
  schema: baseAuthSchema.extend({
    query: z.string().min(1).describe('The search query'),
    limit: z.number().int().min(1).max(20).default(5).describe('Maximum number of results'),
  }),
  async execute({
    access_token,
    query,
    limit = 5,
  }: {
    user_id: string;
    access_token: string;
    query: string;
    limit?: number;
  }) {
    const data = await callEdge('ai-assistant', access_token, {
      method: 'POST',
      body: {
        action: 'search_documents',
        query,
        limit,
      },
    });
    return data;
  },
};

// ============================================================================
// GET_STOCK_PRICE Tool
// ============================================================================

export const getStockPriceTool = {
  name: 'get_stock_price',
  description: 'Get current stock price for a given symbol (e.g., AAPL, GOOGL, MSFT).',
  schema: z.object({
    symbol: z
      .string()
      .min(1)
      .max(10)
      .toUpperCase()
      .describe('Stock symbol (e.g., AAPL)'),
  }),
  async execute({ symbol }: { symbol: string }) {
    const apiBase = process.env.STOCK_API_BASE_URL ?? '';
    const apiKey = process.env.STOCK_API_KEY ?? '';

    if (!apiBase || !apiKey) {
      return {
        success: false,
        error: 'Missing STOCK_API_BASE_URL or STOCK_API_KEY',
      };
    }

    const url = new URL(apiBase);
    url.searchParams.set('symbol', symbol);
    url.searchParams.set('apikey', apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) {
      return {
        success: false,
        error: `Stock API error: ${res.status}`,
      };
    }

    const payload = await res.json().catch(() => ({}));
    return {
      success: true,
      symbol,
      data: payload,
      source: apiBase,
      timestamp: new Date().toISOString(),
    };
  },
};

// ============================================================================
// Tool Collection
// ============================================================================

export const tools = [
  getTodosTool,
  createTodoTool,
  searchDocumentsTool,
  getStockPriceTool,
];

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const tool = tools.find((t) => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  return tool.execute(args as never);
}

export default {
  getTodosTool,
  createTodoTool,
  searchDocumentsTool,
  getStockPriceTool,
  tools,
  executeTool,
};
