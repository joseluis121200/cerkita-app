import { DEFAULT_TIME_ZONE, localDateIn } from '../utils/dates';
import { DEMO_IDS } from './seed';
import { resetDemo, updateDemo } from './store';
import type { DemoPersona } from './types';

// Acciones de la píldora "Modo Prueba Rápida" (solo __DEV__ y modo prueba).
export async function setDemoPersona(persona: DemoPersona): Promise<void> {
  await updateDemo((state) => {
    state.persona = persona;
  });
}

export async function toggleNoPhotoToday(): Promise<boolean> {
  return updateDemo((state) => {
    state.hideTodayPhotos = !state.hideTodayPhotos;
    state.persona = { kind: 'elder', elderId: DEMO_IDS.carmen };
    return state.hideTodayPhotos;
  });
}

/** Borra mis postales de hoy para volver a probar la subida con la postal gratis. */
export async function freeMyPostcardToday(): Promise<void> {
  await updateDemo((state) => {
    const userId = state.persona.kind === 'family' ? state.persona.userId : DEMO_IDS.ruben;
    const today = localDateIn(DEFAULT_TIME_ZONE);
    state.moments = state.moments.filter(
      (m) => !(m.authorId === userId && localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) === today),
    );
    state.hideTodayPhotos = false;
    state.persona = { kind: 'family', userId };
  });
}

/** Círculo sin seres queridos: para probar el alta desde cero (1.º, 2.º… con Plus). */
export async function startWithZeroLovedOnes(): Promise<void> {
  await updateDemo((state) => {
    state.elders = [];
    state.checkins = [];
    state.pairingCodes = [];
    state.members = state.members.filter((m) => m.role !== 'elder');
    state.persona = { kind: 'family', userId: DEMO_IDS.ruben };
  });
}

/** Simula que pasó la hora límite y Carmen no ha dado señales: aviso en el panel. */
export async function simulateMissedGreeting(): Promise<void> {
  await updateDemo((state) => {
    const today = localDateIn('Europe/Madrid');
    state.checkins = state.checkins.filter((c) => !(c.elderId === DEMO_IDS.carmen && c.localDate === today));
    state.checkins.push({
      id: `c-alert-${Date.now()}`,
      elderId: DEMO_IDS.carmen,
      localDate: today,
      status: 'alerted_admins',
      confirmedAt: null,
      source: null,
      resolvedByUserId: null,
      resolutionNote: null,
    });
    state.persona = { kind: 'family', userId: DEMO_IDS.ruben };
  });
}

/** Alterna entre el plan gratuito y Círculo Plus. Devuelve true si queda en Plus. */
export async function togglePlusPlan(): Promise<boolean> {
  return updateDemo((state) => {
    const isPlus = state.family.planStatus === 'active_paid';
    if (isPlus) {
      state.family.planStatus = 'free_limited';
      state.family.paidUntil = null;
    } else {
      state.family.planStatus = 'active_paid';
      state.family.paidUntil = new Date(Date.now() + 30 * 86_400_000).toISOString();
    }
    state.persona = { kind: 'family', userId: DEMO_IDS.ruben };
    return !isPlus;
  });
}

export async function restartDemo(): Promise<void> {
  await resetDemo();
}

export { DEMO_IDS };
