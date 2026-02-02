import { serve } from 'std/http/server.ts';
import { getUserContext } from '../_shared/auth.ts';
import { corsHeaders, getSupabaseClient, jsonResponse } from '../_shared/context.ts';

// Import LangChain and AI components
import { createLLMClient, LLMProvider } from '../../ai/llm.ts';
import { createAgent, SuperBodyAgent } from '../../ai/agent.ts';

// Create agent instance (will be initialized on first request)
let agent: SuperBodyAgent | null = null;

async function createEmbedding(input: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY') ?? '';
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY');
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input,
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload?.error?.message ?? 'Embedding request failed');
  }

  return payload?.data?.[0]?.embedding as number[] | undefined;
}

async function initializeAgent() {
  if (!agent) {
    // Determine provider from environment
    const provider: LLMProvider =
      Deno.env.get('OPENAI_API_KEY') ? 'openai' :
      Deno.env.get('ANTHROPIC_API_KEY') ? 'anthropic' : 'openai';

    const llmClient = createLLMClient({
      provider,
      model: provider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307',
      maxTokens: 2000,
      temperature: 0.7,
    });

    agent = createAgent({
      llmClient,
      systemPrompt: await Deno.readTextFile('./ai/prompts/system.md').catch(() => undefined),
      maxIterations: 10,
      returnIntermediateSteps: true,
    });
  }
  return agent;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, {
      Allow: 'POST, OPTIONS',
    });
  }

  try {
    const { user, role, jwt } = await getUserContext(req);
    const supabase = getSupabaseClient(jwt);
    const body = await req.json().catch(() => ({}));

    // Determine action
    const action = typeof body.action === 'string' ? body.action :
                   body.stream ? 'chat_stream' : 'chat';

    // Initialize agent
    await initializeAgent();

    // Log the request
    await supabase.from('ai_logs').insert({
      user_id: user.id,
      query: body?.input ?? body?.query ?? '',
      action,
      metadata: {
        role,
        stream: body.stream || false,
        dry_run: body.dry_run ?? true,
      },
      is_dry_run: body.dry_run ?? true,
    });

    // Handle different actions
    if (action === 'search_documents') {
      return await handleSearchDocuments(body, user, supabase);
    } else if (action === 'chat_stream') {
      return await handleChatStream(body, user, jwt, supabase);
    } else if (action === 'chat') {
      return await handleChat(body, user, jwt, supabase);
    }

    return jsonResponse({ error: `Unsupported action: ${action}` }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    console.error('AI Assistant Error:', error);
    return jsonResponse({ error: message }, 500);
  }
});

async function handleSearchDocuments(body: any, user: any, supabase: any) {
  const query = typeof body.query === 'string' ? body.query.trim() : '';
  const limit = typeof body.limit === 'number' ? body.limit : 5;

  if (!query) {
    return jsonResponse({ error: 'query is required' }, 400);
  }

  const embedding = await createEmbedding(query);
  if (!embedding) {
    return jsonResponse({ error: 'Failed to create embedding' }, 500);
  }

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_count: limit,
    p_user_id: user.id,
  });

  if (error) {
    return jsonResponse({ error: error.message }, 400);
  }

  const result = {
    success: true,
    action: 'search_documents',
    query,
    count: data?.length ?? 0,
    documents: data ?? [],
  };

  await supabase.from('ai_logs').update({
    result,
  }).eq('user_id', user.id).eq('query', query);

  return jsonResponse(result);
}

async function handleChat(body: any, user: any, jwt: string, supabase: any) {
  const { agent } = await initializeAgent();

  try {
    const response = await agent.generate(body.input, {
      userId: user.id,
      accessToken: jwt,
      dry_run: body.dry_run ?? true,
    });

    // Update the log with results
    await supabase.from('ai_logs').update({
      result: response,
      is_dry_run: body.dry_run ?? true,
    }).eq('user_id', user.id).eq('query', body.input);

    return jsonResponse({
      success: true,
      response: response.content,
      intermediateSteps: response.intermediateSteps,
      usage: response.usage,
      role: 'assistant',
    });
  } catch (error) {
    await supabase.from('ai_logs').update({
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      is_dry_run: body.dry_run ?? true,
    }).eq('user_id', user.id).eq('query', body.input);

    throw error;
  }
}

async function handleChatStream(body: any, user: any, jwt: string, supabase: any) {
  const { agent } = await initializeAgent();

  try {
    // Create a streaming response
    const headers = {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate the streaming response
          for await (const chunk of agent.generateStream(body.input, {
            userId: user.id,
            accessToken: jwt,
            dry_run: body.dry_run ?? true,
          })) {
            const data = JSON.stringify({
              type: 'chunk',
              content: chunk.content,
              done: chunk.done,
              delta: chunk.delta,
              intermediateSteps: chunk.intermediateSteps,
              usage: chunk.usage,
            });

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          }

          // Send final message
          const finalData = JSON.stringify({
            type: 'end',
            message: 'Stream completed',
          });

          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers,
    });
  } catch (error) {
    await supabase.from('ai_logs').update({
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      is_dry_run: body.dry_run ?? true,
    }).eq('user_id', user.id).eq('query', body.input);

    throw error;
  }
}
