import { z } from 'npm:zod@4';

import { adminClient, userFromRequest } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';

// Canjea el código de 6 dígitos y deja el móvil (sesión anónima) unido a la ficha del mayor.
const bodySchema = z.object({ code: z.string().regex(/^[0-9]{6}$/) });

// Límite de intentos contra fuerza bruta. Es por instancia (best-effort): con 10⁶ códigos
// posibles, 30 min de validez y un solo uso, basta para el MVP.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
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
    return errorResponse('Invalid or expired code', 400);
  }

  const admin = adminClient();
  const user = await userFromRequest(req, admin);
  if (user === null) {
    return errorResponse('Not authenticated', 401);
  }
  if (user.is_anonymous !== true) {
    return errorResponse('Elder devices must use an anonymous session', 403);
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(`ip:${ip}`) || isRateLimited(`user:${user.id}`)) {
    return errorResponse('Too many attempts: rate limit', 429);
  }

  const { data, error } = await admin.rpc('redeem_pairing_code', { p_code: parsed.data.code, p_user_id: user.id });
  if (error !== null) {
    if (error.message.includes('Invalid or expired code')) {
      return errorResponse('Invalid or expired code', 400);
    }
    console.error('redeem_pairing_code failed', error.message);
    return errorResponse('No se pudo completar la vinculación', 500);
  }
  const row = Array.isArray(data) ? data[0] : null;
  return json({ familyId: row?.paired_family_id ?? null, elderMonitorId: row?.paired_elder_monitor_id ?? null });
});
