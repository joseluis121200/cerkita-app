import { z } from 'npm:zod@4';

import { adminClient } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';

// Webhook de RevenueCat. En la app, Purchases.logIn(family_id): app_user_id = id de la familia.
// En el panel de RevenueCat, cabecera Authorization = valor de REVENUECAT_WEBHOOK_AUTH.
const eventSchema = z.object({
  event: z.object({
    type: z.string(),
    app_user_id: z.string(),
    aliases: z.array(z.string()).optional(),
    expiration_at_ms: z.number().nullable().optional(),
  }),
});

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIVE_EVENTS = ['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'NON_RENEWING_PURCHASE'];

Deno.serve(async (req) => {
  const parsed = eventSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return errorResponse('Invalid payload', 400);
  }
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  if (expected === undefined || req.headers.get('Authorization') !== expected) {
    return errorResponse('Unauthorized', 401);
  }

  const event = parsed.data.event;
  const candidates = [event.app_user_id, ...(event.aliases ?? [])];
  const familyId = candidates.find((id) => UUID.test(id));
  if (familyId === undefined) {
    console.warn('RevenueCat event without family id', event.type);
    return json({ ignored: true });
  }

  const paidUntil = event.expiration_at_ms !== null && event.expiration_at_ms !== undefined
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  let update: Record<string, string | null> | null = null;
  if (ACTIVE_EVENTS.includes(event.type)) {
    update = { plan_status: 'active_paid', paid_until: paidUntil };
  } else if (event.type === 'BILLING_ISSUE') {
    update = { plan_status: 'grace_period' };
  } else if (event.type === 'EXPIRATION') {
    update = { plan_status: 'free_limited', paid_until: paidUntil };
  }
  // CANCELLATION: sigue activo hasta que llegue EXPIRATION. TEST y otros: nada que hacer.
  if (update === null) {
    return json({ ignored: event.type });
  }

  const admin = adminClient();
  const { error } = await admin
    .from('families')
    .update({ ...update, revenuecat_app_user_id: event.app_user_id })
    .eq('id', familyId);
  if (error !== null) {
    console.error('family plan update failed', error.message);
    return errorResponse('Update failed', 500);
  }
  return json({ ok: true, type: event.type });
});
