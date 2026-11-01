// API pública de la feature auth-pairing (AGENTS.md: solo se importa desde aquí).
export { CodeSlots } from './components/CodeSlots';
export { DangerZone } from './components/DangerZone';
export { GiantKeypad } from './components/GiantKeypad';
export { buildInviteLink, InviteShareCard } from './components/InviteShareCard';
export { LegalNotice } from './components/LegalNotice';
export { MemberActionsSheet } from './components/MemberActionsSheet';
export { MemberRow } from './components/MemberRow';
export { MembersSection } from './components/MembersSection';
export { ProfileSection } from './components/ProfileSection';
export { QrScanner } from './components/QrScanner';
export { SocialButtons } from './components/SocialButtons';
export {
  useCreateFamily,
  useDeleteAccount,
  useFamily,
  useJoinFamily,
  useMembers,
  useRegisterPushToken,
  useRemoveMember,
  useRenameFamily,
  useSaveProfile,
  useSetMemberLabel,
  useSetMemberRole,
  useUpdateMyPreferences,
} from './family-hooks';
export {
  displayNameSchema,
  emailSchema,
  familyNameSchema,
  firstIssue,
  otpSchema,
  pairingCodeSchema,
  roleLabel,
  roleLabelSchema,
} from './schemas';
export type { AppSession, ElderTimeZone, Family, FamilyMember, MemberRole, PlanStatus } from './schemas';
export {
  useAuthListener,
  useElderContext,
  useFamilyContext,
  usePairElderDevice,
  useSendEmailCode,
  useSession,
  useSignOut,
  useSocialSignIn,
  useVerifyEmailCode,
} from './session-hooks';
export type { SocialProvider } from './session.api';
