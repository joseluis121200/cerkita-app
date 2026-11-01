import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useFamilyContext } from '@/features/auth-pairing';
import { captionSchema, DailyWinkCard, myPostcardsToday, pickPhoto, PhotoSourceButtons, useCompressPhoto, useMoments, useUploadMoment, type PickSource } from '@/features/moments';
import { usePlan } from '@/features/subscription';
import { toUserMessage } from '@/shared/api/errors';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, Button, Card, familyColors, familyRadius, Notice, Screen, TextField } from '@/shared/ui-family';
import { formatKilobytes, type CompressedPhoto } from '@/shared/utils/image';

export default function Upload() {
  const session = useFamilyContext();
  const plan = usePlan(session?.familyId);
  const { moments } = useMoments(session?.familyId);
  const compress = useCompressPhoto();
  const upload = useUploadMoment(session?.familyId ?? '');
  const [photo, setPhoto] = useState<CompressedPhoto | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  // Plan gratuito: 1 postal al día POR PERSONA (cada miembro del círculo tiene la suya).
  const limit = plan?.dailyPostcards ?? null;
  const usedToday = myPostcardsToday(moments, session?.userId ?? '');
  const freeUsed = limit !== null && usedToday >= limit;

  async function choose(source: PickSource) {
    setError(null);
    setSent(false);
    const result = await pickPhoto(source);
    if (result.status === 'denied') {
      setError('Necesitamos permiso para la cámara o las fotos. Puedes darlo en los ajustes del móvil.');
      return;
    }
    if (result.status === 'cancelled') {
      return;
    }
    compress.mutate(result.photo.uri, { onSuccess: setPhoto, onError: (e) => setError(toUserMessage(e)) });
  }

  function send() {
    if (photo === null) {
      return;
    }
    const parsed = captionSchema.safeParse(caption);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa el texto');
      return;
    }
    upload.mutate(
      { photo, caption: parsed.data.length > 0 ? parsed.data : null },
      {
        onSuccess: () => {
          setPhoto(null);
          setCaption('');
          setSent(true);
        },
        onError: (uploadError) => setError(toUserMessage(uploadError)),
      },
    );
  }

  return (
    <Screen>
      <AppText variant="title">Tu postal de hoy</AppText>
      <AppText variant="muted">Algo sencillo de tu día: un café, el perro, el camino al trabajo. Es lo que más ilusión hace.</AppText>
      <Notice
        tone={freeUsed ? 'warning' : 'info'}
        text={limit === null ? 'Círculo Plus: postales ilimitadas para todo el círculo.' : `Tu postal gratis de hoy (${Math.min(usedToday, limit)}/${limit}) · cada persona del círculo tiene la suya`}
      />
      {!freeUsed && photo === null && <DailyWinkCard onAnswer={() => void choose('camera')} />}

      {freeUsed && !sent ? (
        <Card tone="alert">
          <AppText variant="heading">💌 ¡Ya has enviado tu postal gratuita de hoy!</AppText>
          <AppText>
            {FEATURE_FLAGS.SHOW_PLUS_UPSELL
              ? 'Mañana a las 00:00 tienes otra gratis, o desbloquea postales ilimitadas para todo el círculo con Círculo Plus.'
              : 'Mañana a las 00:00 tienes otra gratis. Mientras, reacciona y comenta las del resto del círculo.'}
          </AppText>
          {FEATURE_FLAGS.SHOW_PLUS_UPSELL && (
            <Button title="Postales ilimitadas con Círculo Plus" onPress={() => router.push('/paywall')} />
          )}
          <Button title="Ver las postales de hoy" variant="secondary" onPress={() => router.push('/home')} />
        </Card>
      ) : (
        <PhotoSourceButtons onPick={(source) => void choose(source)} disabled={compress.isPending || upload.isPending} />
      )}

      {compress.isPending && <Notice text="Preparando la foto…" />}
      {photo !== null && (
        <Card>
          <Image source={{ uri: photo.uri }} style={styles.preview} contentFit="cover" />
          <AppText variant="tiny">{`Foto optimizada: ${formatKilobytes(photo.bytes)} · ${photo.width}×${photo.height}`}</AppText>
          <TextField
            label="Un mensaje (opcional)"
            value={caption}
            onChangeText={setCaption}
            placeholder="¡Buenos días! ☀️"
            maxLength={140}
            multiline
          />
          <Button title="Mandar al círculo" loading={upload.isPending} onPress={send} />
          <Button title="Elegir otra" variant="ghost" onPress={() => setPhoto(null)} />
        </Card>
      )}
      {sent && (
        <Card>
          <AppText variant="heading">¡Postal enviada! 💌</AppText>
          <AppText>Tu ser querido la verá en grande en su pantalla de la mañana.</AppText>
          <Button title="Ver la postal" variant="secondary" onPress={() => router.push('/home')} />
        </Card>
      )}
      {error !== null && <Notice tone="warning" text={error} />}
      <AppText variant="tiny" color={familyColors.textMuted}>
        Comparte solo fotos de personas que estén de acuerdo en aparecer.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({ preview: { width: '100%', aspectRatio: 4 / 5, borderRadius: familyRadius.lg } });
