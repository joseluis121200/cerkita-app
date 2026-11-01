import type { Elder } from '@/features/elder-config';
import { addDays, isoWeekday, localDateIn } from '@/shared/utils/dates';

import type { DayCheckin, ElderDayState } from './schemas';

/** ¿Hay avisos hoy según el bitmask de días (lunes = 1 … domingo = 64)? */
export function isActiveDay(mask: number, localDate: string): boolean {
  const bit = 1 << (isoWeekday(localDate) - 1);
  return (mask & bit) !== 0;
}

export function deriveDayState(elder: Elder, checkins: DayCheckin[], now: Date = new Date()): ElderDayState {
  const today = localDateIn(elder.timezone, now);
  const row = checkins.find((c) => c.elderId === elder.id && c.localDate === today);

  // Un saludo o una resolución siempre ganan: es lo que más tranquiliza.
  if (row?.status === 'ok') return { kind: 'ok', at: row.confirmedAt, source: row.source };
  if (row?.status === 'resolved_by_admin') return { kind: 'resolved', byUserId: row.resolvedByUserId, note: row.resolutionNote };
  if (row?.status === 'alerted_admins') return { kind: 'alerted', checkinId: row.id };

  if (!elder.isPaired) return { kind: 'not_paired' };
  if (!elder.isEnabled) return { kind: 'disabled' };
  if (elder.pausedUntil !== null && elder.pausedUntil >= today) return { kind: 'paused', until: elder.pausedUntil };
  if (!isActiveDay(elder.activeDaysMask, today)) return { kind: 'rest_day' };

  if (row?.status === 'reminded_2') return { kind: 'reminded', level: 2, checkinId: row.id };
  if (row?.status === 'reminded_1') return { kind: 'reminded', level: 1, checkinId: row.id };
  return { kind: 'pending' };
}

/** Días seguidos con saludo (o resueltos por la familia), contando hoy si ya saludó. */
export function computeStreak(elder: Elder, checkins: DayCheckin[], now: Date = new Date()): number {
  const good = new Set<string>();
  for (const c of checkins) {
    if (c.elderId === elder.id && (c.status === 'ok' || c.status === 'resolved_by_admin')) {
      good.add(c.localDate);
    }
  }
  const today = localDateIn(elder.timezone, now);
  let day = good.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (good.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/**
 * Racha del Círculo: días seguidos con vida en el círculo (una postal compartida o un
 * saludo de la persona acompañada). Hoy cuenta si ya hubo algo; si no, se mira desde ayer.
 */
export function circleStreak(activityDays: string[], today: string): number {
  const days = new Set(activityDays);
  let day = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

/** Días en los que la persona acompañada saludó (o el círculo cerró el aviso). */
export function greetingDays(checkins: DayCheckin[]): string[] {
  const days: string[] = [];
  for (const c of checkins) {
    if (c.status === 'ok' || c.status === 'resolved_by_admin') {
      days.push(c.localDate);
    }
  }
  return days;
}

/** Fecha corta '2 nov.' para 'YYYY-MM-DD'. */
export function shortDate(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(date);
}
