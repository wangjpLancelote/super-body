import { serve } from 'std/http/server.ts';
import { verifyAuth } from '../_shared/auth.ts';
import { corsHeaders, jsonResponse } from '../_shared/context.ts';

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function deriveType(contentType?: string): string {
  if (!contentType) return 'other';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  if (contentType === 'application/pdf') return 'document';
  return 'other';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user, supabase } = await verifyAuth(req);

    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, {
        Allow: 'POST, OPTIONS',
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.name === 'string' ? body.name.trim() : '';
    if (!rawName) {
      return jsonResponse({ error: 'name is required' }, 400);
    }

    const bucket = typeof body.bucket === 'string' ? body.bucket : 'user-files';
    const contentType =
      typeof body.contentType === 'string'
        ? body.contentType
        : 'application/octet-stream';
    const size = typeof body.size === 'number' ? body.size : null;
    const type =
      typeof body.type === 'string' ? body.type : deriveType(contentType);

    const safeName = sanitizeFileName(rawName);
    const storagePath = `${user.id}/${crypto.randomUUID()}-${safeName}`;

    const { data: signed, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(storagePath);

    if (signedError || !signed) {
      return jsonResponse(
        { error: signedError?.message ?? 'failed to create signed url' },
        400,
      );
    }

    const { data: fileRow, error: insertError } = await supabase
      .from('files')
      .insert({
        user_id: user.id,
        name: rawName,
        type,
        size,
        storage_path: storagePath,
      })
      .select('*')
      .single();

    if (insertError) {
      return jsonResponse({ error: insertError.message }, 400);
    }

    return jsonResponse(
      {
        upload: {
          bucket,
          path: storagePath,
          signedUrl: signed.signedUrl,
          token: signed.token,
        },
        file: fileRow,
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return jsonResponse({ error: message }, 401);
  }
});
