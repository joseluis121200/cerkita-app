import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { logError } from '@/shared/utils/logger';

import { authKeys } from './query-keys';
import type { AppSession } from './schemas';
import {
  fetchSession,
  pairElderDevice,
  sendEmailCode,
  signInWithProvider,
  signOut,
  subscribeToAuthChanges,
  verifyEmailCode,
  type SocialProvider,
} from './session.api';

export function useSession() {
  return useQuery({ queryKey: authKeys.session, queryFn: fetchSession, staleTime: 60_000 });
}

/** Contexto familiar ya resuelto (o null si quien usa la app no es un familiar). */
export function useFamilyContext(): Extract<AppSession, { status: 'family' }> | null {
  const { data } = useSession();
  return data?.status === 'family' ? data : null;
}

/** Contexto del móvil del mayor (o null). */
export function useElderContext(): Extract<AppSession, { status: 'elder' }> | null {
  const { data } = useSession();
  return data?.status === 'elder' ? data : null;
}

/** Cualquier cambio de sesión en Supabase recarga todos los datos. */
export function useAuthListener(): void {
  const queryClient = useQueryClient();
  useEffect(() => {
    return subscribeToAuthChanges(() => {
      queryClient.invalidateQueries().catch((error: unknown) => logError('auth-listener', error));
    });
  }, [queryClient]);
}

export function useSendEmailCode() {
  return useMutation({ mutationFn: (email: string) => sendEmailCode(email) });
}

export function useVerifyEmailCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; code: string }) => verifyEmailCode(input.email, input.code),
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function useSocialSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: SocialProvider) => signInWithProvider(provider),
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function usePairElderDevice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => pairElderDevice(code),
    onSuccess: () => queryClient.resetQueries(),
  });
}
