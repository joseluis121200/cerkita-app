import { createClient, type SupabaseClient, type User } from 'npm:@supabase/supabase-js@2';

// Cliente con service role: SOLO dentro de Edge Functions, nunca en la app (AGENTS.md 7).
export function adminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (url === undefined || key === undefined) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Usuario que llama, a partir de su JWT (o null si no hay sesión válida). */
export async function userFromRequest(req: Request, admin: SupabaseClient): Promise<User | null> {
  const header = req.headers.get('Authorization') ?? '';
  const jwt = header.replace(/^Bearer\s+/i, '').trim();
  if (jwt.length === 0) {
    return null;
  }
  const { data, error } = await admin.auth.getUser(jwt);
  if (error !== null) {
    console.warn('Invalid JWT', error.message);
    return null;
  }
  return data.user;
}

/** Los crons de pg_cron llaman con "Bearer <CRON_SECRET>" (ver 0002_cron_setup.sql). */
export function isCronRequest(req: Request): boolean {
  const secret = Deno.env.get('CRON_SECRET');
  if (secret === undefined || secret.length < 16) {
    return false;
  }
  return req.headers.get('Authorization') === `Bearer ${secret}`;
}
