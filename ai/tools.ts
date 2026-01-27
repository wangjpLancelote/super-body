/**
 * LangChain Tool Definitions
 * 
 * These tools define what the AI agent can do.
 * All write operations default to dry-run mode.
 */

import { Tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import {
  searchDocuments,
  searchTodos,
  storeTodoEmbedding,
} from './vector.js';
import axios from 'axios';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ============================================================================
// GET_TODOS Tool
// ============================================================================

export const getTodosTool = {
  name: 'get_todos',
  description:
    'Retrieve all todos for a user. Returns title, description, status, and due date.',
  schema: z.object({
    user_id: z.string().uuid().describe('The UUID of the user'),
    status: z
      .enum(['todo', 'doing', 'done'])
      .optional()
      .describe('Filter by status (optional)'),
  }),
  async execute({
    user_id,
    status,
  }: {
    user_id: string;
    status?: string;
  }) {
    try {
      let query = supabase
        .from('todos')
        .select('id, title, description, status, due_at, created_at')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        count: data?.length || 0,
        todos: data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  },
};

// ============================================================================
// CREATE_TODO Tool (with dry-run mode)
// ============================================================================

export const createTodoTool = {
  name: 'create_todo',
  description:
    'Create a new todo item. Runs in DRY-RUN mode by default, showing what would be created.',
  schema: z.object({
    user_id: z.string().uuid().describe('The UUID of the user'),
    title: z.string().min(1).describe('The title of the todo'),
    description: z.string().optional().describe('Optional description'),
    due_at: z
      .string()
      .optional()
      .describe('Due date in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)'),
    dry_run: z.boolean().default(true).describe('Run in dry-run mode (default: true)'),
  }),
  async execute({
    user_id,
    title,
    description,
    due_at,
    dry_run = true,
  }: {
    user_id: string;
    title: string;
    description?: string;
    due_at?: string;
    dry_run?: boolean;
  }) {
    try {
      const todoData = {
        user_id,
        title,
        description,
        due_at: due_at ? new Date(due_at).toISOString() : null,
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

      // Actual execution only with dry_run=false
      const { data, error } = await supabase
        .from('todos')
        .insert(todoData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate embedding for the new todo
      if (data) {
        await storeTodoEmbedding(data.id, user_id, title, description);
      }

      return {
        success: true,
        dryRun: false,
        action: 'create_todo',
        created: data,
        message: 'Todo created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  },
};

// ============================================================================
// SEARCH_DOCUMENTS Tool
// ============================================================================

export const searchDocumentsTool = {
  name: 'search_documents',
  description:
    'Search documents using semantic similarity. Returns relevant documents with similarity scores.',
  schema: z.object({
    user_id: z.string().uuid().describe('The UUID of the user'),
    query: z.string().min(1).describe('The search query'),
    limit: z.number().int().min(1).max(20).default(5).describe('Maximum number of results'),
  }),
  async execute({
    user_id,
    query,
    limit = 5,
  }: {
    user_id: string;
    query: string;
    limit?: number;
  }) {
    try {
      const results = await searchDocuments(user_id, query, limit);

      return {
        success: true,
        query,
        count: results.length,
        documents: results,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  },
};

// ============================================================================
// SEARCH_TODOS Tool
// ============================================================================

export const searchTodosTool = {
  name: 'search_todos',
  description:
    'Search todos using semantic similarity. Returns relevant todos with similarity scores.',
  schema: z.object({
    user_id: z.string().uuid().describe('The UUID of the user'),
    query: z.string().min(1).describe('The search query'),
    limit: z.number().int().min(1).max(20).default(5).describe('Maximum number of results'),
  }),
  async execute({
    user_id,
    query,
    limit = 5,
  }: {
    user_id: string;
    query: string;
    limit?: number;
  }) {
    try {
      const results = await searchTodos(user_id, query, limit);

      return {
        success: true,
        query,
        count: results.length,
        todos: results,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
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
    try {
      // Mock stock price API - replace with real API
      const mockPrices: { [key: string]: number } = {
        AAPL: 192.53,
        GOOGL: 140.29,
        MSFT: 416.04,
        AMZN: 178.64,
        TSLA: 242.84,
      };

      if (!mockPrices[symbol]) {
        return {
          success: false,
          error: `Symbol ${symbol} not found`,
        };
      }

      return {
        success: true,
        symbol,
        price: mockPrices[symbol],
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'mock_data',
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  },
};

// ============================================================================
// Tool Collection
// ============================================================================

export const tools = [
  getTodosTool,
  createTodoTool,
  searchDocumentsTool,
  searchTodosTool,
  getStockPriceTool,
];

/**
 * Execute a tool by name
 */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const tool = tools.find((t) => t.name === toolName);

  if (!tool) {
    throw new Error(`Tool ${toolName} not found`);
  }

  return tool.execute(args);
}

export default {
  getTodosTool,
  createTodoTool,
  searchDocumentsTool,
  searchTodosTool,
  getStockPriceTool,
  tools,
  executeTool,
};
