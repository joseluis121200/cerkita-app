import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';
import type { Tables } from '@/shared/api/database.types';
import { toShortTime } from '@/shared/utils/dates';

import { demoCreateElder, demoCreatePairingCode, demoDeleteElder, demoListElders, demoUpdateElder } from './demo';
import type { Elder, ElderInput, PairingCode } from './schemas';

function toElder(row: Tables<'elder_monitors'>): Elder {
  return {
    id: row.id,
    familyId: row.family_id,
    isPaired: row.elder_user_id !== null,
    displayName: row.display_name,
    relationshipLabel: row.relationship_label,
    timezone: row.timezone === 'Atlantic/Canary' ? 'Atlantic/Canary' : 'Europe/Madrid',
    phoneForCall: row.phone_for_call,
    windowStart: toShortTime(row.window_start),
    reminder1At: toShortTime(row.reminder_1_at),
    reminder2At: toShortTime(row.reminder_2_at),
    adminAlertAt: toShortTime(row.admin_alert_at),
    activeDaysMask: row.active_days_mask,
    pausedUntil: row.paused_until,
    isEnabled: row.is_enabled,
    createdAt: row.created_at,
  };
}

function toRow(input: ElderInput) {
  return {
    display_name: input.displayName.trim(),
    relationship_label: input.relationshipLabel,
    timezone: input.timezone,
    phone_for_call: input.phoneForCall,
    window_start: input.windowStart,
    reminder_1_at: input.reminder1At,
    reminder_2_at: input.reminder2At,
    admin_alert_at: input.adminAlertAt,
    active_days_mask: input.activeDaysMask,
    paused_until: input.pausedUntil,
    is_enabled: input.isEnabled,
  };
}

export async function listElders(familyId: string): Promise<Elder[]> {
  if (isDemoMode) {
    return demoListElders();
  }
  const { data, error } = await requireSupabase()
    .from('elder_monitors')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at');
  throwIfError(error);
  return (data ?? []).map(toElder);
}

export async function createElder(familyId: string, input: ElderInput): Promise<Elder> {
  if (isDemoMode) {
    return demoCreateElder(input);
  }
  const { data, error } = await requireSupabase()
    .from('elder_monitors')
    .insert({ family_id: familyId, ...toRow(input) })
    .select('*')
    .single();
  throwIfError(error);
  if (data === null) {
    throw new Error('No se pudo añadir a tu ser querido');
  }
  return toElder(data);
}

export async function updateElder(elderId: string, input: ElderInput): Promise<void> {
  if (isDemoMode) {
    return demoUpdateElder(elderId, input);
  }
  const { error } = await requireSupabase().from('elder_monitors').update(toRow(input)).eq('id', elderId);
  throwIfError(error);
}

export async function deleteElder(elderId: string): Promise<void> {
  if (isDemoMode) {
    return demoDeleteElder(elderId);
  }
  const { error } = await requireSupabase().from('elder_monitors').delete().eq('id', elderId);
  throwIfError(error);
}

export async function createPairingCode(elderId: string): Promise<PairingCode> {
  if (isDemoMode) {
    return demoCreatePairingCode(elderId);
  }
  const { data, error } = await requireSupabase().rpc('create_pairing_code', { p_elder_monitor_id: elderId });
  throwIfError(error);
  const first = data?.[0];
  if (first === undefined) {
    throw new Error('No se pudo generar el código');
  }
  return { code: first.pairing_code, validUntil: first.valid_until };
}
