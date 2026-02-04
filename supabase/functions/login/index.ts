import { serve } from 'std/http/server.ts';
import { corsHeaders, jsonResponse, getSupabaseAnonClient } from '../_shared/context.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405, {
      Allow: 'POST, OPTIONS',
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return jsonResponse({ success: false, error: 'email and password are required' }, 400);
    }

    const supabase = getSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 401);
    }

    return jsonResponse({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return jsonResponse({ success: false, error: message }, 500);
  }
});
