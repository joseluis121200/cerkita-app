import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useFamily } from '@/features/auth-pairing';

import { effectivePlan, type EffectivePlan, type PlanOption } from './plan';
import { purchasePlan, restorePurchases } from './purchases';

export function usePlan(familyId: string | undefined): EffectivePlan | null {
  const { data: family } = useFamily(familyId);
  if (family === undefined) {
    return null;
  }
  return effectivePlan(family);
}

export function usePurchasePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (option: PlanOption) => purchasePlan(option),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useRestorePurchases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restorePurchases,
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
