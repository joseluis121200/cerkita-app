// Traduce errores técnicos (Postgres, Supabase, red) a mensajes cálidos y claros en español.
const KNOWN_MESSAGES: { match: string; message: string }[] = [
  { match: 'Invalid or expired code', message: 'Ese código no es válido o ha caducado. Pide uno nuevo a quien te acompaña.' },
  { match: 'Invalid invite link', message: 'Ese enlace de invitación no es válido. Pide otro a tu círculo.' },
  { match: 'already has 10 members', message: 'Este círculo ya tiene 10 personas, el máximo.' },
  { match: 'at most 4 elders', message: 'Un círculo puede acompañar como máximo a 4 seres queridos.' },
  { match: 'Free plan allows 1 loved one', message: 'El plan gratuito incluye 1 ser querido. Con Círculo Plus podéis acompañar hasta a 4.' },
  {
    match: 'Daily free postcard already used',
    message: '¡Ya has enviado tu postal gratuita de hoy! Mañana a las 00:00 tienes otra gratis, o desbloquea postales ilimitadas para todo el círculo con Círculo Plus.',
  },
  { match: 'at least one admin', message: 'El círculo necesita al menos un acompañante.' },
  { match: 'Not allowed', message: 'No tienes permiso para hacer esto.' },
  { match: 'Token has expired or is invalid', message: 'El código ha caducado o no es correcto. Pide uno nuevo.' },
  { match: 'Network request failed', message: 'No hay conexión a internet. Inténtalo de nuevo en un momento.' },
  { match: 'rate limit', message: 'Has hecho demasiados intentos. Espera unos minutos.' },
];

export function toUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  for (const known of KNOWN_MESSAGES) {
    if (raw.toLowerCase().includes(known.match.toLowerCase())) {
      return known.message;
    }
  }
  if (raw.length > 0 && raw.length < 140 && /[áéíóúñ¿¡]/i.test(raw)) {
    return raw; // ya es un mensaje nuestro en español
  }
  return 'Algo no ha ido bien. Inténtalo de nuevo.';
}

/** Lanza el error de Supabase como Error normal para que TanStack Query lo gestione. */
export function throwIfError(error: { message: string } | null): void {
  if (error !== null) {
    throw new Error(error.message);
  }
}
