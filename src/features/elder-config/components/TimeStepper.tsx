import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';
import { minutesToTime, timeToMinutes } from '@/shared/utils/dates';
import { tapFeedback } from '@/shared/utils/haptics';

type Props = { label: string; helper: string; value: string; onChange: (time: string) => void };

const STEPS = [
  { delta: -60, label: '−1 h' },
  { delta: -5, label: '−5′' },
  { delta: 5, label: '+5′' },
  { delta: 60, label: '+1 h' },
] as const;

// Selector de hora sin dependencias nativas: botones grandes de ±5 minutos y ±1 hora.
export function TimeStepper({ label, helper, value, onChange }: Props) {
  function shift(delta: number) {
    tapFeedback();
    onChange(minutesToTime(timeToMinutes(value) + delta));
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <View style={styles.texts}>
          <AppText bold>{label}</AppText>
          <AppText variant="tiny">{helper}</AppText>
        </View>
        <Text style={styles.time} accessibilityLabel={`${label}: ${value}`}>
          {value}
        </Text>
      </View>
      <View style={styles.row}>
        {STEPS.map((step) => (
          <Pressable
            key={step.label}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${step.delta > 0 ? 'sumar' : 'restar'} ${Math.abs(step.delta)} minutos`}
            onPress={() => shift(step.delta)}
            style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
          >
            <Text style={styles.stepLabel}>{step.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.sm, paddingVertical: familySpacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.md },
  texts: { flex: 1 },
  time: { fontSize: 28, fontWeight: '800', color: familyColors.text, fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', gap: familySpacing.sm },
  step: {
    flex: 1,
    minHeight: 44,
    borderRadius: familyRadius.sm,
    borderWidth: 1,
    borderColor: familyColors.border,
    backgroundColor: familyColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepPressed: { backgroundColor: familyColors.surfaceWarm },
  stepLabel: { fontSize: 15, fontWeight: '700', color: familyColors.text },
});
