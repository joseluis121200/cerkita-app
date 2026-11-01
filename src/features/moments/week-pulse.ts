import { addDays, DEFAULT_TIME_ZONE, isoWeekday, localDateIn } from '@/shared/utils/dates';

import type { MomentWithAuthor, PostcardComment, Reaction } from './schemas';

export type PulseDay = { date: string; letter: string; postcards: number; greeted: boolean };
export type PulseStar = { userId: string; postcards: number; kindness: number };

const LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** «Pulso de la semana»: últimos 7 días y la Estrella del Círculo 🏆 (postales + cariño). */
export function computeWeekPulse(
  moments: MomentWithAuthor[],
  greetingDates: string[],
  reactions: Reaction[],
  comments: PostcardComment[],
  now: Date = new Date(),
): { days: PulseDay[]; star: PulseStar | null } {
  const today = localDateIn(DEFAULT_TIME_ZONE, now);
  const days: PulseDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(today, -i);
    days.push({
      date,
      letter: LETTERS[isoWeekday(date) - 1] ?? '·',
      postcards: moments.filter((m) => localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) === date).length,
      greeted: greetingDates.includes(date),
    });
  }

  const firstDay = days[0]?.date ?? today;
  const weekMoments = moments.filter((m) => localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) >= firstDay);
  const weekIds = new Set(weekMoments.map((m) => m.id));
  const scores = new Map<string, PulseStar>();
  function entry(userId: string): PulseStar {
    const current = scores.get(userId) ?? { userId, postcards: 0, kindness: 0 };
    scores.set(userId, current);
    return current;
  }
  for (const m of weekMoments) entry(m.authorId).postcards += 1;
  for (const r of reactions) if (weekIds.has(r.momentId)) entry(r.userId).kindness += 1;
  for (const c of comments) if (weekIds.has(c.momentId)) entry(c.authorId).kindness += 1;

  let star: PulseStar | null = null;
  for (const candidate of scores.values()) {
    const score = candidate.postcards * 3 + candidate.kindness;
    if (star === null || score > star.postcards * 3 + star.kindness) {
      star = candidate;
    }
  }
  return { days, star };
}
