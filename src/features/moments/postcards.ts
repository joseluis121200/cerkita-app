import { DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';

import type { MomentWithAuthor } from './schemas';

/** Postales compartidas hoy (día natural de la península, como el límite del servidor). */
export function todaysPostcards(moments: MomentWithAuthor[], now: Date = new Date()): MomentWithAuthor[] {
  const today = localDateIn(DEFAULT_TIME_ZONE, now);
  return moments.filter((m) => localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) === today);
}

/** Días ('YYYY-MM-DD') en los que el círculo compartió alguna postal. */
export function postcardDays(moments: MomentWithAuthor[]): string[] {
  const days = new Set<string>();
  for (const moment of moments) {
    days.add(localDateIn(DEFAULT_TIME_ZONE, new Date(moment.createdAt)));
  }
  return [...days];
}

/** Mis postales de hoy (el límite gratuito es de 1 por persona y día). */
export function myPostcardsToday(moments: MomentWithAuthor[], userId: string, now: Date = new Date()): number {
  return todaysPostcards(moments, now).filter((m) => m.authorId === userId).length;
}
