import { MoreHorizontal } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Avatar, colorForPerson, familyColors, familySpacing, IconButton } from '@/shared/ui-family';

import { roleLabel, type FamilyMember } from '../schemas';

type Props = { member: FamilyMember; isMe: boolean; canManage: boolean; onOpenActions: (member: FamilyMember) => void };

// Fila limpia a cualquier ancho: avatar con su color · nombre en una línea · ⋯ (solo acompañantes).
export function MemberRow({ member, isMe, canManage, onOpenActions }: Props) {
  const showActions = canManage && !isMe && member.role !== 'elder';
  return (
    <View style={styles.row}>
      <Avatar name={member.displayName} size={46} ringColor={colorForPerson(member.userId)} />
      <View style={styles.info}>
        <AppText bold numberOfLines={1}>
          {isMe ? `${member.displayName} (tú)` : member.displayName}
        </AppText>
        <AppText variant="muted" numberOfLines={1}>
          {member.label !== null ? `${member.label} · ${roleLabel(member.role)}` : roleLabel(member.role)}
        </AppText>
      </View>
      {showActions && (
        <IconButton
          icon={<MoreHorizontal size={20} color={familyColors.text} />}
          onPress={() => onOpenActions(member)}
          accessibilityLabel={`Opciones de ${member.displayName}`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    paddingVertical: familySpacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: familyColors.border,
  },
  info: { flex: 1, minWidth: 0, gap: 2 },
});
