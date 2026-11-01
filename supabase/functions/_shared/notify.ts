import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

// Envío de push (Expo Push API) y email (Resend). Nunca se registran datos personales.
export type PushMessage = {
  title: string;
  body: string;
  priority?: 'default' | 'high';
  data?: Record<string, string>;
};

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

export async function pushTokensFor(admin: SupabaseClient, userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) {
    return [];
  }
  const { data, error } = await admin.from('device_push_tokens').select('expo_push_token').in('user_id', userIds);
  if (error !== null) {
    console.error('push tokens query failed', error.message);
    return [];
  }
  return (data ?? []).map((row: { expo_push_token: string }) => row.expo_push_token);
}

export async function sendPush(tokens: string[], message: PushMessage): Promise<void> {
  if (tokens.length === 0) {
    return;
  }
  const accessToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (accessToken !== undefined) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  for (let i = 0; i < tokens.length; i += 100) {
    const batch = tokens.slice(i, i + 100).map((to) => ({
      to,
      title: message.title,
      body: message.body,
      sound: 'default',
      priority: message.priority ?? 'default',
      data: message.data ?? {},
    }));
    const response = await fetch(EXPO_PUSH_URL, { method: 'POST', headers, body: JSON.stringify(batch) });
    if (!response.ok) {
      console.error('Expo push failed', response.status);
    }
  }
}

export async function sendEmail(to: string[], subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('RESEND_FROM') ?? 'Cerca <avisos@example.com>';
  if (apiKey === undefined || to.length === 0) {
    console.warn('Resend not configured or no recipients: email skipped');
    return;
  }
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) {
    console.error('Resend failed', response.status);
  }
}

/** Emails de una lista de usuarios (los guarda Supabase Auth, no la tabla profiles). */
export async function emailsFor(admin: SupabaseClient, userIds: string[]): Promise<string[]> {
  const emails: string[] = [];
  for (const id of userIds) {
    const { data, error } = await admin.auth.admin.getUserById(id);
    if (error !== null) {
      console.error('getUserById failed', error.message);
      continue;
    }
    if (data.user.email !== undefined && data.user.email.length > 0) {
      emails.push(data.user.email);
    }
  }
  return emails;
}
