import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';
import { getPushRegistration } from '@/shared/utils/push';

import {
  demoCreateFamily,
  demoFetchFamily,
  demoFetchMembers,
  demoJoinFamily,
  demoRemoveMember,
  demoRenameFamily,
  demoSaveProfile,
  demoSetMemberLabel,
  demoSetMemberRole,
  demoUpdateMyPreferences,
} from './family.demo';
import type { Family, FamilyMember, MemberRole } from './schemas';
import { demoDeleteAccount } from './session.demo';

export async function fetchFamily(familyId: string): Promise<Family> {
  if (isDemoMode) {
    return demoFetchFamily();
  }
  const { data, error } = await requireSupabase()
    .from('families')
    .select('id, name, plan_status, trial_ends_at, paid_until, invite_token')
    .eq('id', familyId)
    .single();
  throwIfError(error);
  if (data === null) {
    throw new Error('Círculo no encontrado');
  }
  return {
    id: data.id,
    name: data.name,
    planStatus: data.plan_status,
    trialEndsAt: data.trial_ends_at,
    paidUntil: data.paid_until,
    inviteToken: data.invite_token,
  };
}

export async function fetchMembers(familyId: string): Promise<FamilyMember[]> {
  if (isDemoMode) {
    return demoFetchMembers();
  }
  const sb = requireSupabase();
  const { data: rows, error } = await sb
    .from('family_members')
    .select('id, user_id, role, display_role_label, receive_critical_emails')
    .eq('family_id', familyId)
    .order('joined_at');
  throwIfError(error);
  const members = rows ?? [];

  const userIds = members.filter((m) => m.role !== 'elder').map((m) => m.user_id);
  const names = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await sb.from('profiles').select('id, display_name').in('id', userIds);
    throwIfError(profilesError);
    for (const profile of profiles ?? []) {
      names.set(profile.id, profile.display_name);
    }
  }

  return members.map((m) => ({
    id: m.id,
    userId: m.user_id,
    role: m.role,
    displayName: names.get(m.user_id) ?? m.display_role_label ?? 'Miembro',
    label: m.display_role_label,
    receiveCriticalEmails: m.receive_critical_emails,
  }));
}

export async function saveProfile(userId: string, displayName: string): Promise<void> {
  if (isDemoMode) {
    return demoSaveProfile(userId, displayName);
  }
  const sb = requireSupabase();
  const { data: existing, error } = await sb.from('profiles').select('id').eq('id', userId).maybeSingle();
  throwIfError(error);
  if (existing === null) {
    const { error: insertError } = await sb.from('profiles').insert({ id: userId, display_name: displayName });
    throwIfError(insertError);
  } else {
    const { error: updateError } = await sb.from('profiles').update({ display_name: displayName }).eq('id', userId);
    throwIfError(updateError);
  }
}

export async function createFamily(name: string): Promise<string> {
  if (isDemoMode) {
    return demoCreateFamily(name);
  }
  const { data, error } = await requireSupabase().rpc('create_family', { p_name: name });
  throwIfError(error);
  return data ?? '';
}

export async function joinFamily(inviteToken: string): Promise<string> {
  if (isDemoMode) {
    return demoJoinFamily(inviteToken);
  }
  const { data, error } = await requireSupabase().rpc('join_family', { p_invite_token: inviteToken });
  throwIfError(error);
  return data ?? '';
}

export async function setMemberRole(memberId: string, role: MemberRole): Promise<void> {
  if (isDemoMode) {
    return demoSetMemberRole(memberId, role);
  }
  const { error } = await requireSupabase().rpc('set_member_role', { p_member_id: memberId, p_role: role });
  throwIfError(error);
}

/** Un acompañante edita la relación de otra persona («Nieto Pablo», «Vecina Ana»…). */
export async function setMemberLabel(memberId: string, label: string): Promise<void> {
  if (isDemoMode) {
    return demoSetMemberLabel(memberId, label);
  }
  const { error } = await requireSupabase().rpc('set_member_label', { p_member_id: memberId, p_label: label });
  throwIfError(error);
}

/** Un acompañante quita a alguien del círculo (nunca deja el círculo sin acompañantes). */
export async function removeMember(memberId: string): Promise<void> {
  if (isDemoMode) {
    return demoRemoveMember(memberId);
  }
  const { error } = await requireSupabase().rpc('remove_member', { p_member_id: memberId });
  throwIfError(error);
}

export type MyPreferences = { label?: string | null; receiveCriticalEmails?: boolean };

export async function updateMyPreferences(memberId: string, changes: MyPreferences): Promise<void> {
  if (isDemoMode) {
    return demoUpdateMyPreferences(memberId, changes);
  }
  const update: { display_role_label?: string | null; receive_critical_emails?: boolean } = {};
  if (changes.label !== undefined) update.display_role_label = changes.label;
  if (changes.receiveCriticalEmails !== undefined) update.receive_critical_emails = changes.receiveCriticalEmails;
  const { error } = await requireSupabase().from('family_members').update(update).eq('id', memberId);
  throwIfError(error);
}

export async function renameFamily(familyId: string, name: string): Promise<void> {
  if (isDemoMode) {
    return demoRenameFamily(name);
  }
  const { error } = await requireSupabase().from('families').update({ name }).eq('id', familyId);
  throwIfError(error);
}

/** Borrado completo de cuenta (exigido por Apple). Lo hace la Edge Function delete-account. */
export async function deleteMyAccount(): Promise<void> {
  if (isDemoMode) {
    return demoDeleteAccount();
  }
  const sb = requireSupabase();
  const { error } = await sb.functions.invoke('delete-account', { body: { confirm: true } });
  if (error !== null) {
    throw new Error('No se pudo eliminar la cuenta. Inténtalo de nuevo o escríbenos.');
  }
  await sb.auth.signOut();
}

/** Guarda el token push del móvil si el adaptador lo devuelve (development build). */
export async function registerPushToken(): Promise<void> {
  if (isDemoMode) {
    return;
  }
  const registration = await getPushRegistration();
  if (registration === null) {
    return;
  }
  const { error } = await requireSupabase().rpc('register_push_token', {
    p_token: registration.token,
    p_platform: registration.platform,
  });
  throwIfError(error);
}
