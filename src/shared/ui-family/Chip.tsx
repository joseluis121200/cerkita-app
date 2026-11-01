import { Pressable, StyleSheet, Text } from 'react-native';

import { tapFeedback } from '../utils/haptics';
import { familyColors, familyRadius, familySpacing } from './theme';

type Props = { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string };

export function Chip({ label, selected, onPress, accessibilityLabel }: Props) {
  function handlePress() {
    tapFeedback();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      onPress={handlePress}
      style={[styles.chip, selected ? styles.selected : styles.idle]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: familySpacing.md,
    borderRadius: familyRadius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: { backgroundColor: familyColors.surface, borderColor: familyColors.border },
  selected: { backgroundColor: familyColors.text, borderColor: familyColors.text },
  label: { fontSize: 15, fontWeight: '600', color: familyColors.text },
  labelSelected: { color: familyColors.white },
});
