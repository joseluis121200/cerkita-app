import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';
import { DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';

import type { PostcardComment } from './schemas';
import { demoAddComment, demoFetchComments, demoFetchMyNudges, demoSendNudge } from './social.demo';

// Mini-comentarios de cariño y «Animar 👋» (migración 0004).
export async function fetchComments(familyId: string, momentIds: string[]): Promise<PostcardComment[]> {
  if (momentIds.length === 0) {
    return [];
  }
  if (isDemoMode) {
    return demoFetchComments(momentIds);
  }
  const { data, error } = await requireSupabase()
    .from('moment_comments')
    .select('id, moment_id, author_id, body, created_at')
    .eq('family_id', familyId)
    .in('moment_id', momentIds)
    .order('created_at');
  throwIfError(error);
  return (data ?? []).map((c) => ({ id: c.id, momentId: c.moment_id, authorId: c.author_id, body: c.body, createdAt: c.created_at }));
}

export async function addComment(familyId: string, momentId: string, body: string): Promise<void> {
  if (isDemoMode) {
    return demoAddComment(momentId, body);
  }
  const { error } = await requireSupabase().from('moment_comments').insert({ moment_id: momentId, family_id: familyId, body });
  throwIfError(error);
}

/** A quién he animado ya hoy (ids de usuario). */
export async function fetchMyNudgesToday(familyId: string, userId: string): Promise<string[]> {
  if (isDemoMode) {
    return demoFetchMyNudges(userId);
  }
  const { data, error } = await requireSupabase()
    .from('member_nudges')
    .select('to_user_id')
    .eq('family_id', familyId)
    .eq('from_user_id', userId)
    .eq('local_date', localDateIn(DEFAULT_TIME_ZONE));
  throwIfError(error);
  return (data ?? []).map((n) => n.to_user_id);
}

export async function sendNudge(familyId: string, fromUserId: string, toUserId: string): Promise<void> {
  if (isDemoMode) {
    return demoSendNudge(fromUserId, toUserId);
  }
  const { error } = await requireSupabase().from('member_nudges').insert({ family_id: familyId, to_user_id: toUserId });
  // 23505 = ya le habías animado hoy: para quien lo pulsa, es un éxito.
  if (error !== null && error.code !== '23505') {
    throw new Error(error.message);
  }
}
