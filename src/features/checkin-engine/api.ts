import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';
import { addDays, DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';

import { demoFetchCheckins, demoRegisterCheckin, demoResolveCheckin } from './demo';
import type { CheckinSource, DayCheckin } from './schemas';

const HISTORY_DAYS = 40;

export async function fetchRecentCheckins(familyId: string): Promise<DayCheckin[]> {
  if (isDemoMode) {
    return demoFetchCheckins();
  }
  const since = addDays(localDateIn(DEFAULT_TIME_ZONE), -HISTORY_DAYS);
  const { data, error } = await requireSupabase()
    .from('daily_checkins')
    .select('id, elder_monitor_id, local_date, status, confirmed_at, source, resolved_by_user_id, resolution_note')
    .eq('family_id', familyId)
    .gte('local_date', since)
    .order('local_date', { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) => ({
    id: row.id,
    elderId: row.elder_monitor_id,
    localDate: row.local_date,
    status: row.status,
    confirmedAt: row.confirmed_at,
    source: row.source,
    resolvedByUserId: row.resolved_by_user_id,
    resolutionNote: row.resolution_note,
  }));
}

/** Saludo del mayor. Devuelve true si ha sido el primero del día (la familia recibe aviso). */
export async function registerCheckin(source: CheckinSource, occurredAt: string): Promise<boolean> {
  if (isDemoMode) {
    return demoRegisterCheckin(source, occurredAt);
  }
  const { data, error } = await requireSupabase().rpc('register_checkin', { p_source: source, p_occurred_at: occurredAt });
  throwIfError(error);
  return data === true;
}

/** «Ya hablé con ella, todo bien ✅»: cierra el aviso para todos los hermanos. */
export async function resolveCheckin(checkinId: string, note: string | null): Promise<boolean> {
  if (isDemoMode) {
    return demoResolveCheckin(checkinId, note);
  }
  const args: { p_checkin_id: string; p_note?: string } = { p_checkin_id: checkinId };
  if (note !== null) {
    args.p_note = note;
  }
  const { data, error } = await requireSupabase().rpc('resolve_checkin', args);
  throwIfError(error);
  return data === true;
}
