import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, requireSupabase } from '@/shared/api/supabase';
import { isReviewAccount } from '@/shared/config/review';
import { logError } from '@/shared/utils/logger';

import type { AppSession, ElderTimeZone } from './schemas';
import {
  demoFetchSession,
  demoPairElderDevice,
  demoSendEmailCode,
  demoSignOut,
  demoVerifyEmailCode,
} from './session.demo';

function asTimeZone(value: string): ElderTimeZone {
  return value === 'Atlantic/Canary' ? 'Atlantic/Canary' : 'Europe/Madrid';
}

export async function fetchSession(): Promise<AppSession> {
  if (isDemoMode) {
    return demoFetchSession();
  }
  const sb = requireSupabase();
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (user === undefined) {
    return { status: 'signed_out' };
  }

  if (user.is_anonymous === true) {
    const { data: elder, error } = await sb
      .from('elder_monitors')
      .select('id, family_id, display_name, timezone')
      .eq('elder_user_id', user.id)
      .maybeSingle();
    throwIfError(error);
    if (elder === null) {
      return { status: 'signed_out' }; // móvil quitado del círculo: vuelve a pedir código
    }
    return {
      status: 'elder',
      userId: user.id,
      familyId: elder.family_id,
      elderId: elder.id,
      elderName: elder.display_name,
      timezone: asTimeZone(elder.timezone),
    };
  }

  const { data: profile, error: profileError } = await sb
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle();
  throwIfError(profileError);
  if (profile === null) {
    return { status: 'needs_profile', userId: user.id, email: user.email ?? null };
  }

  const { data: membership, error: memberError } = await sb
    .from('family_members')
    .select('id, family_id, role')
    .eq('user_id', user.id)
    .neq('role', 'elder')
    .order('joined_at')
    .limit(1)
    .maybeSingle();
  throwIfError(memberError);
  if (membership === null) {
    return { status: 'needs_family', userId: user.id, displayName: profile.display_name };
  }
  return {
    status: 'family',
    userId: user.id,
    displayName: profile.display_name,
    familyId: membership.family_id,
    memberId: membership.id,
    role: membership.role === 'admin' ? 'admin' : 'member',
  };
}

export function subscribeToAuthChanges(onChange: () => void): () => void {
  if (isDemoMode) {
    return () => undefined;
  }
  const { data } = requireSupabase().auth.onAuthStateChange(() => onChange());
  return () => data.subscription.unsubscribe();
}

export async function sendEmailCode(email: string): Promise<void> {
  if (isDemoMode) {
    return demoSendEmailCode();
  }
  if (isReviewAccount(email)) {
    return; // revisores de las tiendas: no se envía email, usan el código fijo de revisión
  }
  const { error } = await requireSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  throwIfError(error);
}

export async function verifyEmailCode(email: string, code: string): Promise<void> {
  if (isDemoMode) {
    return demoVerifyEmailCode(email);
  }
  const sb = requireSupabase();
  if (isReviewAccount(email)) {
    // La Edge Function comprueba el código fijo y devuelve un enlace de acceso de un solo uso.
    const { data, error } = await sb.functions.invoke('review-login', { body: { email, code } });
    if (error !== null) {
      throw new Error(await readFunctionError(error));
    }
    const tokenHash = (data as { tokenHash?: unknown } | null)?.tokenHash;
    if (typeof tokenHash !== 'string') {
      throw new Error('Token has expired or is invalid');
    }
    const { error: verifyError } = await sb.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
    throwIfError(verifyError);
    return;
  }
  const { error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' });
  throwIfError(error);
}

export type SocialProvider = 'apple' | 'google';

/** Apple y Google necesitan módulos nativos: llegan con el development build. */
export async function signInWithProvider(provider: SocialProvider): Promise<void> {
  if (isDemoMode) {
    return demoVerifyEmailCode(provider === 'apple' ? 'marta@ejemplo.es' : 'ruben@ejemplo.es');
  }
  throw new Error('El acceso con Apple y Google estará disponible en la versión instalada. De momento, entra con tu email.');
}

export async function signOut(): Promise<void> {
  if (isDemoMode) {
    return demoSignOut();
  }
  const { error } = await requireSupabase().auth.signOut();
  throwIfError(error);
}

export async function pairElderDevice(code: string): Promise<void> {
  if (isDemoMode) {
    return demoPairElderDevice(code);
  }
  const sb = requireSupabase();
  const { data } = await sb.auth.getSession();
  const user = data.session?.user;
  if (user !== undefined && user.is_anonymous !== true) {
    throw new Error('Este móvil tiene abierta la sesión de un acompañante. Ciérrala antes de unirlo como móvil de tu ser querido.');
  }
  if (user === undefined) {
    const { error } = await sb.auth.signInAnonymously();
    throwIfError(error);
  }
  const { error } = await sb.functions.invoke('redeem-pairing-code', { body: { code } });
  if (error !== null) {
    throw new Error(await readFunctionError(error));
  }
}

/** Las Edge Functions devuelven { error: '...' }: lo extraemos para mostrarlo bien. */
async function readFunctionError(error: unknown): Promise<string> {
  const context = (error as { context?: unknown }).context;
  if (context instanceof Response) {
    try {
      const body: unknown = await context.json();
      const message = (body as { error?: unknown }).error;
      if (typeof message === 'string') {
        return message;
      }
    } catch (parseError) {
      logError('pair-elder', parseError); // cuerpo no JSON: seguimos con el mensaje genérico
    }
  }
  return error instanceof Error ? error.message : 'No se pudo unir el móvil al círculo';
}
