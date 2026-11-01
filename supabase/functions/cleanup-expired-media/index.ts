import { z } from 'npm:zod@4';

import { adminClient, isCronRequest } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';
import { hasPlus, type FamilyPlanRow } from '../_shared/plan.ts';

// Cron diario (04:00 UTC). Plan gratuito: la app enseña los últimos 14 días y el resto queda
// "bloqueado" (se desbloquea con Círculo Plus). Para contener costes, las postales de los
// círculos gratuitos se borran al cumplir 1 año. También pasa a 'free_limited' los círculos
// cuya suscripción ya terminó (por si se perdió algún webhook).
const bodySchema = z.object({ triggered_at: z.string().optional() }).nullable();
const BUCKET = 'family-moments';
const FREE_RETENTION_DAYS = 365;

type FamilyRow = FamilyPlanRow & { id: string };

Deno.serve(async (req) => {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return errorResponse('Invalid payload', 400);
  }
  if (!isCronRequest(req)) {
    return errorResponse('Unauthorized', 401);
  }

  const admin = adminClient();
  const now = new Date();
  const cutoff = new Date(now.getTime() - FREE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: families, error } = await admin.from('families').select('id, plan_status, paid_until');
  if (error !== null) {
    console.error('families query failed', error.message);
    return errorResponse('Cleanup failed', 500);
  }

  let downgraded = 0;
  let removed = 0;
  for (const family of (families ?? []) as FamilyRow[]) {
    if (hasPlus(family, now)) {
      continue;
    }
    if (family.plan_status !== 'free_limited') {
      const { error: updateError } = await admin.from('families').update({ plan_status: 'free_limited' }).eq('id', family.id);
      if (updateError === null) {
        downgraded += 1;
      }
    }

    const { data: old, error: oldError } = await admin
      .from('moments')
      .select('id, storage_path')
      .eq('family_id', family.id)
      .lt('created_at', cutoff)
      .limit(1000);
    if (oldError !== null || old === null || old.length === 0) {
      continue;
    }
    const rows = old as { id: string; storage_path: string }[];
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      const { error: removeError } = await admin.storage.from(BUCKET).remove(chunk.map((r) => r.storage_path));
      if (removeError !== null) {
        console.error('storage remove failed', family.id, removeError.message);
        continue;
      }
      await admin.from('moments').delete().in('id', chunk.map((r) => r.id));
      removed += chunk.length;
    }
  }
  return json({ downgraded, removed });
});
