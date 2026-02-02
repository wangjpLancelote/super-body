/**
 * Test setup for the AI module
 */

// Set up test environment
process.env.NODE_ENV = 'test';

// Mock environment variables for testing
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.SUPABASE_URL = 'test-url';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

// Mock console.error to avoid noise during tests
global.console.error = vi.fn();

// Add custom matchers if needed
expect.extend({
  toBeString(received: unknown) {
    return {
      pass: typeof received === 'string',
      message: () => `Expected ${received} to be a string`,
    };
  },
});