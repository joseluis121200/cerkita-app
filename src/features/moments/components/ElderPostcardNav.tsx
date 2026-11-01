import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ElderText, elderColors, elderSizes, elderType } from '@/shared/ui-elder';
import { tapFeedback } from '@/shared/utils/haptics';

type Props = { index: number; total: number; onPrev: () => void; onNext: () => void };

// Pase sencillo entre las postales de hoy: dos botones grandes y claros, sin gestos.
export function ElderPostcardNav({ index, total, onPrev, onNext }: Props) {
  return (
    <View style={styles.wrapper}>
      <ElderText variant="large" center>
        {`${total} postales nuevas hoy · ${index + 1} de ${total}`}
      </ElderText>
      <View style={styles.row}>
        <NavButton label="◀ Anterior" disabled={index === 0} onPress={onPrev} />
        <NavButton label="Siguiente ▶" disabled={index >= total - 1} onPress={onNext} />
      </View>
    </View>
  );
}

function NavButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label.replace(/[◀▶]/g, '').trim() + ' postal'}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.button, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1,
    minHeight: elderSizes.touchMin,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: elderColors.border,
    backgroundColor: elderColors.frame,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  disabled: { opacity: 0.35 },
  pressed: { backgroundColor: elderColors.memorySoft },
  label: { fontSize: elderType.body, fontWeight: '800', color: elderColors.text },
});
