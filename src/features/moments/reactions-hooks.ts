import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchLockedCount } from './api';
import { momentKeys } from './query-keys';
import { fetchReactions, setReaction } from './reactions.api';
import type { Reaction } from './schemas';

export function useReactions(familyId: string | undefined, momentIds: string[]) {
  return useQuery({
    queryKey: [...momentKeys.reactions(familyId ?? 'none'), momentIds.join(',')],
    queryFn: () => fetchReactions(familyId ?? '', momentIds),
    enabled: familyId !== undefined && momentIds.length > 0,
    refetchInterval: 60_000,
  });
}

type ToggleInput = { momentId: string; userId: string; emoji: string; active: boolean };

/** Reacción optimista: el corazón cambia al instante y se sincroniza después. */
export function useToggleReaction(familyId: string, momentIds: string[]) {
  const queryClient = useQueryClient();
  const key = [...momentKeys.reactions(familyId), momentIds.join(',')];
  return useMutation({
    mutationFn: (input: ToggleInput) => setReaction({ familyId, ...input }),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: key });
      queryClient.setQueryData<Reaction[]>(key, (current) => {
        const rest = (current ?? []).filter(
          (r) => !(r.momentId === input.momentId && r.userId === input.userId && r.emoji === input.emoji),
        );
        return input.active ? [...rest, { momentId: input.momentId, userId: input.userId, emoji: input.emoji }] : rest;
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: momentKeys.reactions(familyId) }),
  });
}

export function useLockedMoments(familyId: string | undefined) {
  return useQuery({
    queryKey: momentKeys.locked(familyId ?? 'none'),
    queryFn: () => fetchLockedCount(familyId ?? ''),
    enabled: familyId !== undefined,
  });
}
