/**
 * AI Module Export
 *
 * Main entry point for the AI integration layer
 */

export { LLMClient, createLLMClient, getEnvironmentLLMClient, type LLMProvider, type LLMModel, type LLMConfig, type LLMMessage, type LLMResponse, type StreamingLLMResponse } from './llm';
export { SuperBodyAgent, createAgent, getEnvironmentAgent, type AgentConfig, type AgentResponse, type StreamingAgentResponse } from './agent';
export { getTodosTool, createTodoTool, searchDocumentsTool, getStockPriceTool, tools, executeTool } from './tools';
export { createLLMClient as createOpenAI, createLLMClient as createAnthropic } from './llm';

// Default configuration
export const defaultConfig = {
  llm: {
    provider: 'openai' as const,
    model: 'gpt-3.5-turbo' as const,
    maxTokens: 1000,
    temperature: 0.7,
  },
  agent: {
    maxIterations: 10,
    returnIntermediateSteps: false,
  },
  tools: {
    dryRun: true,
  },
};

// Convenience functions
export async function createAIAssistant(config?: {
  llmProvider?: 'openai' | 'anthropic';
  model?: string;
  maxTokens?: number;
  temperature?: number;
}) {
  const llmClient = createLLMClient({
    provider: config?.llmProvider || 'openai',
    model: config?.model || 'gpt-3.5-turbo',
    maxTokens: config?.maxTokens,
    temperature: config?.temperature,
  });

  return createAgent({
    llmClient,
    maxIterations: 10,
    returnIntermediateSteps: true,
  });
}

// Initialize agent with environment variables
export const agent = getEnvironmentAgent();
export const llmClient = getEnvironmentLLMClient();