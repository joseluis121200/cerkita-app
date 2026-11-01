import { z } from 'zod';

import { minutesToTime, timeToMinutes, type TimeZoneId } from '@/shared/utils/dates';

export type Elder = {
  id: string;
  familyId: string;
  isPaired: boolean;
  displayName: string;
  relationshipLabel: string | null;
  timezone: TimeZoneId;
  phoneForCall: string | null;
  windowStart: string;
  reminder1At: string;
  reminder2At: string;
  adminAlertAt: string;
  activeDaysMask: number;
  pausedUntil: string | null;
  isEnabled: boolean;
  createdAt: string;
};

export type ElderInput = Omit<Elder, 'id' | 'familyId' | 'isPaired' | 'createdAt'>;

export type PairingCode = { code: string; validUntil: string };

export const DEFAULT_ELDER_INPUT: ElderInput = {
  displayName: '',
  relationshipLabel: null,
  timezone: 'Europe/Madrid',
  phoneForCall: null,
  windowStart: '07:30',
  reminder1At: '10:30',
  reminder2At: '11:05',
  adminAlertAt: '11:30',
  activeDaysMask: 127,
  pausedUntil: null,
  isEnabled: true,
};

// Lunes = bit 1 … domingo = bit 64 (igual que active_days_mask en la base de datos).
export const WEEK_DAYS = [
  { bit: 1, short: 'L', name: 'lunes' },
  { bit: 2, short: 'M', name: 'martes' },
  { bit: 4, short: 'X', name: 'miércoles' },
  { bit: 8, short: 'J', name: 'jueves' },
  { bit: 16, short: 'V', name: 'viernes' },
  { bit: 32, short: 'S', name: 'sábado' },
  { bit: 64, short: 'D', name: 'domingo' },
] as const;

// Etiquetas abiertas: Cerca sirve para padres, abuelos, tíos, vecinos queridos, padrinos o amigos.
export const RELATIONSHIP_OPTIONS = [
  'Madre',
  'Padre',
  'Abuela',
  'Abuelo',
  'Tía',
  'Tío',
  'Vecina especial',
  'Vecino especial',
  'Amiga querida',
  'Amigo querido',
  'Madrina',
  'Padrino',
] as const;

/** "Carmen · Abuela" (o solo el nombre si no hay relación). */
export function lovedOneTitle(elder: Pick<Elder, 'displayName' | 'relationshipLabel'>): string {
  if (elder.relationshipLabel === null || elder.relationshipLabel.length === 0) {
    return elder.displayName;
  }
  return `${elder.displayName} · ${elder.relationshipLabel}`;
}

export const TIME_ZONE_LABELS: Record<TimeZoneId, string> = {
  'Europe/Madrid': 'Península y Baleares',
  'Atlantic/Canary': 'Canarias',
};

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no válida');

export const elderInputSchema = z
  .object({
    displayName: z.string().trim().min(1, 'Escribe su nombre (por ejemplo, Carmen)').max(40, 'Máximo 40 caracteres'),
    relationshipLabel: z.string().trim().max(30, 'La relación puede tener como máximo 30 caracteres').nullable(),
    timezone: z.enum(['Europe/Madrid', 'Atlantic/Canary']),
    phoneForCall: z
      .string()
      .regex(/^\+?[0-9]{9,15}$/, 'Escribe un teléfono válido, solo números (9 a 15 cifras)')
      .nullable(),
    windowStart: time,
    reminder1At: time,
    reminder2At: time,
    adminAlertAt: time,
    activeDaysMask: z.number().int().min(1, 'Elige al menos un día').max(127),
    pausedUntil: z.string().nullable(),
    isEnabled: z.boolean(),
  })
  .superRefine((value, ctx) => {
    const order = [value.windowStart, value.reminder1At, value.reminder2At, value.adminAlertAt].map(timeToMinutes);
    for (let i = 1; i < order.length; i++) {
      const previous = order[i - 1] ?? 0;
      const current = order[i] ?? 0;
      if (current <= previous) {
        ctx.addIssue({
          code: 'custom',
          message: 'Las horas deben ir en orden: inicio de la mañana → recordatorios → hora límite',
          path: ['adminAlertAt'],
        });
        return;
      }
    }
  });

/**
 * Plan gratuito: los recordatorios no se ven (son de Círculo Plus), pero la base de datos exige
 * el orden inicio < recordatorio 1 < recordatorio 2 < hora límite. Los repartimos solos.
 */
export function spreadReminders(values: ElderInput): ElderInput {
  const start = timeToMinutes(values.windowStart);
  const limit = timeToMinutes(values.adminAlertAt);
  if (limit - start < 3) {
    return values; // la validación avisará de que el orden no es correcto
  }
  const step = Math.floor((limit - start) / 3);
  return { ...values, reminder1At: minutesToTime(start + step), reminder2At: minutesToTime(start + step * 2) };
}

/** Quita espacios y guiones de un teléfono escrito a mano: "600 11 22 33" → "600112233". */
export function normalizePhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s-]/g, '');
  return cleaned.length === 0 ? null : cleaned;
}

export function describeActiveDays(mask: number): string {
  if (mask === 127) return 'Todos los días';
  if (mask === 31) return 'De lunes a viernes';
  if (mask === 96) return 'Fines de semana';
  const names: string[] = [];
  for (const day of WEEK_DAYS) {
    if ((mask & day.bit) !== 0) names.push(day.short);
  }
  return names.join(' · ');
}
