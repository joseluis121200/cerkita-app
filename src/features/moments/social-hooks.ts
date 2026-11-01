import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { momentKeys } from './query-keys';
import { addComment, fetchComments, fetchMyNudgesToday, sendNudge } from './social.api';

export function useComments(familyId: string | undefined, momentIds: string[]) {
  return useQuery({
    queryKey: [...momentKeys.comments(familyId ?? 'none'), momentIds.join(',')],
    queryFn: () => fetchComments(familyId ?? '', momentIds),
    enabled: familyId !== undefined && momentIds.length > 0,
    refetchInterval: 60_000,
  });
}

export function useAddComment(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { momentId: string; body: string }) => addComment(familyId, input.momentId, input.body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: momentKeys.comments(familyId) }),
  });
}

export function useMyNudges(familyId: string | undefined, userId: string) {
  return useQuery({
    queryKey: [...momentKeys.nudges(familyId ?? 'none'), userId],
    queryFn: () => fetchMyNudgesToday(familyId ?? '', userId),
    enabled: familyId !== undefined,
  });
}

export function useSendNudge(familyId: string, userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (toUserId: string) => sendNudge(familyId, userId, toUserId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: momentKeys.nudges(familyId) }),
  });
}
