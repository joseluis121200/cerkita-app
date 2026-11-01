import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createFamily,
  deleteMyAccount,
  fetchFamily,
  fetchMembers,
  joinFamily,
  registerPushToken,
  removeMember,
  renameFamily,
  saveProfile,
  setMemberLabel,
  setMemberRole,
  updateMyPreferences,
  type MyPreferences,
} from './family.api';
import { authKeys } from './query-keys';
import type { MemberRole } from './schemas';

export function useFamily(familyId: string | undefined) {
  return useQuery({
    queryKey: authKeys.family(familyId ?? 'none'),
    queryFn: () => fetchFamily(familyId ?? ''),
    enabled: familyId !== undefined,
  });
}

export function useMembers(familyId: string | undefined) {
  return useQuery({
    queryKey: authKeys.members(familyId ?? 'none'),
    queryFn: () => fetchMembers(familyId ?? ''),
    enabled: familyId !== undefined,
  });
}

export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { userId: string; displayName: string }) => saveProfile(input.userId, input.displayName),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}

export function useCreateFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createFamily(name),
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function useJoinFamily() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => joinFamily(token),
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function useSetMemberRole(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { memberId: string; role: MemberRole }) => setMemberRole(input.memberId, input.role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.members(familyId) }),
  });
}

export function useSetMemberLabel(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { memberId: string; label: string }) => setMemberLabel(input.memberId, input.label),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.members(familyId) }),
  });
}

export function useRemoveMember(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeMember(memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.members(familyId) }),
  });
}

export function useUpdateMyPreferences(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { memberId: string; changes: MyPreferences }) => updateMyPreferences(input.memberId, input.changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.members(familyId) }),
  });
}

export function useRenameFamily(familyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => renameFamily(familyId, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authKeys.family(familyId) }),
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMyAccount,
    onSuccess: () => queryClient.resetQueries(),
  });
}

export function useRegisterPushToken() {
  return useMutation({ mutationFn: registerPushToken });
}
