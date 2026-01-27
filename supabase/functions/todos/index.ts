import { serve } from 'std/http/server.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/context.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyAuth(req);
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');
    const segments = path.split('/').filter(Boolean);
    const id = segments.length > 1 ? segments[segments.length - 1] : null;

    if (req.method === 'GET') {
      const status = url.searchParams.get('status');
      let query = supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ todos: data ?? [] });
    }

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const title = typeof body.title === 'string' ? body.title.trim() : '';
      if (!title) {
        return jsonResponse({ error: 'title is required' }, 400);
      }

      const payload = {
        user_id: user.id,
        title,
        description: typeof body.description === 'string' ? body.description : null,
        status: typeof body.status === 'string' ? body.status : 'todo',
        due_at: body.due_at ?? null,
      };

      const { data, error } = await supabase
        .from('todos')
        .insert(payload)
        .select('*')
        .single();

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ todo: data }, 201);
    }

    if (req.method === 'PATCH') {
      if (!id) {
        return jsonResponse({ error: 'todo id is required' }, 400);
      }

      const body = await req.json().catch(() => ({}));
      const update: Record<string, unknown> = {};

      if (typeof body.title === 'string') update.title = body.title;
      if (typeof body.description === 'string' || body.description === null) {
        update.description = body.description;
      }
      if (typeof body.status === 'string') update.status = body.status;
      if (body.due_at !== undefined) update.due_at = body.due_at;

      if (Object.keys(update).length === 0) {
        return jsonResponse({ error: 'no fields to update' }, 400);
      }

      const { data, error } = await supabase
        .from('todos')
        .update(update)
        .eq('id', id)
        .eq('user_id', user.id)
        .select('*')
        .single();

      if (error) {
        return jsonResponse({ error: error.message }, 400);
      }

      return jsonResponse({ todo: data });
    }

    return jsonResponse({ error: 'Method not allowed' }, 405, {
      Allow: 'GET, POST, PATCH, OPTIONS',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return jsonResponse({ error: message }, 401);
  }
});
