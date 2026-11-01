import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, Avatar, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';

import { describeActiveDays, lovedOneTitle, TIME_ZONE_LABELS, type Elder } from '../schemas';

type Props = { elder: Elder; onPress: () => void; inactiveByPlan: boolean };

export function ElderListItem({ elder, onPress, inactiveByPlan }: Props) {
  const status = !elder.isPaired
    ? 'Falta unir su móvil'
    : inactiveByPlan
      ? 'Sin avisos: el plan gratuito incluye 1 ser querido'
      : `Hora límite del saludo: ${elder.adminAlertAt}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Configurar a ${lovedOneTitle(elder)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar name={elder.displayName} size={48} />
      <View style={styles.info}>
        <AppText bold>{lovedOneTitle(elder)}</AppText>
        <AppText variant="muted">{status}</AppText>
        <AppText variant="tiny">{`${TIME_ZONE_LABELS[elder.timezone]} · ${describeActiveDays(elder.activeDaysMask)}`}</AppText>
      </View>
      <ChevronRight size={22} color={familyColors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    padding: familySpacing.md,
    borderRadius: familyRadius.lg,
    borderWidth: 1,
    borderColor: familyColors.border,
    backgroundColor: familyColors.surface,
  },
  pressed: { backgroundColor: familyColors.surfaceWarm },
  info: { flex: 1, gap: 2 },
});
