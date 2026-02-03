# AI Runtime Documentation

## Overview

This document describes the runtime environment for the LangChain AI layer in super-body.

## Runtime Selection: Node.js

**Why Node.js?**
- Strong TypeScript support with `@langchain/core` and `@langchain/community`
- Easy integration with Supabase JavaScript SDK
- Native support for async/await and streaming
- Compatible with both development and production environments

## Environment Setup

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation

```bash
# Install dependencies
cd ai
npm install

# Setup environment variables (single source)
cp ../.env.example ../.env
bash ../scripts/sync-env.sh
```

### Configuration

**Required Environment Variables:**

```
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM Provider
OPENAI_API_KEY=your-openai-api-key
# or for Claude
ANTHROPIC_API_KEY=your-anthropic-api-key

# External APIs
STOCK_API_KEY=your-stock-api-key
STOCK_API_BASE_URL=https://api.example.com
```

## Development

### Running the AI Agent

```bash
# Watch mode
npm run dev

# One-time execution
node dist/agent.ts
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Architecture

### Key Components

1. **vector.ts** - Supabase pgvector integration
2. **tools.ts** - LangChain tool definitions
3. **agent.ts** - Agent orchestration logic
4. **prompts/system.md** - System prompts for the agent

### Tool Execution Flow

```
User Query
    ↓
LangChain Agent
    ↓
Tool Selection
    ├─ getTodos(user_id)
    ├─ createTodo(user_id, payload)
    ├─ searchDocuments(user_id, query)
    └─ getStockPrice(symbol)
    ↓
Tool Execution (with dry-run mode)
    ↓
Response Generation
```

## Dry-Run Mode

All write operations (createTodo, updateTodo, deleteTodo) execute in **dry-run mode** by default:

```typescript
// Dry-run response example
{
  "dryRun": true,
  "action": "create_todo",
  "wouldCreate": {
    "title": "Review quarterly report",
    "description": "Complete review by Friday",
    "dueAt": "2024-01-31T17:00:00Z"
  },
  "requiresApproval": true
}
```

To enable actual execution, human approval is required via:
- `POST /ai/assistant` with `approveExecution: true` flag
- Or explicit user confirmation in the UI

## Deployment

### Edge Function Integration

The AI layer is consumed via Supabase Edge Functions:

```
Client → Supabase Client → POST /ai/assistant → AI Agent (this layer)
```

See `supabase/functions/ai-assistant/index.ts` for the integration point.

## Error Handling

All errors are logged with:
- Timestamp
- User ID
- Query context
- Error message and stack trace

Logs are stored in Supabase for audit purposes.

## Vector Store

Embeddings are computed for:
- **documents** table (full content vectors)
- **todos** table (title + description vectors)

Similarity search is performed using Supabase's pgvector extension.

## References

- [LangChain JS Documentation](https://js.langchain.com)
- [Supabase Vector Store Guide](https://supabase.com/docs/guides/ai)
- [pgvector Extension](https://github.com/pgvector/pgvector)
