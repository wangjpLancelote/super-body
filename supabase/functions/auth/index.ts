import { serve } from 'std/http/server.ts';
import { getUserContext } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/context.ts';

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
    const { user, role } = await getUserContext(req);

    return jsonResponse({
      success: true,
      data: {
        user,
        role,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return jsonResponse({ success: false, error: message }, 401);
  }
});
