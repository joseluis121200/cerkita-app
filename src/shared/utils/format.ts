import { localTimeIn } from './dates';

/** '09:18' para un instante ISO, en la zona indicada. */
export function formatClock(iso: string, timeZone: string): string {
  return localTimeIn(timeZone, new Date(iso));
}

/** 'Abuela Carmen' → 'A'. Para avatares con inicial. */
export function initialOf(name: string): string {
  return name.trim().slice(0, 1).toUpperCase();
}

/** Teléfono para el enlace tel: (sin espacios). */
export function telUrl(phone: string): string {
  return `tel:${phone.replace(/[^0-9+]/g, '')}`;
}
