import { addDays, DEFAULT_TIME_ZONE, isoAtLocalTime, localDateIn } from '../utils/dates';
import type { DemoComment, DemoMoment, DemoReaction } from './types';

// Postales, reacciones y comentarios de ejemplo de «El círculo de Carmen».
export const PEOPLE = {
  ruben: 'u0000000-0000-4000-8000-000000000001',
  marta: 'u0000000-0000-4000-8000-000000000002',
  lucia: 'u0000000-0000-4000-8000-000000000003',
  ana: 'u0000000-0000-4000-8000-000000000004',
  pablo: 'u0000000-0000-4000-8000-000000000005',
  carmenUser: 'u-elder-carmen',
} as const;

// [días atrás, autor, pie]. Las de más de 14 días quedan bloqueadas en el plan gratuito.
const PAST: [number, string, string][] = [
  [40, PEOPLE.marta, 'Cumpleaños de Sara: ¡ya tiene 7 años! 🎂'],
  [25, PEOPLE.ruben, 'Domingo de paella en el pueblo 🥘'],
  [18, PEOPLE.lucia, 'Mira qué dibujo te ha hecho Sara 🎨'],
  [11, PEOPLE.lucia, '¡Buenos días, abuela! Primer café de la mañana ☕'],
  [10, PEOPLE.ruben, 'Amanecer desde la Alhambra 🌅'],
  [9, PEOPLE.ana, 'Te he dejado unas magdalenas en la puerta 🧁'],
  [8, PEOPLE.marta, 'Lucas ya se ata solo los cordones 👟'],
  [7, PEOPLE.pablo, 'Partido del sábado: ¡ganamos 3-1! ⚽'],
  [6, PEOPLE.ruben, 'Hoy toca gazpacho, ¡con tu receta! 🍅'],
  [5, PEOPLE.ana, 'Las flores del patio ya han salido 🌸'],
  [4, PEOPLE.marta, 'Camino del trabajo, te mando un abrazo 💛'],
  [3, PEOPLE.lucia, 'Ensayo del coro de los martes 🎶'],
  [2, PEOPLE.pablo, 'Mi primera tortilla de patatas 🍳'],
  [1, PEOPLE.ruben, '¡Mañana vamos a verte! 🤗'],
];

export function demoPhotoUrl(seed: string): string {
  return `https://picsum.photos/seed/cerca-${seed}/900/1125`;
}

/** Hora de hoy (Madrid) sin pasarse de "ahora" y sin salirse del día. */
function todayAt(now: Date, time: string, minutesAgo: number): string {
  const today = localDateIn(DEFAULT_TIME_ZONE, now);
  const start = new Date(isoAtLocalTime(DEFAULT_TIME_ZONE, today, '00:01')).getTime();
  const wanted = new Date(isoAtLocalTime(DEFAULT_TIME_ZONE, today, time)).getTime();
  const latest = now.getTime() - minutesAgo * 60_000;
  return new Date(Math.max(start, Math.min(wanted, latest))).toISOString();
}

export function seedMoments(now: Date): DemoMoment[] {
  const today = localDateIn(DEFAULT_TIME_ZONE, now);
  const past = PAST.map(([daysAgo, authorId, caption]) => ({
    id: `m-seed-${daysAgo}`,
    authorId,
    imageUrl: demoPhotoUrl(`postal-${daysAgo}`),
    caption,
    createdAt: isoAtLocalTime(DEFAULT_TIME_ZONE, addDays(today, -daysAgo), '08:40'),
  }));
  // Hoy ya hay postales de dos personas distintas: así se ve el círculo vivo nada más entrar.
  const todays: DemoMoment[] = [
    {
      id: 'm-today-ruben',
      authorId: PEOPLE.ruben,
      imageUrl: demoPhotoUrl(`hoy-ruben-${today}`),
      caption: 'Primer café antes del trabajo ☕ ¡Buenos días, mamá!',
      createdAt: todayAt(now, '08:10', 180),
    },
    {
      id: 'm-today-lucia',
      authorId: PEOPLE.lucia,
      imageUrl: demoPhotoUrl(`hoy-lucia-${today}`),
      caption: 'Tarde de playa en Almuñécar 🏖️',
      createdAt: todayAt(now, '13:05', 25),
    },
  ];
  return [...past, ...todays];
}

export function seedReactions(): DemoReaction[] {
  return [
    { momentId: 'm-today-ruben', userId: PEOPLE.lucia, emoji: '❤️' },
    { momentId: 'm-today-ruben', userId: PEOPLE.marta, emoji: '☀️' },
    { momentId: 'm-today-lucia', userId: PEOPLE.ana, emoji: '🥰' },
    { momentId: 'm-today-lucia', userId: PEOPLE.ruben, emoji: '👏' },
    { momentId: 'm-today-lucia', userId: PEOPLE.marta, emoji: '❤️' },
    { momentId: 'm-seed-1', userId: PEOPLE.carmenUser, emoji: '🥰' },
    { momentId: 'm-seed-1', userId: PEOPLE.ana, emoji: '👏' },
    { momentId: 'm-seed-2', userId: PEOPLE.marta, emoji: '❤️' },
  ];
}

export function seedComments(now: Date): DemoComment[] {
  const at = (minutesAgo: number) => new Date(now.getTime() - minutesAgo * 60_000).toISOString();
  return [
    { id: 'c-1', momentId: 'm-today-ruben', authorId: PEOPLE.ana, body: '¡Buenos días, vecino! ☀️', createdAt: at(120) },
    { id: 'c-2', momentId: 'm-today-lucia', authorId: PEOPLE.marta, body: '¡Qué envidia de playa, Lucía! 😍', createdAt: at(15) },
    { id: 'c-3', momentId: 'm-today-lucia', authorId: PEOPLE.ruben, body: '¡Qué bonito! Guárdame un sitio 💛', createdAt: at(8) },
  ];
}
