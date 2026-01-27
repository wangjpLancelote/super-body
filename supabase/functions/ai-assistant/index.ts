import { serve } from 'std/http/server.ts';
import { getUserContext } from '../_shared/auth.ts';
import { corsHeaders, getSupabaseClient, jsonResponse } from '../_shared/context.ts';

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
    const action = typeof body.action === 'string' ? body.action : 'chat';

    if (action === 'search_documents') {
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
        action,
        query,
        count: data?.length ?? 0,
        documents: data ?? [],
      };

      await supabase.from('ai_logs').insert({
        user_id: user.id,
        query,
        action,
        result,
        is_dry_run: true,
      });

      return jsonResponse(result);
    }

    const message = `Unsupported action: ${action}`;
    await supabase.from('ai_logs').insert({
      user_id: user.id,
      query: body?.input ?? '',
      action,
      result: { error: message },
      is_dry_run: true,
    });

    return jsonResponse({ error: message, role }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return jsonResponse({ error: message }, 401);
  }
});
