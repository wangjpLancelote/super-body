/**
 * LLM Client for OpenAI and Anthropic integration
 * Supports both streaming and non-streaming responses
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type LLMProvider = 'openai' | 'anthropic';
export type LLMModel =
  | 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo'
  | 'claude-3-haiku-20240307' | 'claude-3-sonnet-20240229' | 'claude-3-opus-20240229';

export interface LLMConfig {
  provider: LLMProvider;
  model: LLMModel;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

export interface StreamingLLMResponse {
  content: string;
  done: boolean;
  delta?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class LLMClient {
  private openai: OpenAI | null = null;
  private anthropic: Anthropic | null = null;
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = {
      maxTokens: 1000,
      temperature: 0.7,
      ...config,
    };

    this.initializeProvider();
  }

  private initializeProvider() {
    if (this.config.provider === 'openai') {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
        baseURL: this.config.baseUrl,
      });
    } else if (this.config.provider === 'anthropic') {
      this.anthropic = new Anthropic({
        apiKey: this.config.apiKey || process.env.ANTHROPIC_API_KEY,
      });
    }
  }

  /**
   * Generate a non-streaming response
   */
  async generate(
    messages: LLMMessage[],
    options: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): Promise<LLMResponse> {
    const finalMessages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...messages]
      : messages;

    try {
      if (this.config.provider === 'openai' && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: finalMessages,
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
        });

        return {
          content: response.choices[0]?.message?.content || '',
          usage: {
            promptTokens: response.usage?.prompt_tokens || 0,
            completionTokens: response.usage?.completion_tokens || 0,
            totalTokens: response.usage?.total_tokens || 0,
          },
          finishReason: response.choices[0]?.finish_reason,
        };
      } else if (this.config.provider === 'anthropic' && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: this.config.model,
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          messages: finalMessages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.content,
          })),
        });

        return {
          content: response.content[0]?.text || '',
          usage: {
            promptTokens: response.usage?.input_tokens || 0,
            completionTokens: response.usage?.output_tokens || 0,
            totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0),
          },
          finishReason: response.stop_reason,
        };
      }

      throw new Error('No LLM provider initialized');
    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a streaming response
   */
  async *generateStream(
    messages: LLMMessage[],
    options: {
      systemPrompt?: string;
      maxTokens?: number;
      temperature?: number;
    } = {}
  ): AsyncIterable<StreamingLLMResponse> {
    const finalMessages = options.systemPrompt
      ? [{ role: 'system' as const, content: options.systemPrompt }, ...messages]
      : messages;

    try {
      if (this.config.provider === 'openai' && this.openai) {
        const stream = await this.openai.chat.completions.create({
          model: this.config.model,
          messages: finalMessages,
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          stream: true,
        });

        let content = '';
        let usage: any;

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          if (delta) {
            content += delta;
            yield {
              content,
              done: false,
              delta,
            };
          }

          if (chunk.usage) {
            usage = chunk.usage;
          }
        }

        yield {
          content,
          done: true,
          usage: usage ? {
            promptTokens: usage.prompt_tokens || 0,
            completionTokens: usage.completion_tokens || 0,
            totalTokens: usage.total_tokens || 0,
          } : undefined,
        };
      } else if (this.config.provider === 'anthropic' && this.anthropic) {
        const stream = await this.anthropic.messages.create({
          model: this.config.model,
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          messages: finalMessages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            content: msg.content,
          })),
          stream: true,
        });

        let content = '';
        let inputTokens = 0;
        let outputTokens = 0;

        for await (const event of stream) {
          if (event.type === 'content_block_delta') {
            const delta = event.delta?.text || '';
            if (delta) {
              content += delta;
              yield {
                content,
                done: false,
                delta,
              };
            }
          } else if (event.type === 'message_delta') {
            outputTokens = event.usage?.output_tokens || 0;
          } else if (event.type === 'message_start') {
            inputTokens = event.usage?.input_tokens || 0;
          }
        }

        yield {
          content,
          done: true,
          usage: {
            promptTokens: inputTokens,
            completionTokens: outputTokens,
            totalTokens: inputTokens + outputTokens,
          },
        };
      } else {
        throw new Error('No LLM provider initialized');
      }
    } catch (error) {
      console.error('LLM streaming error:', error);
      throw new Error(`Failed to generate streaming response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if the provider is available
   */
  isAvailable(): boolean {
    return (this.config.provider === 'openai' && this.openai) ||
           (this.config.provider === 'anthropic' && this.anthropic);
  }

  /**
   * Get available models for the provider
   */
  static getAvailableModels(provider: LLMProvider): LLMModel[] {
    if (provider === 'openai') {
      return ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'];
    } else if (provider === 'anthropic') {
      return ['claude-3-haiku-20240307', 'claude-3-sonnet-20240229', 'claude-3-opus-20240229'];
    }
    return [];
  }
}

/**
 * Create LLM client from environment variables
 */
export function createLLMClient(config?: Partial<LLMConfig>): LLMClient {
  const provider = config?.provider ||
    (process.env.OPENAI_API_KEY ? 'openai' :
     process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai');

  return new LLMClient({
    provider,
    model: config?.model || getDefaultModel(provider),
    apiKey: config?.apiKey,
    baseUrl: config?.baseUrl,
    maxTokens: config?.maxTokens,
    temperature: config?.temperature,
  });
}

/**
 * Get default model for provider
 */
function getDefaultModel(provider: LLMProvider): LLMModel {
  if (provider === 'openai') {
    return 'gpt-3.5-turbo';
  } else if (provider === 'anthropic') {
    return 'claude-3-haiku-20240307';
  }
  return 'gpt-3.5-turbo';
}

/**
 * Environment-based LLM client factory
 */
export function getEnvironmentLLMClient(): LLMClient {
  return createLLMClient();
}