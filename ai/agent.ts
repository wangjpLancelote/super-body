/**
 * LangChain Agent for SuperBody AI
 * Integrates tools with LLM providers for intelligent task automation
 */

import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import { ChatPromptTemplate, MessagesAnnotation } from '@langchain/core/prompts';
import { createToolCallingAgent } from 'langchain/agents';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { LLMClient, LLMResponse, StreamingLLMResponse } from './llm';
import { tools, executeTool } from './tools';
import fs from 'fs/promises';
import path from 'path';

// System prompt from markdown file
const SYSTEM_PROMPT_PATH = './ai/prompts/system.md';

export interface AgentConfig {
  llmClient: LLMClient;
  systemPrompt?: string;
  maxIterations?: number;
  returnIntermediateSteps?: boolean;
}

export interface AgentResponse {
  content: string;
  intermediateSteps?: Array<{
    action: { tool: string; input: any };
    observation: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamingAgentResponse {
  content: string;
  done: boolean;
  delta?: string;
  intermediateSteps?: Array<{
    action: { tool: string; input: any };
    observation: string;
  }>;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class SuperBodyAgent {
  private llmClient: LLMClient;
  private systemPrompt: string;
  private maxIterations: number;
  private returnIntermediateSteps: boolean;

  constructor(config: AgentConfig) {
    this.llmClient = config.llmClient;
    this.maxIterations = config.maxIterations || 10;
    this.returnIntermediateSteps = config.returnIntermediateSteps ?? false;

    // Load system prompt
    this.systemPrompt = config.systemPrompt || this.loadSystemPrompt();
  }

  private async loadSystemPrompt(): Promise<string> {
    try {
      const promptPath = path.resolve(SYSTEM_PROMPT_PATH);
      const content = await fs.readFile(promptPath, 'utf-8');
      return content;
    } catch (error) {
      console.warn('Failed to load system prompt, using default');
      return this.getDefaultSystemPrompt();
    }
  }

  private getDefaultSystemPrompt(): string {
    return `You are SuperBody AI, an intelligent personal assistant integrated into the SuperBody application.

Your purpose is to help users manage their daily tasks, organize documents, and provide helpful information while maintaining safety and security.

Core Guidelines:
- Always default to dry-run mode for any actions that modify data
- Clearly indicate when you're in dry-run mode vs execution mode
- Never execute actions without explicit user confirmation
- Ask for confirmation before running any destructive operations

Available Tools:
- get_todos: Retrieve user's todo list (filtered by optional status)
- create_todo: Create new todos with dry-run safety mode
- search_documents: Find relevant documents using semantic similarity
- get_stock_price: Retrieve current stock prices for given symbols

Be helpful, concise, and professional. Use clear and natural language.`;
  }

  /**
   * Create a LangChain agent with the configured tools and LLM
   */
  private async createAgent() {
    // Create prompt template
    const prompt = await ChatPromptTemplate.fromMessages([
      new SystemMessage(this.systemPrompt),
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    // Create agent
    const agent = await createOpenAIFunctionsAgent({
      llm: this.llmClient,
      tools,
      prompt,
    });

    // Create executor
    return AgentExecutor.fromAgentAndTools({
      agent,
      tools,
      returnIntermediateSteps: this.returnIntermediateSteps,
      maxIterations: this.maxIterations,
    });
  }

  /**
   * Generate a non-streaming response
   */
  async generate(
    input: string,
    options: {
      userId?: string;
      accessToken?: string;
      dryRun?: boolean;
    } = {}
  ): Promise<AgentResponse> {
    const agent = await this.createAgent();

    // Add user context if provided
    const enhancedInput = this.enhanceInputWithUserContext(input, options);

    try {
      const result = await agent.invoke({
        input: enhancedInput,
        userId: options.userId,
        accessToken: options.accessToken,
        dryRun: options.dryRun ?? true,
      });

      return {
        content: result.output,
        intermediateSteps: this.returnIntermediateSteps ? result.intermediateSteps : undefined,
      };
    } catch (error) {
      console.error('Agent generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(
    input: string,
    options: {
      userId?: string;
      accessToken?: string;
      dryRun?: boolean;
    } = {}
  ): AsyncIterable<StreamingAgentResponse> {
    // For streaming, we'll use a simpler approach with direct LLM calls
    // This allows us to stream responses while maintaining tool integration

    const enhancedInput = this.enhanceInputWithUserContext(input, options);
    const systemPromptWithTools = `${this.systemPrompt}

Current User Context:
- User ID: ${options.userId || 'unknown'}
- Access Token: ${options.accessToken ? 'provided' : 'none'}
- Mode: ${options.dryRun === false ? 'execution' : 'dry-run'}

User Request: ${enhancedInput}

Think step by step about what tools you need to use to help the user. For task creation, always use dry-run mode first and ask for confirmation before execution.`;

    // Create a system message
    const messages = [
      new SystemMessage(systemPromptWithTools),
      new HumanMessage(enhancedInput),
    ];

    let content = '';
    let intermediateSteps: Array<{
      action: { tool: string; input: any };
      observation: string;
    }> = [];

    try {
      // Stream the LLM response
      for await (const chunk of this.llmClient.generateStream(messages)) {
        if (chunk.delta) {
          content += chunk.delta;
          yield {
            content,
            done: chunk.done,
            delta: chunk.delta,
            intermediateSteps: intermediateSteps.length > 0 ? [...intermediateSteps] : undefined,
            usage: chunk.usage,
          };

          // If we have a tool call in the response, execute it
          if (this.containsToolCall(content)) {
            const toolResult = await this.executeToolFromResponse(content, options);
            if (toolResult) {
              intermediateSteps.push(toolResult);
              content += `\n\nTool Result: ${toolResult.observation}`;
            }
          }
        }

        if (chunk.done) {
          yield {
            content,
            done: true,
            intermediateSteps: intermediateSteps.length > 0 ? intermediateSteps : undefined,
            usage: chunk.usage,
          };
        }
      }
    } catch (error) {
      console.error('Agent streaming error:', error);
      throw new Error(`Failed to generate streaming response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhance input with user context
   */
  private enhanceInputWithUserContext(input: string, options: any): string {
    let enhanced = input;

    if (options.userId) {
      enhanced = `[User ID: ${options.userId}] ${enhanced}`;
    }

    if (options.dryRun === false) {
      enhanced = `[EXECUTION MODE] ${enhanced}`;
    } else {
      enhanced = `[DRY-RUN MODE] ${enhanced}`;
    }

    return enhanced;
  }

  /**
   * Check if response contains tool calls
   */
  private containsToolCall(response: string): boolean {
    const toolTriggers = [
      'create_todo',
      'get_todos',
      'search_documents',
      'get_stock_price',
      'tool',
      'function',
      'call'
    ];

    return toolTriggers.some(trigger =>
      response.toLowerCase().includes(trigger)
    );
  }

  /**
   * Execute tool from response text
   */
  private async executeToolFromResponse(response: string, options: any): Promise<{
    action: { tool: string; input: any };
    observation: string;
  } | null> {
    try {
      // Parse tool call from response (simplified approach)
      const toolMatch = response.match(/(?:create_todo|get_todos|search_documents|get_stock_price)\s*[:\s]*\{([^}]+)\}/i);

      if (!toolMatch) return null;

      const toolCall = toolMatch[0];
      const toolName = toolMatch[1].split(':')[0]?.trim() || 'create_todo';

      // Parse arguments (simplified)
      const argsMatch = toolCall.match(/\{([^}]+)\}/);
      if (!argsMatch) return null;

      let args: any = {};
      try {
        // Simple JSON parsing for structured arguments
        args = JSON.parse(`{${argsMatch[1]}}`);
      } catch {
        // Fallback for simple key=value pairs
        const pairs = argsMatch[1].split(',');
        pairs.forEach(pair => {
          const [key, value] = pair.split(':');
          if (key && value) {
            args[key.trim()] = value.trim().replace(/['"]/g, '');
          }
        });
      }

      // Add required authentication if needed
      if (toolName.includes('todo') || toolName.includes('documents')) {
        args.user_id = options.userId;
        args.access_token = options.accessToken;
      }

      // Execute the tool
      const result = await executeTool(toolName, args);

      return {
        action: { tool: toolName, input: args },
        observation: JSON.stringify(result, null, 2),
      };
    } catch (error) {
      console.error('Tool execution error:', error);
      return {
        action: { tool: 'unknown', input: {} },
        observation: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Execute a tool directly
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    return executeTool(toolName, args);
  }

  /**
   * Get available tools
   */
  getAvailableTools() {
    return tools;
  }

  /**
   * Update system prompt
   */
  updateSystemPrompt(newPrompt: string) {
    this.systemPrompt = newPrompt;
  }

  /**
   * Check if agent is ready
   */
  isReady(): boolean {
    return this.llmClient.isAvailable();
  }
}

/**
 * Create agent from environment
 */
export function createAgent(config?: Partial<AgentConfig>): SuperBodyAgent {
  const llmClient = new LLMClient({
    provider: 'openai', // Default provider
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    ...config?.llmClient,
  });

  return new SuperBodyAgent({
    llmClient,
    maxIterations: 10,
    returnIntermediateSteps: false,
    ...config,
  });
}

/**
 * Environment-based agent factory
 */
export function getEnvironmentAgent(): SuperBodyAgent {
  return createAgent();
}