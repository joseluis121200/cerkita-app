// Hora local del mayor en su zona (Europe/Madrid o Atlantic/Canary). AGENTS.md regla 6.
export type LocalNow = { localDate: string; minutes: number; isoWeekday: number };

export function localNow(timeZone: string, date: Date): LocalNow {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    parts[part.type] = part.value;
  }
  const weekdays: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const hour = Number(parts.hour ?? '0') % 24;
  return {
    localDate: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: hour * 60 + Number(parts.minute ?? '0'),
    isoWeekday: weekdays[parts.weekday ?? 'Mon'] ?? 1,
  };
}

/** 'HH:MM' o 'HH:MM:SS' → minutos desde medianoche. */
export function toMinutes(time: string): number {
  const [h, m] = time.split(':');
  return Number(h ?? '0') * 60 + Number(m ?? '0');
}

export function isActiveDay(mask: number, isoWeekday: number): boolean {
  return (mask & (1 << (isoWeekday - 1))) !== 0;
}
