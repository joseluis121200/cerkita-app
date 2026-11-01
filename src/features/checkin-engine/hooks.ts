import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';
import { AppState } from 'react-native';

import { useElders, type Elder } from '@/features/elder-config';
import { usePlan } from '@/features/subscription';
import { localDateIn } from '@/shared/utils/dates';
import { logError } from '@/shared/utils/logger';

import { fetchRecentCheckins, resolveCheckin } from './api';
import { readButtonPressDate, rememberButtonPress } from './button-press';
import { enqueueCheckin, flushCheckinQueue } from './offline-queue';
import { checkinKeys } from './query-keys';
import type { DayCheckin, ElderDayState } from './schemas';
import { computeStreak, deriveDayState } from './status';

// planNote: 'basic' = plan gratuito (aviso solo en la app) · 'inactive' = fuera del límite del plan.
export type ElderOverview = { elder: Elder; state: ElderDayState; streak: number; planNote: 'basic' | 'inactive' | null };

export function useFamilyCheckins(familyId: string | undefined) {
  return useQuery({
    queryKey: checkinKeys.recent(familyId ?? 'none'),
    queryFn: () => fetchRecentCheckins(familyId ?? ''),
    enabled: familyId !== undefined,
    refetchInterval: 60_000,
  });
}

export function useElderOverviews(familyId: string | undefined) {
  const elders = useElders(familyId);
  const checkins = useFamilyCheckins(familyId);
  const plan = usePlan(familyId);

  const overviews = useMemo<ElderOverview[]>(() => {
    const rows = checkins.data ?? [];
    return (elders.data ?? []).map((elder, index) => ({
      elder,
      state: deriveDayState(elder, rows),
      streak: computeStreak(elder, rows),
      planNote: plan === null || plan.advancedAlerts ? null : index >= plan.maxLovedOnes ? 'inactive' : 'basic',
    }));
  }, [elders.data, checkins.data, plan]);

  return {
    overviews,
    isLoading: elders.isLoading || checkins.isLoading,
    isError: elders.isError || checkins.isError,
    refetch: async () => {
      await Promise.all([elders.refetch(), checkins.refetch()]);
    },
  };
}

/** El saludo del mayor: optimista, encolado y offline-first. */
export function useGreeting(familyId: string, elder: { id: string; timezone: string }) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (source: 'morning_button' | 'photo_opened') => {
      await enqueueCheckin(source, new Date().toISOString());
      if (source === 'morning_button') {
        await rememberButtonPress(localDateIn(elder.timezone));
      }
      return flushCheckinQueue();
    },
    onMutate: async (source) => {
      const key = checkinKeys.recent(familyId);
      await queryClient.cancelQueries({ queryKey: key });
      const today = localDateIn(elder.timezone);
      const now = new Date().toISOString();
      queryClient.setQueryData<DayCheckin[]>(key, (current) => {
        const others = (current ?? []).filter((c) => !(c.elderId === elder.id && c.localDate === today));
        const optimistic: DayCheckin = {
          id: `local-${today}`,
          elderId: elder.id,
          localDate: today,
          status: 'ok',
          confirmedAt: now,
          source,
          resolvedByUserId: null,
          resolutionNote: null,
        };
        return [optimistic, ...others];
      });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: checkinKeys.recent(familyId) });
      await queryClient.invalidateQueries({ queryKey: checkinKeys.buttonPressed });
    },
  });
}

/** ¿Pulsó hoy el mayor el botón en este móvil? */
export function useButtonPressedToday(timeZone: string): boolean {
  const { data } = useQuery({ queryKey: checkinKeys.buttonPressed, queryFn: readButtonPressDate, staleTime: 0 });
  return data === localDateIn(timeZone);
}

/** Reintenta los saludos pendientes al abrir la app y cada vez que vuelve a primer plano. */
export function useCheckinQueueSync(familyId: string | undefined): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (familyId === undefined) {
      return undefined;
    }
    function sync() {
      flushCheckinQueue()
        .then(() => queryClient.invalidateQueries({ queryKey: checkinKeys.recent(familyId ?? '') }))
        .catch((error: unknown) => logError('checkin-sync', error));
    }
    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        sync();
      }
    });
    return () => subscription.remove();
  }, [familyId, queryClient]);
}

export function useResolveCheckin(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { checkinId: string; note: string | null }) => resolveCheckin(input.checkinId, input.note),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: checkinKeys.recent(familyId) }),
  });
}
