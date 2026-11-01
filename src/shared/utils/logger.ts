// Punto único de registro de errores. Cuando instalemos Sentry (development build),
// solo hay que cambiar este archivo. Nunca registrar datos personales: solo ids (AGENTS.md 9).
type Context = Record<string, string | number | boolean | null | undefined>;

export function logError(scope: string, error: unknown, context: Context = {}): void {
  const message = error instanceof Error ? error.message : String(error);
  if (__DEV__) {
    console.warn(`[${scope}] ${message}`, context);
  }
}

export function logInfo(scope: string, message: string, context: Context = {}): void {
  if (__DEV__) {
    console.log(`[${scope}] ${message}`, context);
  }
}
