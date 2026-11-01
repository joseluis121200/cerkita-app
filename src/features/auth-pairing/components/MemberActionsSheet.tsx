import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { toUserMessage } from '@/shared/api/errors';
import { AppText, Avatar, BottomSheet, Button, colorForPerson, familySpacing, Notice, TextField } from '@/shared/ui-family';

import { useRemoveMember, useSetMemberLabel, useSetMemberRole } from '../family-hooks';
import { roleLabel, type FamilyMember } from '../schemas';

type Props = { familyId: string; member: FamilyMember | null; onClose: () => void };

type Mode = 'menu' | 'label' | 'remove';

// Hoja de acciones de una persona del círculo (solo para acompañantes).
export function MemberActionsSheet({ familyId, member, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('menu');
  const [label, setLabel] = useState('');
  const setRole = useSetMemberRole(familyId);
  const setMemberLabel = useSetMemberLabel(familyId);
  const remove = useRemoveMember(familyId);
  const error = setRole.error ?? setMemberLabel.error ?? remove.error;

  function close() {
    setMode('menu');
    setRole.reset();
    setMemberLabel.reset();
    remove.reset();
    onClose();
  }

  if (member === null) {
    return null;
  }
  const isAdmin = member.role === 'admin';

  return (
    <BottomSheet visible onClose={close}>
      <View style={styles.header}>
        <Avatar name={member.displayName} size={56} ringColor={colorForPerson(member.userId)} />
        <View style={styles.info}>
          <AppText variant="heading" numberOfLines={1}>{member.displayName}</AppText>
          <AppText variant="muted" numberOfLines={1}>{member.label ?? roleLabel(member.role)}</AppText>
        </View>
      </View>

      {mode === 'menu' && (
        <>
          <Button
            title={isAdmin ? 'Pasar a miembro del círculo' : 'Nombrar acompañante'}
            loading={setRole.isPending}
            onPress={() => setRole.mutate({ memberId: member.id, role: isAdmin ? 'member' : 'admin' }, { onSuccess: close })}
          />
          <Button title="Editar relación" variant="secondary" onPress={() => { setLabel(member.label ?? ''); setMode('label'); }} />
          <Button title="Quitar del círculo" variant="danger" onPress={() => setMode('remove')} />
        </>
      )}

      {mode === 'label' && (
        <>
          <TextField label="Relación" value={label} onChangeText={setLabel} placeholder="Ej. Nieto Pablo, Vecina Ana" maxLength={40} />
          <Button
            title="Guardar relación"
            loading={setMemberLabel.isPending}
            onPress={() => setMemberLabel.mutate({ memberId: member.id, label }, { onSuccess: close })}
          />
          <Button title="Cancelar" variant="ghost" onPress={() => setMode('menu')} />
        </>
      )}

      {mode === 'remove' && (
        <>
          <Notice tone="warning" text={`${member.displayName} dejará de ver las postales del círculo. Podrá volver a entrar con una invitación.`} />
          <Button title="Sí, quitar del círculo" variant="danger" loading={remove.isPending} onPress={() => remove.mutate(member.id, { onSuccess: close })} />
          <Button title="Cancelar" variant="ghost" onPress={() => setMode('menu')} />
        </>
      )}

      {error !== null && <Notice tone="warning" text={toUserMessage(error)} />}
      {mode === 'menu' && <Button title="Cerrar" variant="ghost" onPress={close} />}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.md, paddingBottom: familySpacing.sm },
  info: { flex: 1, minWidth: 0 },
});
