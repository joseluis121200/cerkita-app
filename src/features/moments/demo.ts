import { demoLatency, readDemo, updateDemo } from '@/shared/demo';
import { DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';
import { createId } from '@/shared/utils/ids';

import type { Moment } from './schemas';

const HISTORY_MS = 14 * 86_400_000;

function demoHasPlus(planStatus: string): boolean {
  return planStatus === 'active_paid' || planStatus === 'grace_period';
}

// Igual que la RLS de la migración 0003: el plan gratuito solo ve los últimos 14 días.
export async function demoFetchMoments(): Promise<Moment[]> {
  const state = await readDemo();
  const limit = Date.now() - HISTORY_MS;
  const visible = demoHasPlus(state.family.planStatus)
    ? state.moments
    : state.moments.filter((m) => new Date(m.createdAt).getTime() > limit);
  const sorted = [...visible].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return sorted.map((m) => ({
    id: m.id,
    familyId: state.family.id,
    authorId: m.authorId,
    imageUrl: m.imageUrl,
    storagePath: null,
    caption: m.caption,
    createdAt: m.createdAt,
  }));
}

export async function demoUploadMoment(localUri: string, caption: string | null): Promise<void> {
  await demoLatency(700);
  await updateDemo((state) => {
    const today = localDateIn(DEFAULT_TIME_ZONE);
    const authorId = state.persona.kind === 'family' ? state.persona.userId : 'desconocido';
    // 1 postal gratis al día POR PERSONA (mismo límite que el trigger de la migración 0004).
    const usedToday = state.moments.some(
      (m) => m.authorId === authorId && localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) === today,
    );
    if (usedToday && !demoHasPlus(state.family.planStatus)) {
      throw new Error('Daily free postcard already used');
    }
    // En modo prueba la foto se queda en el móvil (la URI ya comprimida).
    state.moments.push({ id: createId(), authorId, imageUrl: localUri, caption, createdAt: new Date().toISOString() });
    state.hideTodayPhotos = false;
  });
}

export async function demoDeleteMoment(momentId: string): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    state.moments = state.moments.filter((m) => m.id !== momentId);
  });
}

export async function demoLockedCount(): Promise<number> {
  const state = await readDemo();
  if (demoHasPlus(state.family.planStatus)) {
    return 0;
  }
  const limit = Date.now() - HISTORY_MS;
  return state.moments.filter((m) => new Date(m.createdAt).getTime() <= limit).length;
}

export async function demoHideTodayFlag(): Promise<boolean> {
  const state = await readDemo();
  return state.hideTodayPhotos;
}
