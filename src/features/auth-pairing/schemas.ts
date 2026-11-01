import { z } from 'zod';

export type MemberRole = 'admin' | 'member' | 'elder';
export type PlanStatus = 'trialing' | 'free_limited' | 'active_paid' | 'grace_period';
export type ElderTimeZone = 'Europe/Madrid' | 'Atlantic/Canary';

// Qué pantalla le toca a quien abre la app. Lo decide el servidor (o el motor de prueba).
export type AppSession =
  | { status: 'signed_out' }
  | { status: 'needs_profile'; userId: string; email: string | null }
  | { status: 'needs_family'; userId: string; displayName: string }
  | {
      status: 'family';
      userId: string;
      displayName: string;
      familyId: string;
      memberId: string;
      role: 'admin' | 'member';
    }
  | {
      status: 'elder';
      userId: string;
      familyId: string;
      elderId: string;
      elderName: string;
      timezone: ElderTimeZone;
    };

export type Family = {
  id: string;
  name: string;
  planStatus: PlanStatus;
  trialEndsAt: string;
  paidUntil: string | null;
  inviteToken: string;
};

export type FamilyMember = {
  id: string;
  userId: string;
  role: MemberRole;
  displayName: string;
  label: string | null;
  receiveCriticalEmails: boolean;
};

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Escribe un email válido, por ejemplo nombre@gmail.com'));

export const otpSchema = z.string().regex(/^[0-9]{6}$/, 'El código tiene 6 números');

export const pairingCodeSchema = z.string().regex(/^[0-9]{6}$/, 'El código tiene 6 números');

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, 'Escribe tu nombre')
  .max(60, 'Máximo 60 caracteres');

export const familyNameSchema = z
  .string()
  .trim()
  .min(1, 'Ponle un nombre a tu círculo')
  .max(60, 'Máximo 60 caracteres');

export const roleLabelSchema = z.string().trim().max(40, 'Máximo 40 caracteres');

/** Primer mensaje de error de una validación Zod (o null si es válida). */
export function firstIssue(result: { success: boolean; error?: { issues: { message: string }[] } }): string | null {
  if (result.success) {
    return null;
  }
  return result.error?.issues[0]?.message ?? 'Revisa los datos';
}

/** Rol traducido para la interfaz familiar. */
export function roleLabel(role: MemberRole): string {
  if (role === 'admin') return 'Acompañante';
  if (role === 'member') return 'Miembro del círculo';
  return 'Persona acompañada';
}
