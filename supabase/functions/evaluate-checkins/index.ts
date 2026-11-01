import { z } from 'npm:zod@4';

import { adminClient, isCronRequest } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';
import { evaluateCheckins } from './evaluate.ts';
import { notifyFamilyUpdates } from './family-updates.ts';
import { sendPendingNudges } from './nudges.ts';

// Llamada por pg_cron cada 5 minutos (0002_cron_setup.sql). Idempotente: se puede repetir sin
// duplicar recordatorios ni avisos.
const bodySchema = z.object({ triggered_at: z.string().optional() }).nullable();

Deno.serve(async (req) => {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return errorResponse('Invalid payload', 400);
  }
  if (!isCronRequest(req)) {
    return errorResponse('Unauthorized', 401);
  }
  try {
    const admin = adminClient();
    const now = new Date();
    const summary = await evaluateCheckins(admin, now);
    const familyUpdates = await notifyFamilyUpdates(admin, now);
    const nudges = await sendPendingNudges(admin, now);
    return json({ ...summary, familyUpdates, nudges });
  } catch (error) {
    console.error('evaluate-checkins failed', error instanceof Error ? error.message : String(error));
    return errorResponse('Evaluation failed', 500);
  }
});
