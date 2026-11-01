import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { toUserMessage } from '@/shared/api/errors';
import { AppText, Button, Card, familyColors, familySpacing, Notice, TextField } from '@/shared/ui-family';

import { useMembers, useSaveProfile, useUpdateMyPreferences } from '../family-hooks';
import { displayNameSchema, firstIssue, roleLabelSchema } from '../schemas';

type Props = { familyId: string; userId: string; memberId: string; displayName: string };

export function ProfileSection({ familyId, userId, memberId, displayName }: Props) {
  const members = useMembers(familyId);
  const me = members.data?.find((m) => m.id === memberId);
  const saveProfile = useSaveProfile();
  const updatePrefs = useUpdateMyPreferences(familyId);
  const [name, setName] = useState(displayName);
  const [label, setLabel] = useState(me?.label ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    const nameCheck = displayNameSchema.safeParse(name);
    const labelCheck = roleLabelSchema.safeParse(label);
    const problem = firstIssue(nameCheck) ?? firstIssue(labelCheck);
    if (problem !== null || !nameCheck.success || !labelCheck.success) {
      setError(problem);
      return;
    }
    setError(null);
    try {
      await saveProfile.mutateAsync({ userId, displayName: nameCheck.data });
      await updatePrefs.mutateAsync({ memberId, changes: { label: labelCheck.data.length > 0 ? labelCheck.data : null } });
      setSaved(true);
    } catch (saveError) {
      setError(toUserMessage(saveError));
    }
  }

  return (
    <Card>
      <AppText variant="heading">Tu perfil</AppText>
      <TextField label="Tu nombre" value={name} onChangeText={(t) => { setName(t); setSaved(false); }} maxLength={60} autoCapitalize="words" />
      <TextField
        label="Cómo te ve tu ser querido"
        value={label}
        onChangeText={(t) => { setLabel(t); setSaved(false); }}
        placeholder="Ej. Nieta Lucía, Vecina Ana"
        helper="En su pantalla aparecerá «Tu nieta Lucía»"
        maxLength={40}
      />
      <View style={styles.switchRow}>
        <View style={styles.flex}>
          <AppText bold>Recibir avisos por email</AppText>
          <AppText variant="tiny">Si tu ser querido no saluda a la hora límite (Círculo Plus).</AppText>
        </View>
        <Switch
          accessibilityLabel="Recibir avisos por email"
          value={me?.receiveCriticalEmails ?? false}
          onValueChange={(value) => updatePrefs.mutate({ memberId, changes: { receiveCriticalEmails: value } })}
          trackColor={{ true: familyColors.primary, false: familyColors.border }}
        />
      </View>
      {error !== null && <Notice tone="warning" text={error} />}
      {saved && <Notice tone="calm" text="Guardado ✅" />}
      <Button title="Guardar perfil" variant="secondary" loading={saveProfile.isPending || updatePrefs.isPending} onPress={() => void save()} />
    </Card>
  );
}

const styles = StyleSheet.create({
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.md },
  flex: { flex: 1 },
});
