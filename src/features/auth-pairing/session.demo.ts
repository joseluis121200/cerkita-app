import { DEMO_IDS, demoLatency, readDemo, resetDemo, updateDemo } from '@/shared/demo';

import type { AppSession } from './schemas';

// Implementación del modo prueba (sin Supabase). Misma forma que session.api.ts.
export async function demoFetchSession(): Promise<AppSession> {
  const state = await readDemo();
  const persona = state.persona;
  if (persona.kind === 'signed_out') {
    return { status: 'signed_out' };
  }
  if (persona.kind === 'elder') {
    const elder = state.elders.find((e) => e.id === persona.elderId);
    if (elder === undefined) {
      return { status: 'signed_out' };
    }
    return {
      status: 'elder',
      userId: elder.userId ?? `u-elder-${elder.id}`,
      familyId: state.family.id,
      elderId: elder.id,
      elderName: elder.displayName,
      timezone: elder.timezone,
    };
  }
  const profile = state.profiles.find((p) => p.id === persona.userId);
  if (profile === undefined) {
    return { status: 'needs_profile', userId: persona.userId, email: null };
  }
  const member = state.members.find((m) => m.userId === persona.userId && m.role !== 'elder');
  if (member === undefined) {
    return { status: 'needs_family', userId: profile.id, displayName: profile.displayName };
  }
  return {
    status: 'family',
    userId: profile.id,
    displayName: profile.displayName,
    familyId: state.family.id,
    memberId: member.id,
    role: member.role === 'admin' ? 'admin' : 'member',
  };
}

export async function demoSendEmailCode(): Promise<void> {
  await demoLatency(500);
}

/** En modo prueba vale cualquier código de 6 cifras. El email elige quién entra. */
export async function demoVerifyEmailCode(email: string): Promise<void> {
  await demoLatency(400);
  await updateDemo((state) => {
    const profile = state.profiles.find((p) => p.email === email);
    state.persona = { kind: 'family', userId: profile?.id ?? DEMO_IDS.ruben };
  });
}

export async function demoSignOut(): Promise<void> {
  await updateDemo((state) => {
    state.persona = { kind: 'signed_out' };
  });
}

export async function demoPairElderDevice(code: string): Promise<void> {
  await demoLatency(600);
  const found = await updateDemo((state) => {
    const pairing = state.pairingCodes.find((p) => p.code === code && new Date(p.expiresAt).getTime() > Date.now());
    if (pairing === undefined) {
      return false;
    }
    const elder = state.elders.find((e) => e.id === pairing.elderId);
    if (elder === undefined) {
      return false;
    }
    const userId = `u-elder-${elder.id}`;
    // Si ya tenía otro móvil vinculado, ese pierde el acceso (igual que en el servidor).
    state.members = state.members.filter((m) => !(m.role === 'elder' && m.userId === elder.userId));
    elder.userId = userId;
    state.members.push({
      id: `fm-${userId}`,
      userId,
      role: 'elder',
      label: elder.displayName,
      receiveCriticalEmails: false,
      joinedAt: new Date().toISOString(),
    });
    state.pairingCodes = state.pairingCodes.filter((p) => p.code !== code);
    state.persona = { kind: 'elder', elderId: elder.id };
    return true;
  });
  if (!found) {
    throw new Error('Invalid or expired code');
  }
}

export async function demoDeleteAccount(): Promise<void> {
  await demoLatency(600);
  await resetDemo();
}
