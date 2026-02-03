# SuperBody AI Module

The AI module provides LangChain integration for the SuperBody application, supporting both OpenAI and Anthropic LLM providers with intelligent tool execution and conversation capabilities.

## Features

- **Multi-Provider Support**: OpenAI (GPT-4, GPT-3.5) and Anthropic (Claude 3)
- **Tool Integration**: Built-in tools for todos, documents, and stock prices
- **Dry-Run Mode**: Safe execution with preview before committing changes
- **Streaming Responses**: Real-time streaming chat support
- **Conversation Context**: Maintains conversation history for context-aware responses
- **Embeddings**: Semantic document search with vector embeddings

## Quick Start

### Installation

```bash
cd ai
npm install
```

### Basic Usage

```typescript
import { createAgent, getAvailableTools } from './ai';

// Create agent with default configuration
const agent = createAgent();

// Generate a response
const response = await agent.generate('Create a todo for the meeting', {
  userId: 'user-id-here',
  accessToken: 'access-token-here',
  dryRun: true,
});

console.log(response.content);
```

### Streaming Responses

```typescript
// Create streaming response
for await (const chunk of agent.generateStream('What todos do I have?', {
  userId: 'user-id-here',
  accessToken: 'access-token-here',
})) {
  console.log(chunk.content);
}
```

## Configuration

### Environment Variables

Use the repo root `.env` as the single source of truth:

```bash
cp ../.env.example ../.env
bash ../scripts/sync-env.sh
```

The sync script generates `ai/.env.local` and other module env files.

See root `.env.example` for the full list of supported keys and comments.

### LLM Configuration

```typescript
import { LLMClient, LLMProvider } from './ai/llm';

const client = new LLMClient({
  provider: 'openai', // or 'anthropic'
  model: 'gpt-4-turbo', // or 'claude-3-sonnet-20240229'
  maxTokens: 1000,
  temperature: 0.7,
});
```

## Tools

### Built-in Tools

1. **get_todos**: Retrieve user's todo list
   ```typescript
   const result = await agent.executeTool('get_todos', {
     user_id: 'user-id',
     access_token: 'token',
     status: 'todo'
   });
   ```

2. **create_todo**: Create new todos with dry-run mode
   ```typescript
   const result = await agent.executeTool('create_todo', {
     user_id: 'user-id',
     access_token: 'token',
     title: 'Meeting preparation',
     description: 'Prepare slides for the meeting',
     dry_run: true
   });
   ```

3. **search_documents**: Semantic document search
   ```typescript
   const result = await agent.executeTool('search_documents', {
     user_id: 'user-id',
     access_token: 'token',
     query: 'project documentation',
     limit: 5
   });
   ```

4. **get_stock_price**: Retrieve current stock prices
   ```typescript
   const result = await agent.executeTool('get_stock_price', {
     symbol: 'AAPL'
   });
   ```

### Custom Tools

```typescript
import { z } from 'zod';

const customTool = {
  name: 'custom_tool',
  description: 'Description of your custom tool',
  schema: z.object({
    param1: z.string().describe('Parameter description'),
    param2: z.number().describe('Number parameter'),
  }),
  async execute({ param1, param2 }: { param1: string; param2: number }) {
    // Tool implementation
    return { success: true, result: `Processed ${param1} with ${param2}` };
  },
};

// Add to tools array
tools.push(customTool);
```

## System Prompts

The system behavior is controlled by prompts in `ai/prompts/system.md`. You can customize:

- Safety guidelines
- Tool usage rules
- Conversation style
- Response format
- Security requirements

### Updating System Prompt

```typescript
import { SuperBodyAgent } from './ai/agent';

const agent = new SuperBodyAgent({
  llmClient,
  systemPrompt: 'Your custom system prompt here...',
});
```

## Edge Functions

### AI Assistant Edge Function

Located at `supabase/functions/ai-assistant/index.ts`, provides:

- Authentication via Supabase
- Tool execution
- Streaming responses
- Request logging
- Error handling

### API Endpoints

```
POST /functions/v1/ai-assistant
Headers: Authorization: Bearer <access_token>
Body: {
  action: 'chat' | 'chat_stream' | 'search_documents',
  input: 'User message',
  stream: false,
  dry_run: true,
  context: {
    userId: 'user-id',
    chatHistory: []
  }
}
```

### Streaming Response Format

Server-Sent Events (SSE):
```
data: {"type": "chunk", "content": "Hello", "done": false}

data: {"type": "chunk", "content": "Hello world", "done": false}

data: {"type": "end", "message": "Stream completed"}
```

## Web App Integration

### Service Layer

The `src/services/aiService.ts` provides the web interface:

```typescript
import { AIService } from '@/services/aiService';

// Regular chat
const response = await AIService.chat({
  message: 'Hello',
  context: { userId: 'user-id' }
}, accessToken);

// Streaming chat
for await (const chunk of AIService.chatStream({
  message: 'Hello',
  context: { userId: 'user-id' }
}, accessToken)) {
  console.log(chunk.content);
}
```

### React Components

- `AIAssistant.tsx`: Basic chat interface
- `AIAssistantStreaming.tsx`: Streaming chat interface
- `ChatInput.tsx`: Message input component
- `ChatHistory.tsx`: Message display component

## Security Features

### Dry-Run Mode
- All write operations default to dry-run mode
- Shows what would be created before execution
- Requires explicit confirmation for execution

### Authentication
- Validates user tokens for all requests
- Access control via Supabase auth
- Secure tool execution context

### Rate Limiting
- Built-in rate limiting for API calls
- Error handling for quota limits
- Graceful degradation

## Development

### Building

```bash
cd ai
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Check environment variables
   - Verify API keys are valid

2. **Streaming Issues**
   - Ensure browser supports SSE
   - Check network connection

3. **Tool Execution Errors**
   - Verify user authentication
   - Check tool schema validation
   - Review dry-run mode settings

### Debug Mode

Enable debug logging:

```typescript
const agent = createAgent({
  llmClient,
  // ... other config
});

// Enable detailed logging
console.log('Available tools:', agent.getAvailableTools());
```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include unit tests for new features
4. Update documentation for changes

## License

This project is part of the SuperBody application.