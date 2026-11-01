import { Phone } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/shared/api/errors';
import { AppText, Button, Card, familyColors, familySpacing, Notice, TextField } from '@/shared/ui-family';

import type { ElderOverview } from '../hooks';
import { useResolveCheckin } from '../hooks';
import { resolutionNoteSchema } from '../schemas';
import { callPhone } from './ElderStatusCard';

type Props = { overview: ElderOverview; familyId: string; canResolve: boolean };

// Tarjeta prioritaria cuando un mayor no ha dado señales a la hora límite.
export function AlertCard({ overview, familyId, canResolve }: Props) {
  const { elder, state } = overview;
  const resolve = useResolveCheckin(familyId);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.kind !== 'alerted') {
    return null;
  }
  const checkinId = state.checkinId;

  function confirm() {
    const parsed = resolutionNoteSchema.safeParse(note);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa la nota');
      return;
    }
    const cleanNote = parsed.data.length > 0 ? parsed.data : null;
    resolve.mutate(
      { checkinId, note: cleanNote },
      { onError: (mutationError) => setError(toUserMessage(mutationError)) },
    );
  }

  return (
    <Card tone="alert">
      <AppText variant="heading">{`${elder.displayName} aún no ha mandado los buenos días`}</AppText>
      <AppText>Lo más probable es que esté bien. Una llamada rápida os deja a todos tranquilos.</AppText>
      {elder.phoneForCall !== null ? (
        <Button
          title="Llamar ahora"
          icon={<Phone size={18} color={familyColors.onPrimary} />}
          onPress={() => callPhone(elder.phoneForCall ?? '')}
          accessibilityLabel={`Llamar ahora a ${elder.displayName}`}
        />
      ) : (
        <Notice tone="warning" text="Añade su teléfono en «Seres queridos» para poder llamarle con un toque." />
      )}
      {canResolve && (
        <View style={styles.resolve}>
          {showNote && (
            <TextField
              label="Nota para el resto del círculo (opcional)"
              value={note}
              onChangeText={setNote}
              placeholder="Ej. Estaba en el mercado, todo bien"
              maxLength={200}
            />
          )}
          {error !== null && <Notice tone="warning" text={error} />}
          <Button
            title={`Ya hablé con ${elder.displayName}, está todo bien ✅`}
            variant="calm"
            loading={resolve.isPending}
            onPress={showNote ? confirm : () => setShowNote(true)}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({ resolve: { gap: familySpacing.sm, marginTop: familySpacing.xs } });
