/**
 * Supabase Configuration for AI Assistant
 *
 * This file provides configuration for deploying the AI Assistant Edge Function.
 * Add this to your supabase/config.ts file or include in your deployment.
 */

export const aiAssistantConfig = {
  // Function configuration
  ai_assistant: {
    id: 'ai-assistant',
    name: 'AI Assistant',
    domains: ['localhost', 'your-supabase-url.com'],
    verify_jwt: true,
    cors: true,
    max_age: 3600,
    headers: {
      'Content-Type': 'application/json',
    },
    environment: {
      // Environment variables
      OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY') || '',
      ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY') || '',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') || '',
      SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') || '',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
      AI_ASSISTANT_DRY_RUN: Deno.env.get('AI_ASSISTANT_DRY_RUN') || 'true',
      AI_ASSISTANT_MODEL: Deno.env.get('AI_ASSISTANT_MODEL') || 'gpt-3.5-turbo',
      AI_ASSISTANT_MAX_TOKENS: Deno.env.get('AI_ASSISTANT_MAX_TOKENS') || '2000',
      AI_ASSISTANT_TEMPERATURE: Deno.env.get('AI_ASSISTANT_TEMPERATURE') || '0.7',
    },
    secrets: [
      'OPENAI_API_KEY',
      'ANTHROPIC_API_KEY',
      'SUPABASE_URL',
      'SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ],
    limits: {
      timeout_ms: 30000,
      memory_mb: 256,
      payload_mb: 10,
    },
  },
};

// Example usage in supabase/config.ts:
/*
import { aiAssistantConfig } from './functions/ai-assistant/supabase-config';

export const config = {
  // ... other configurations
  functions: {
    ...aiAssistantConfig,
  },
};
*/