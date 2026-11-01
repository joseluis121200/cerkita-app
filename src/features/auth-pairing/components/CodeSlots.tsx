import { StyleSheet, Text, View } from 'react-native';

import { elderColors, elderType } from '@/shared/ui-elder';

type Props = { value: string; length?: number };

// Las 6 casillas grandes donde aparece el código que va tecleando el mayor.
export function CodeSlots({ value, length = 6 }: Props) {
  const slots: string[] = [];
  for (let i = 0; i < length; i++) {
    slots.push(value[i] ?? '');
  }

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={value.length === 0 ? 'Código vacío' : `Código: ${value.split('').join(' ')}`}
    >
      {slots.map((digit, index) => (
        <View key={index} style={[styles.slot, index === value.length && styles.slotActive]}>
          <Text style={styles.digit}>{digit}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  slot: {
    flex: 1,
    maxWidth: 56,
    aspectRatio: 0.8,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: elderColors.border,
    backgroundColor: elderColors.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotActive: { borderColor: elderColors.primaryPressed },
  digit: { fontSize: elderType.hero, fontWeight: '800', color: elderColors.text },
});
