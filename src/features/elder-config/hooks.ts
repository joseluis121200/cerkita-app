import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createElder, createPairingCode, deleteElder, listElders, updateElder } from './api';
import { elderKeys } from './query-keys';
import type { Elder, ElderInput } from './schemas';

export function useElders(familyId: string | undefined) {
  return useQuery({
    queryKey: elderKeys.list(familyId ?? 'none'),
    queryFn: () => listElders(familyId ?? ''),
    enabled: familyId !== undefined,
  });
}

export function useCreateElder(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ElderInput) => createElder(familyId, input),
    // Lo añadimos ya a la caché: la ficha nueva lo encuentra al instante, sin esperar a la red.
    onSuccess: async (created) => {
      queryClient.setQueryData<Elder[]>(elderKeys.list(familyId), (current) => [...(current ?? []), created]);
      await queryClient.invalidateQueries({ queryKey: elderKeys.list(familyId) });
    },
  });
}

export function useUpdateElder(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { elderId: string; values: ElderInput }) => updateElder(input.elderId, input.values),
    // Los estados del panel dependen de los horarios: refrescamos todo lo de la familia.
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useDeleteElder(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (elderId: string) => deleteElder(elderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: elderKeys.list(familyId) }),
  });
}

export function useCreatePairingCode() {
  return useMutation({ mutationFn: (elderId: string) => createPairingCode(elderId) });
}
