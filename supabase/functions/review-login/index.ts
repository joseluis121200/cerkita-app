import { z } from 'npm:zod@4';

import { adminClient } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';

// Acceso fijo para los revisores de App Store y Google Play, que no pueden recibir el código
// por email. Solo funciona con el email y el código guardados como secretos:
//   REVIEW_EMAIL (por defecto revisor@cercaapp.es) y REVIEW_OTP_CODE (6 cifras).
// Si REVIEW_OTP_CODE no está configurado, la función no deja entrar a nadie.
const bodySchema = z.object({ email: z.string().trim().toLowerCase().pipe(z.email()), code: z.string().regex(/^[0-9]{6}$/) });

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry === undefined || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return errorResponse('Token has expired or is invalid', 400);
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(`ip:${ip}`)) {
    return errorResponse('Too many attempts: rate limit', 429);
  }

  const reviewEmail = (Deno.env.get('REVIEW_EMAIL') ?? 'revisor@cercaapp.es').toLowerCase();
  const reviewCode = Deno.env.get('REVIEW_OTP_CODE');
  if (reviewCode === undefined || !/^[0-9]{6}$/.test(reviewCode)) {
    return errorResponse('Token has expired or is invalid', 401);
  }
  if (parsed.data.email !== reviewEmail || parsed.data.code !== reviewCode) {
    return errorResponse('Token has expired or is invalid', 401);
  }

  const admin = adminClient();
  // La cuenta de revisión se crea sola la primera vez (ya confirmada, sin enviar emails).
  const { error: createError } = await admin.auth.admin.createUser({ email: reviewEmail, email_confirm: true });
  if (createError !== null && !/already|registered|exists/i.test(createError.message)) {
    console.error('review user creation failed', createError.message);
    return errorResponse('Review login unavailable', 500);
  }
  // Genera un enlace de acceso sin enviarlo: la app lo canjea con verifyOtp({ token_hash }).
  const { data, error } = await admin.auth.admin.generateLink({ type: 'magiclink', email: reviewEmail });
  if (error !== null) {
    console.error('generateLink failed', error.message);
    return errorResponse('Review login unavailable', 500);
  }
  return json({ tokenHash: data.properties.hashed_token });
});
