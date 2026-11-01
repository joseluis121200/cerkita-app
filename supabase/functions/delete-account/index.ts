import type { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@4';

import { adminClient, userFromRequest } from '../_shared/clients.ts';
import { errorResponse, json, readJson } from '../_shared/http.ts';

// «Eliminar mi cuenta y mis datos» (exigido por Apple y por el RGPD).
const bodySchema = z.object({ confirm: z.literal(true) });
const BUCKET = 'family-moments';

async function removeFiles(admin: SupabaseClient, paths: string[]): Promise<void> {
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await admin.storage.from(BUCKET).remove(paths.slice(i, i + 100));
    if (error !== null) {
      console.error('storage remove failed', error.message);
    }
  }
}

/** Borra una familia entera: fotos, móviles anónimos de los mayores y filas (en cascada). */
async function deleteFamily(admin: SupabaseClient, familyId: string): Promise<void> {
  const { data: moments } = await admin.from('moments').select('storage_path').eq('family_id', familyId);
  await removeFiles(admin, ((moments ?? []) as { storage_path: string }[]).map((m) => m.storage_path));
  const { data: elders } = await admin.from('elder_monitors').select('elder_user_id').eq('family_id', familyId);
  await admin.from('families').delete().eq('id', familyId);
  for (const elder of (elders ?? []) as { elder_user_id: string | null }[]) {
    if (elder.elder_user_id !== null) {
      await admin.auth.admin.deleteUser(elder.elder_user_id);
    }
  }
}

Deno.serve(async (req) => {
  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return errorResponse('Confirmation required', 400);
  }
  const admin = adminClient();
  const user = await userFromRequest(req, admin);
  if (user === null || user.is_anonymous === true) {
    return errorResponse('Not authenticated', 401);
  }

  const { data: memberships, error } = await admin
    .from('family_members')
    .select('family_id, role')
    .eq('user_id', user.id)
    .eq('role', 'admin');
  if (error !== null) {
    console.error('memberships query failed', error.message);
    return errorResponse('Delete failed', 500);
  }

  for (const membership of (memberships ?? []) as { family_id: string }[]) {
    const { data: others } = await admin
      .from('family_members')
      .select('id, role, joined_at')
      .eq('family_id', membership.family_id)
      .neq('user_id', user.id)
      .neq('role', 'elder')
      .order('joined_at');
    const rest = (others ?? []) as { id: string; role: string }[];
    if (rest.length === 0) {
      await deleteFamily(admin, membership.family_id);
    } else if (!rest.some((m) => m.role === 'admin')) {
      // Nunca dejamos una familia sin administrador: asciende al familiar más antiguo.
      const heir = rest[0];
      if (heir !== undefined) {
        await admin.from('family_members').update({ role: 'admin', receive_critical_emails: true }).eq('id', heir.id);
      }
    }
  }

  const { data: ownMoments } = await admin.from('moments').select('storage_path').eq('author_id', user.id);
  await removeFiles(admin, ((ownMoments ?? []) as { storage_path: string }[]).map((m) => m.storage_path));

  // Borra el usuario: profiles, family_members, moments y tokens caen en cascada.
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError !== null) {
    console.error('deleteUser failed', deleteError.message);
    return errorResponse('Delete failed', 500);
  }
  return json({ deleted: true });
});
