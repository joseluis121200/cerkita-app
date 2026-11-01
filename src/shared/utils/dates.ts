// Fechas y horas siempre calculadas en la zona horaria del mayor (AGENTS.md, regla 6).
export type TimeZoneId = 'Europe/Madrid' | 'Atlantic/Canary';

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number };

function pad(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export function partsInZone(date: Date, timeZone: string): ZonedParts {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const result: ZonedParts = { year: 0, month: 0, day: 0, hour: 0, minute: 0 };
  for (const part of formatter.formatToParts(date)) {
    const value = Number(part.value);
    if (part.type === 'year') result.year = value;
    if (part.type === 'month') result.month = value;
    if (part.type === 'day') result.day = value;
    // Algunos motores devuelven "24" a medianoche: lo normalizamos a 0.
    if (part.type === 'hour') result.hour = value % 24;
    if (part.type === 'minute') result.minute = value;
  }
  return result;
}

/** Fecha local 'YYYY-MM-DD' en la zona indicada. */
export function localDateIn(timeZone: string, date: Date = new Date()): string {
  const p = partsInZone(date, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Hora local 'HH:MM' en la zona indicada. */
export function localTimeIn(timeZone: string, date: Date = new Date()): string {
  const p = partsInZone(date, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

/** 'HH:MM:SS' o 'HH:MM' → minutos desde medianoche. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':');
  return Number(h ?? 0) * 60 + Number(m ?? 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
}

/** Postgres devuelve 'HH:MM:SS'; en la app trabajamos con 'HH:MM'. */
export function toShortTime(time: string): string {
  return time.slice(0, 5);
}

/** Suma días a una fecha 'YYYY-MM-DD' sin depender de la zona del dispositivo. */
export function addDays(localDate: string, days: number): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const base = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1));
  base.setUTCDate(base.getUTCDate() + days);
  return `${base.getUTCFullYear()}-${pad(base.getUTCMonth() + 1)}-${pad(base.getUTCDate())}`;
}

/** 1 = lunes … 7 = domingo para una fecha 'YYYY-MM-DD'. */
export function isoWeekday(localDate: string): number {
  const [y, m, d] = localDate.split('-').map(Number);
  const day = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1)).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Instante ISO correspondiente a 'HH:MM' de un día local en una zona (para datos de prueba). */
export function isoAtLocalTime(timeZone: string, localDate: string, time: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const guess = Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0);
  const p = partsInZone(new Date(guess), timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
  return new Date(guess - (asIfUtc - guess)).toISOString();
}

/** 'jueves, 30 de octubre' */
export function formatLongDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('es-ES', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).format(date);
}

/** 'Hoy', 'Ayer' o '27 oct.' según la fecha local en la zona. */
export function relativeDayLabel(iso: string, timeZone: string): string {
  const day = localDateIn(timeZone, new Date(iso));
  const today = localDateIn(timeZone);
  if (day === today) return 'Hoy';
  if (day === addDays(today, -1)) return 'Ayer';
  return new Intl.DateTimeFormat('es-ES', { timeZone, day: 'numeric', month: 'short' }).format(new Date(iso));
}

/** Días naturales (redondeando hacia arriba) desde ahora hasta un instante ISO. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000);
}

/** Zona por defecto para la vista familiar (los hijos casi siempre están en península). */
export const DEFAULT_TIME_ZONE: TimeZoneId = 'Europe/Madrid';
