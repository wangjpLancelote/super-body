/**
 * AI Agent Tests
 *
 * Test suite for the SuperBody AI agent functionality.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuperBodyAgent, createAgent } from '../agent';
import { createLLMClient } from '../llm';
import { tools, executeTool } from '../tools';

// Mock LLM responses
const mockLLMResponse = {
  content: 'I will help you create a todo item.',
  usage: {
    promptTokens: 100,
    completionTokens: 50,
    totalTokens: 150,
  },
};

const mockToolResponse = {
  success: true,
  dryRun: true,
  action: 'create_todo',
  wouldCreate: {
    title: 'Test Todo',
    description: 'Test description',
    status: 'todo',
  },
  message: 'Dry-run: This todo would be created.',
};

vi.mock('../llm', () => ({
  createLLMClient: vi.fn(() => ({
    isAvailable: () => true,
    generate: vi.fn().mockResolvedValue(mockLLMResponse),
    generateStream: vi.fn().mockImplementation(function* () {
      yield {
        content: 'I',
        done: false,
        delta: 'I',
      };
      yield {
        content: 'I will',
        done: false,
        delta: ' will',
      };
      yield {
        content: 'I will help',
        done: false,
        delta: ' help',
      };
      yield {
        content: 'I will help you',
        done: false,
        delta: ' you',
      };
      yield {
        content: 'I will help you create',
        done: false,
        delta: ' create',
      };
      yield {
        content: 'I will help you create a',
        done: false,
        delta: ' a',
      };
      yield {
        content: 'I will help you create a todo',
        done: false,
        delta: ' todo',
      };
      yield {
        content: 'I will help you create a todo item.',
        done: true,
        usage: mockLLMResponse.usage,
      };
    }),
  })),
}));

describe('SuperBody Agent', () => {
  let agent: SuperBodyAgent;

  beforeEach(() => {
    vi.clearAllMocks();
    agent = createAgent();
  });

  describe('Initialization', () => {
    it('should create an agent instance', () => {
      expect(agent).toBeInstanceOf(SuperBodyAgent);
      expect(agent.isReady()).toBe(true);
    });

    it('should load system prompt', async () => {
      const prompt = (agent as any).systemPrompt;
      expect(prompt).toContain('SuperBody AI');
      expect(prompt).toContain('intelligent personal assistant');
    });
  });

  describe('Tool Execution', () => {
    it('should execute get_todos tool', async () => {
      const result = await agent.executeTool('get_todos', {
        user_id: 'test-user-id',
        access_token: 'test-token',
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should execute create_todo tool with dry-run', async () => {
      const result = await agent.executeTool('create_todo', {
        user_id: 'test-user-id',
        access_token: 'test-token',
        title: 'Test Todo',
        description: 'Test description',
        dry_run: true,
      });

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
      expect(result.wouldCreate).toEqual({
        title: 'Test Todo',
        description: 'Test description',
        status: 'todo',
      });
    });

    it('should execute search_documents tool', async () => {
      const result = await agent.executeTool('search_documents', {
        user_id: 'test-user-id',
        access_token: 'test-token',
        query: 'test query',
        limit: 5,
      });

      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
    });

    it('should handle unknown tool', async () => {
      await expect(() =>
        agent.executeTool('unknown_tool' as any, {})
      ).rejects.toThrow('Tool unknown_tool not found');
    });
  });

  describe('Agent Generation', () => {
    it('should generate a response', async () => {
      const response = await agent.generate('Create a todo for the meeting', {
        userId: 'test-user-id',
        accessToken: 'test-token',
        dryRun: true,
      });

      expect(response).toBeDefined();
      expect(response.content).toBe(mockLLMResponse.content);
      expect(response.usage).toEqual(mockLLMResponse.usage);
    });

    it('should generate streaming response', async () => {
      const chunks: string[] = [];
      for await (const chunk of agent.generateStream('Hello', {
        userId: 'test-user-id',
        accessToken: 'test-token',
      })) {
        chunks.push(chunk.content);
        expect(chunk.done).toBe(false);
      }

      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[chunks.length - 1]).toBe(mockLLMResponse.content);
    });

    it('should handle errors in generation', async () => {
      vi.spyOn(agent as any, 'generate').mockRejectedValue(new Error('Test error'));

      await expect(() =>
        agent.generate('Test message', {
          userId: 'test-user-id',
          accessToken: 'test-token',
        })
      ).rejects.toThrow('Failed to generate response');
    });
  });

  describe('Configuration', () => {
    it('should get available tools', () => {
      const availableTools = agent.getAvailableTools();
      expect(availableTools).toHaveLength(4);
      expect(availableTools.map(t => t.name)).toEqual([
        'get_todos',
        'create_todo',
        'search_documents',
        'get_stock_price',
      ]);
    });

    it('should update system prompt', () => {
      const newPrompt = 'New custom system prompt';
      agent.updateSystemPrompt(newPrompt);
      expect((agent as any).systemPrompt).toBe(newPrompt);
    });
  });
});

describe('Tool Execution Function', () => {
  it('should execute tool by name', async () => {
    const result = await executeTool('get_todos', {
      user_id: 'test-user-id',
      access_token: 'test-token',
    });

    expect(result).toBeDefined();
    expect(typeof result).toBe('object');
  });

  it('should throw error for unknown tool', async () => {
    await expect(() =>
      executeTool('unknown_tool', {})
    ).rejects.toThrow('Tool unknown_tool not found');
  });
});

describe('Tools', () => {
  it('should export tools array', () => {
    expect(tools).toHaveLength(4);
    expect(tools.every(tool => tool.name && tool.description && tool.schema && tool.execute)).toBe(true);
  });
});