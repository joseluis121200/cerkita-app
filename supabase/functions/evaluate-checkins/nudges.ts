import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { pushTokensFor, sendPush } from '../_shared/notify.ts';

type NudgeRow = { id: string; from_user_id: string; to_user_id: string };

/** Envía los «Animar 👋» pendientes. notified_at evita que un toque se envíe dos veces. */
export async function sendPendingNudges(admin: SupabaseClient, now: Date): Promise<number> {
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await admin
    .from('member_nudges')
    .select('id, from_user_id, to_user_id')
    .is('notified_at', null)
    .gte('created_at', since)
    .limit(500);
  if (error !== null) {
    console.error('nudges query failed', error.message);
    return 0;
  }
  let sent = 0;
  for (const nudge of (data ?? []) as NudgeRow[]) {
    const { data: claimed } = await admin
      .from('member_nudges')
      .update({ notified_at: now.toISOString() })
      .eq('id', nudge.id)
      .is('notified_at', null)
      .select('id');
    if ((claimed ?? []).length === 0) {
      continue;
    }
    const { data: sender } = await admin.from('profiles').select('display_name').eq('id', nudge.from_user_id).maybeSingle();
    const name = (sender as { display_name: string } | null)?.display_name ?? 'Alguien de tu círculo';
    await sendPush(await pushTokensFor(admin, [nudge.to_user_id]), {
      title: `👋 ${name} te anima a mandar tu postal de hoy`,
      body: 'Una foto sencilla de tu día alegra a todo el círculo.',
    });
    sent += 1;
  }
  return sent;
}
