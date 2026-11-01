import { localDateIn } from '@/shared/utils/dates';

import type { MomentWithAuthor, PhotoOfTheDay } from './schemas';

export type ElderPostcards = { postcards: MomentWithAuthor[]; isMemory: boolean };

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1_000_003;
  }
  return hash;
}

/**
 * Bucle "anti-días vacíos" (CONTEXT.md 3.2 punto 3): la foto más reciente de hoy o,
 * si nadie ha subido nada, un recuerdo del álbum. El recuerdo es el mismo todo el día.
 */
export function pickPhotoOfTheDay(
  moments: MomentWithAuthor[],
  timeZone: string,
  hideToday: boolean,
  now: Date = new Date(),
): PhotoOfTheDay | null {
  const today = localDateIn(timeZone, now);
  const todays: MomentWithAuthor[] = [];
  const older: MomentWithAuthor[] = [];
  for (const moment of moments) {
    if (localDateIn(timeZone, new Date(moment.createdAt)) === today) {
      todays.push(moment);
    } else {
      older.push(moment);
    }
  }

  const latestToday = todays[0];
  if (!hideToday && latestToday !== undefined) {
    return { moment: latestToday, isMemory: false };
  }
  if (older.length === 0) {
    return null;
  }
  const memory = older[hashText(today) % older.length];
  return memory === undefined ? null : { moment: memory, isMemory: true };
}

/**
 * Lo que ve la persona acompañada: todas las postales de hoy (de la más antigua a la más
 * reciente) o, si hoy no hay ninguna, un único recuerdo del álbum.
 */
export function pickElderPostcards(
  moments: MomentWithAuthor[],
  timeZone: string,
  hideToday: boolean,
  now: Date = new Date(),
): ElderPostcards {
  const today = localDateIn(timeZone, now);
  const todays = moments.filter((m) => localDateIn(timeZone, new Date(m.createdAt)) === today);
  if (!hideToday && todays.length > 0) {
    return { postcards: [...todays].reverse(), isMemory: false };
  }
  const memory = pickPhotoOfTheDay(moments, timeZone, true, now);
  return { postcards: memory === null ? [] : [memory.moment], isMemory: true };
}
