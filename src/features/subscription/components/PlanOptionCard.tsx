import { Pressable, StyleSheet, View } from 'react-native';

import { AppText, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';

import { PLAN_OPTIONS, type PlanOption } from '../plan';

type Props = { option: PlanOption; selected: boolean; onSelect: () => void };

export function PlanOptionCard({ option, selected, onSelect }: Props) {
  const info = PLAN_OPTIONS[option];
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${info.title}: ${info.price}. ${info.detail}`}
      onPress={onSelect}
      style={[styles.card, selected ? styles.selected : styles.idle]}
    >
      <View style={styles.row}>
        <AppText variant="heading">{info.title}</AppText>
        {info.badge !== null && (
          <AppText variant="tiny" bold style={styles.badge} color={familyColors.calmText}>
            {info.badge}
          </AppText>
        )}
      </View>
      <AppText bold>{info.price}</AppText>
      <AppText variant="muted">{info.detail}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: familyRadius.lg, borderWidth: 2, padding: familySpacing.lg, gap: 4 },
  idle: { borderColor: familyColors.border, backgroundColor: familyColors.surface },
  selected: { borderColor: familyColors.primary, backgroundColor: familyColors.accentSurface },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { backgroundColor: familyColors.calmSoft, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, overflow: 'hidden' },
});
