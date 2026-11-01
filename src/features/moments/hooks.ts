import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useMembers } from '@/features/auth-pairing';
import { compressPhoto, type CompressedPhoto } from '@/shared/utils/image';

import { deleteMoment, fetchHideTodayFlag, fetchMoments, uploadMoment } from './api';
import { pickElderPostcards, pickPhotoOfTheDay, type ElderPostcards } from './photo-of-day';
import { momentKeys } from './query-keys';
import type { Moment, MomentWithAuthor, PhotoOfTheDay } from './schemas';

export function useMoments(familyId: string | undefined) {
  const momentsQuery = useQuery({
    queryKey: momentKeys.list(familyId ?? 'none'),
    queryFn: () => fetchMoments(familyId ?? ''),
    enabled: familyId !== undefined,
    // Las URLs firmadas duran 1 h: refrescamos antes de que caduquen.
    staleTime: 5 * 60_000,
    refetchInterval: 30 * 60_000,
  });
  const membersQuery = useMembers(familyId);

  const moments = useMemo<MomentWithAuthor[]>(() => {
    const members = membersQuery.data ?? [];
    return (momentsQuery.data ?? []).map((moment) => {
      const author = members.find((m) => m.userId === moment.authorId);
      return { ...moment, authorName: author?.displayName ?? 'Tu círculo', authorLabel: author?.label ?? null };
    });
  }, [momentsQuery.data, membersQuery.data]);

  return { ...momentsQuery, moments };
}

export function usePhotoOfTheDay(familyId: string | undefined, timeZone: string) {
  const { moments, isLoading, isError, refetch } = useMoments(familyId);
  const flag = useQuery({ queryKey: momentKeys.simulation, queryFn: fetchHideTodayFlag, staleTime: 0 });
  const photo = useMemo<PhotoOfTheDay | null>(
    () => pickPhotoOfTheDay(moments, timeZone, flag.data === true),
    [moments, timeZone, flag.data],
  );
  return { photo, isLoading, isError, refetch };
}

/** Postales de hoy para la persona acompañada (o un recuerdo si aún no hay ninguna). */
export function useElderPostcards(familyId: string | undefined, timeZone: string) {
  const { moments, isLoading } = useMoments(familyId);
  const flag = useQuery({ queryKey: momentKeys.simulation, queryFn: fetchHideTodayFlag, staleTime: 0 });
  const result = useMemo<ElderPostcards>(
    () => pickElderPostcards(moments, timeZone, flag.data === true),
    [moments, timeZone, flag.data],
  );
  return { ...result, isLoading };
}

export function useCompressPhoto() {
  return useMutation({ mutationFn: (uri: string) => compressPhoto(uri) });
}

export function useUploadMoment(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { photo: CompressedPhoto; caption: string | null }) => uploadMoment(familyId, input.photo, input.caption),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: momentKeys.list(familyId) });
      await queryClient.invalidateQueries({ queryKey: momentKeys.simulation });
      await queryClient.invalidateQueries({ queryKey: momentKeys.locked(familyId) });
    },
  });
}

export function useDeleteMoment(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (moment: Moment) => deleteMoment(moment),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: momentKeys.list(familyId) }),
  });
}
