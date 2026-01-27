import type { User } from 'supabase-edge';
import { getSupabaseClient } from './context.ts';

export type UserContext = {
  user: User;
  role: 'user' | 'premium' | 'admin';
  jwt: string;
};

function getBearerToken(req: Request): string | null {
  const header = req.headers.get('Authorization');
  if (!header) return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export async function verifyAuth(req: Request) {
  const token = getBearerToken(req);
  if (!token) {
    throw new Error('Missing Authorization header');
  }

  const supabase = getSupabaseClient(token);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw new Error('Invalid or expired token');
  }

  return { user: data.user, supabase, jwt: token };
}

export async function getUserContext(req: Request): Promise<UserContext> {
  const { user, supabase, jwt } = await verifyAuth(req);
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !data?.role) {
    return { user, role: 'user', jwt };
  }

  return { user, role: data.role, jwt };
}
