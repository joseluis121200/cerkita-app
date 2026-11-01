import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { pushTokensFor, sendPush } from '../_shared/notify.ts';
import { familyGreeting, familyResolved } from './messages.ts';

type RowToNotify = {
  id: string;
  family_id: string;
  status: string;
  resolved_by_user_id: string | null;
  elder_monitors: { display_name: string } | null;
};

/**
 * Avisa a la familia cuando el mayor saluda («La abuela ya dio los buenos días ☀️») o cuando
 * un hermano cierra un aviso. family_notified_at garantiza que cada aviso salga una sola vez.
 */
export async function notifyFamilyUpdates(admin: SupabaseClient, now: Date): Promise<number> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from('daily_checkins')
    .select('id, family_id, status, resolved_by_user_id, elder_monitors(display_name)')
    .in('status', ['ok', 'resolved_by_admin'])
    .is('family_notified_at', null)
    .gte('confirmed_at', since)
    .limit(500);
  if (error !== null) {
    console.error('family updates query failed', error.message);
    return 0;
  }

  let sent = 0;
  for (const row of (data ?? []) as unknown as RowToNotify[]) {
    const { data: claimed, error: claimError } = await admin
      .from('daily_checkins')
      .update({ family_notified_at: now.toISOString() })
      .eq('id', row.id)
      .is('family_notified_at', null)
      .select('id');
    if (claimError !== null || (claimed ?? []).length === 0) {
      continue; // otra ejecución ya lo envió
    }

    const { data: members } = await admin
      .from('family_members')
      .select('user_id, role')
      .eq('family_id', row.family_id)
      .neq('role', 'elder');
    const elderName = row.elder_monitors?.display_name ?? 'Tu familiar';
    const all = (members ?? []) as { user_id: string; role: string }[];

    if (row.status === 'ok') {
      await sendPush(await pushTokensFor(admin, all.map((m) => m.user_id)), familyGreeting(elderName));
    } else {
      const others = all.filter((m) => m.role === 'admin' && m.user_id !== row.resolved_by_user_id).map((m) => m.user_id);
      const { data: resolver } = await admin
        .from('profiles')
        .select('display_name')
        .eq('id', row.resolved_by_user_id ?? '')
        .maybeSingle();
      const resolverName = (resolver as { display_name: string } | null)?.display_name ?? 'Un familiar';
      await sendPush(await pushTokensFor(admin, others), familyResolved(elderName, resolverName));
    }
    sent += 1;
  }
  return sent;
}
