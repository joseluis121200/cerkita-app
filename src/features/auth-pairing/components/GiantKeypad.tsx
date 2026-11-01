import { Pressable, StyleSheet, Text, View } from 'react-native';

import { elderColors, elderSizes, elderType } from '@/shared/ui-elder';
import { tapFeedback } from '@/shared/utils/haptics';

type Props = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
] as const;

// Teclado numérico propio: teclas de ≥ 68 dp, sin depender del teclado del sistema.
export function GiantKeypad({ onDigit, onDelete }: Props) {
  function press(action: () => void) {
    tapFeedback();
    action();
  }

  return (
    <View style={styles.grid}>
      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((digit) => (
            <Key key={digit} label={digit} onPress={() => press(() => onDigit(digit))} />
          ))}
        </View>
      ))}
      <View style={styles.row}>
        <Key label="Borrar" small onPress={() => press(onDelete)} accessibilityLabel="Borrar el último número" />
        <Key label="0" onPress={() => press(() => onDigit('0'))} />
        <View style={styles.spacer} />
      </View>
    </View>
  );
}

type KeyProps = { label: string; onPress: () => void; small?: boolean; accessibilityLabel?: string };

function Key({ label, onPress, small, accessibilityLabel }: KeyProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `Número ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
    >
      <Text style={[styles.keyLabel, small === true && styles.keyLabelSmall]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  key: {
    flex: 1,
    minHeight: elderSizes.touchMin + 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: elderColors.border,
    backgroundColor: elderColors.frame,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: elderColors.memorySoft },
  keyLabel: { fontSize: elderType.hero, fontWeight: '700', color: elderColors.text },
  keyLabelSmall: { fontSize: elderType.body },
  spacer: { flex: 1 },
});
