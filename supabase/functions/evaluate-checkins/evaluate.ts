import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';

import { emailsFor, pushTokensFor, sendEmail, sendPush } from '../_shared/notify.ts';
import { hasPlus, type FamilyPlanRow } from '../_shared/plan.ts';
import { isActiveDay, localNow, toMinutes } from '../_shared/time.ts';
import { adminAlertEmail, adminAlertPush, elderMorning, elderReminder1, elderReminder2 } from './messages.ts';

type ElderRow = {
  id: string;
  family_id: string;
  elder_user_id: string | null;
  display_name: string;
  timezone: string;
  window_start: string;
  reminder_1_at: string;
  reminder_2_at: string;
  admin_alert_at: string;
  active_days_mask: number;
  paused_until: string | null;
  families: FamilyPlanRow | null;
};

export type EvaluationSummary = { evaluated: number; morning: number; reminders: number; alerts: number; inAppAlerts: number };

/**
 * Transición atómica e idempotente (AGENTS.md regla 5): solo cambia la fila si sigue en uno de
 * los estados previos. Devuelve true únicamente a la ejecución que gana el cambio.
 */
async function transition(admin: SupabaseClient, elderId: string, localDate: string, from: string[], to: string): Promise<boolean> {
  const { data, error } = await admin
    .from('daily_checkins')
    .update({ status: to })
    .eq('elder_monitor_id', elderId)
    .eq('local_date', localDate)
    .in('status', from)
    .select('id');
  if (error !== null) {
    console.error('transition failed', elderId, error.message);
    return false;
  }
  return (data ?? []).length > 0;
}

async function notifyAdmins(admin: SupabaseClient, elder: ElderRow): Promise<void> {
  const { data, error } = await admin
    .from('family_members')
    .select('user_id, receive_critical_emails')
    .eq('family_id', elder.family_id)
    .eq('role', 'admin');
  if (error !== null) {
    console.error('admins query failed', error.message);
    return;
  }
  const admins = (data ?? []) as { user_id: string; receive_critical_emails: boolean }[];
  const tokens = await pushTokensFor(admin, admins.map((a) => a.user_id));
  await sendPush(tokens, adminAlertPush(elder.display_name, elder.id));
  const emails = await emailsFor(admin, admins.filter((a) => a.receive_critical_emails).map((a) => a.user_id));
  const email = adminAlertEmail(elder.display_name);
  await sendEmail(emails, email.subject, email.html);
}

async function elderTokens(admin: SupabaseClient, elder: ElderRow): Promise<string[]> {
  return elder.elder_user_id === null ? [] : pushTokensFor(admin, [elder.elder_user_id]);
}

export async function evaluateCheckins(admin: SupabaseClient, now: Date): Promise<EvaluationSummary> {
  const summary: EvaluationSummary = { evaluated: 0, morning: 0, reminders: 0, alerts: 0, inAppAlerts: 0 };
  const { data, error } = await admin
    .from('elder_monitors')
    .select(
      'id, family_id, elder_user_id, display_name, timezone, window_start, reminder_1_at, reminder_2_at, admin_alert_at, active_days_mask, paused_until, families(plan_status, paid_until)',
    )
    .eq('is_enabled', true)
    .not('elder_user_id', 'is', null)
    .order('created_at');
  if (error !== null) {
    throw new Error(`elder_monitors query failed: ${error.message}`);
  }

  const activePerFamily = new Map<string, number>();
  for (const elder of (data ?? []) as unknown as ElderRow[]) {
    const plus = elder.families !== null && hasPlus(elder.families, now);
    // Plan gratuito: 1 ser querido, sin recordatorios y con aviso solo dentro de la app.
    const position = activePerFamily.get(elder.family_id) ?? 0;
    activePerFamily.set(elder.family_id, position + 1);
    if (!plus && position >= 1) {
      continue;
    }

    const local = localNow(elder.timezone, now);
    const pausedToday = elder.paused_until !== null && elder.paused_until >= local.localDate;
    if (pausedToday || !isActiveDay(elder.active_days_mask, local.isoWeekday) || local.minutes < toMinutes(elder.window_start)) {
      continue;
    }
    summary.evaluated += 1;

    // Fila del día: el primer insert gana y dispara el saludo de la mañana (una sola vez).
    const { data: inserted, error: insertError } = await admin
      .from('daily_checkins')
      .upsert(
        { elder_monitor_id: elder.id, family_id: elder.family_id, local_date: local.localDate, status: 'pending' },
        { onConflict: 'elder_monitor_id,local_date', ignoreDuplicates: true },
      )
      .select('id');
    if (insertError !== null) {
      console.error('daily row upsert failed', elder.id, insertError.message);
      continue;
    }
    if ((inserted ?? []).length > 0 && local.minutes < toMinutes(elder.reminder_1_at)) {
      await sendPush(await elderTokens(admin, elder), elderMorning);
      summary.morning += 1;
    }

    if (local.minutes >= toMinutes(elder.admin_alert_at)) {
      if (await transition(admin, elder.id, local.localDate, ['pending', 'reminded_1', 'reminded_2'], 'alerted_admins')) {
        if (plus) {
          await notifyAdmins(admin, elder); // Círculo Plus: push prioritario + email a los acompañantes
          summary.alerts += 1;
        } else {
          summary.inAppAlerts += 1; // gratis: el aviso aparece en el panel de la app
        }
      }
    } else if (plus && local.minutes >= toMinutes(elder.reminder_2_at)) {
      if (await transition(admin, elder.id, local.localDate, ['pending', 'reminded_1'], 'reminded_2')) {
        await sendPush(await elderTokens(admin, elder), elderReminder2);
        summary.reminders += 1;
      }
    } else if (plus && local.minutes >= toMinutes(elder.reminder_1_at)) {
      if (await transition(admin, elder.id, local.localDate, ['pending'], 'reminded_1')) {
        await sendPush(await elderTokens(admin, elder), elderReminder1);
        summary.reminders += 1;
      }
    }
  }
  return summary;
}
