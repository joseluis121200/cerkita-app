import { throwIfError } from '@/shared/api/errors';
import { isDemoMode, MOMENTS_BUCKET, requireSupabase } from '@/shared/api/supabase';
import { createId } from '@/shared/utils/ids';
import type { CompressedPhoto } from '@/shared/utils/image';
import { readFileBytes } from '@/shared/utils/image';
import { logError } from '@/shared/utils/logger';

import { demoDeleteMoment, demoFetchMoments, demoHideTodayFlag, demoLockedCount, demoUploadMoment } from './demo';
import type { Moment } from './schemas';

const SIGNED_URL_SECONDS = 60 * 60;
const ALBUM_LIMIT = 120;

export async function fetchMoments(familyId: string): Promise<Moment[]> {
  if (isDemoMode) {
    return demoFetchMoments();
  }
  const sb = requireSupabase();
  const { data, error } = await sb
    .from('moments')
    .select('id, family_id, author_id, storage_path, caption, created_at')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })
    .limit(ALBUM_LIMIT);
  throwIfError(error);
  const rows = data ?? [];
  if (rows.length === 0) {
    return [];
  }

  // Bucket privado: cada foto se sirve con una URL firmada temporal (AGENTS.md regla 8).
  const { data: signed, error: signError } = await sb.storage
    .from(MOMENTS_BUCKET)
    .createSignedUrls(
      rows.map((r) => r.storage_path),
      SIGNED_URL_SECONDS,
    );
  throwIfError(signError);
  const urls = new Map<string, string>();
  for (const item of signed ?? []) {
    if (item.path !== null && item.signedUrl !== null && item.signedUrl.length > 0) {
      urls.set(item.path, item.signedUrl);
    }
  }

  const moments: Moment[] = [];
  for (const row of rows) {
    const url = urls.get(row.storage_path);
    if (url === undefined) {
      continue; // archivo borrado o caducado: no lo mostramos
    }
    moments.push({
      id: row.id,
      familyId: row.family_id,
      authorId: row.author_id,
      imageUrl: url,
      storagePath: row.storage_path,
      caption: row.caption,
      createdAt: row.created_at,
    });
  }
  return moments;
}

export async function uploadMoment(familyId: string, photo: CompressedPhoto, caption: string | null): Promise<void> {
  if (isDemoMode) {
    return demoUploadMoment(photo.uri, caption);
  }
  const sb = requireSupabase();
  const path = `${familyId}/${createId()}.webp`;
  const bytes = await readFileBytes(photo.uri);

  const { error: uploadError } = await sb.storage
    .from(MOMENTS_BUCKET)
    .upload(path, bytes, { contentType: 'image/webp', upsert: false });
  throwIfError(uploadError);

  const { error: insertError } = await sb.from('moments').insert({ family_id: familyId, storage_path: path, caption });
  if (insertError !== null) {
    // Sin fila en la tabla la foto quedaría huérfana: la borramos del almacenamiento.
    const { error: cleanupError } = await sb.storage.from(MOMENTS_BUCKET).remove([path]);
    if (cleanupError !== null) {
      logError('moments-upload-cleanup', cleanupError, { familyId });
    }
    throw new Error(insertError.message);
  }
}

export async function deleteMoment(moment: Moment): Promise<void> {
  if (isDemoMode) {
    return demoDeleteMoment(moment.id);
  }
  const sb = requireSupabase();
  const { error } = await sb.from('moments').delete().eq('id', moment.id);
  throwIfError(error);
  if (moment.storagePath !== null) {
    const { error: removeError } = await sb.storage.from(MOMENTS_BUCKET).remove([moment.storagePath]);
    if (removeError !== null) {
      // Si la foto no es tuya (admin borrando la de otro), la limpia cleanup-expired-media.
      logError('moments-delete-file', removeError, { momentId: moment.id });
    }
  }
}

/** Recuerdos de más de 14 días que el plan gratuito no puede ver (0 con Círculo Plus). */
export async function fetchLockedCount(familyId: string): Promise<number> {
  if (isDemoMode) {
    return demoLockedCount();
  }
  const { data, error } = await requireSupabase().rpc('count_locked_moments', { p_family_id: familyId });
  throwIfError(error);
  return data ?? 0;
}

/** Solo modo prueba: "simular día sin foto nueva". En modo real siempre es false. */
export async function fetchHideTodayFlag(): Promise<boolean> {
  if (isDemoMode) {
    return demoHideTodayFlag();
  }
  return false;
}
