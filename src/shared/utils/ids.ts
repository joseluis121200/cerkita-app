// UUID v4 para nombres de archivo e ids locales. Hermes no trae crypto.randomUUID;
// no se usa para nada de seguridad (los tokens de invitación los genera Postgres).
export function createId(): string {
  const hex = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < 36; i++) {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      out += '-';
    } else if (i === 14) {
      out += '4';
    } else if (i === 19) {
      out += hex[(Math.random() * 4) | 8] ?? '8';
    } else {
      out += hex[(Math.random() * 16) | 0] ?? '0';
    }
  }
  return out;
}

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Extrae el primer UUID de un texto (útil para pegar un enlace de invitación entero). */
export function extractUuid(text: string): string | null {
  const match = UUID_PATTERN.exec(text);
  return match ? match[0].toLowerCase() : null;
}
