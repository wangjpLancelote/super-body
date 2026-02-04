import { serve } from 'std/http/server.ts';
import {
  corsHeaders,
  jsonResponse,
  getSupabaseAnonClient,
  getSupabaseAdminClient,
} from '../_shared/context.ts';

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return jsonResponse({ success: false, error: error.message }, 400);
    }

    if (!data.user) {
      return jsonResponse({ success: false, error: 'User creation failed' }, 500);
    }

    const admin = getSupabaseAdminClient();
    const { error: profileError } = await admin
      .from('users')
      .upsert(
        {
          id: data.user.id,
          email: data.user.email,
          role: 'user',
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      return jsonResponse({ success: false, error: profileError.message }, 500);
    }

    return jsonResponse({
      success: true,
      data: {
        user: data.user,
        session: data.session,
      },
    }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    return jsonResponse({ success: false, error: message }, 500);
  }
});
