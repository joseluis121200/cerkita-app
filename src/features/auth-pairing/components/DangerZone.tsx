import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/shared/api/errors';
import { AppText, Button, Card, Notice, TextField, familySpacing } from '@/shared/ui-family';

import { useDeleteAccount } from '../family-hooks';

const CONFIRM_WORD = 'ELIMINAR';

// «Eliminar mi cuenta y mis datos» (exigido por Apple): confirmación escribiendo una palabra.
export function DangerZone({ onDeleted }: { onDeleted: () => void }) {
  const [open, setOpen] = useState(false);
  const [word, setWord] = useState('');
  const deleteAccount = useDeleteAccount();

  function confirm() {
    deleteAccount.mutate(undefined, { onSuccess: onDeleted });
  }

  return (
    <Card>
      <AppText variant="heading">Eliminar mi cuenta y mis datos</AppText>
      <AppText variant="muted">
        Se borran tu perfil y tus postales. Si eres el único acompañante y no queda nadie más en el círculo, se
        elimina el círculo completo. Esta acción no se puede deshacer.
      </AppText>
      {!open ? (
        <Button title="Eliminar mi cuenta" variant="danger" onPress={() => setOpen(true)} />
      ) : (
        <View style={styles.confirm}>
          <TextField
            label={`Para confirmar, escribe ${CONFIRM_WORD}`}
            value={word}
            onChangeText={setWord}
            autoCapitalize="none"
          />
          {deleteAccount.isError && <Notice tone="warning" text={toUserMessage(deleteAccount.error)} />}
          <Button
            title="Eliminar definitivamente"
            variant="danger"
            disabled={word.trim().toUpperCase() !== CONFIRM_WORD}
            loading={deleteAccount.isPending}
            onPress={confirm}
          />
          <Button title="Cancelar" variant="ghost" onPress={() => setOpen(false)} />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({ confirm: { gap: familySpacing.sm } });
