import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';

import { demoFetchReactions, demoSetReaction } from './reactions.demo';
import type { Reaction } from './schemas';

export async function fetchReactions(familyId: string, momentIds: string[]): Promise<Reaction[]> {
  if (momentIds.length === 0) {
    return [];
  }
  if (isDemoMode) {
    return demoFetchReactions(momentIds);
  }
  const { data, error } = await requireSupabase()
    .from('moment_reactions')
    .select('moment_id, user_id, emoji')
    .eq('family_id', familyId)
    .in('moment_id', momentIds);
  throwIfError(error);
  return (data ?? []).map((r) => ({ momentId: r.moment_id, userId: r.user_id, emoji: r.emoji }));
}

/** Pone o quita una reacción propia (una de cada emoji por persona). */
export async function setReaction(input: {
  familyId: string;
  momentId: string;
  userId: string;
  emoji: string;
  active: boolean;
}): Promise<void> {
  if (isDemoMode) {
    return demoSetReaction(input.momentId, input.userId, input.emoji, input.active);
  }
  const sb = requireSupabase();
  if (input.active) {
    const { error } = await sb
      .from('moment_reactions')
      .insert({ moment_id: input.momentId, family_id: input.familyId, emoji: input.emoji });
    throwIfError(error);
    return;
  }
  const { error } = await sb
    .from('moment_reactions')
    .delete()
    .eq('moment_id', input.momentId)
    .eq('user_id', input.userId)
    .eq('emoji', input.emoji);
  throwIfError(error);
}
