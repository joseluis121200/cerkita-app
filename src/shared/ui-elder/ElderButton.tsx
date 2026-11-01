import { useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { tapFeedback } from '../utils/haptics';
import { elderColors, elderSizes, elderType } from './theme';

type Variant = 'primary' | 'secondary';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

// Ignora un segundo toque durante 1,2 s: evita dobles envíos por temblor o pulsación insistente.
const DOUBLE_TAP_GUARD_MS = 1200;

// Botón píldora gigante (≥ 70 dp). El primario es Coral Cereza con texto blanco grande.
export function ElderButton({ title, onPress, variant = 'primary', loading, accessibilityLabel, accessibilityHint }: Props) {
  const lastPress = useRef(0);
  const isPrimary = variant === 'primary';

  function handlePress() {
    const now = Date.now();
    if (now - lastPress.current < DOUBLE_TAP_GUARD_MS) {
      return;
    }
    lastPress.current = now;
    tapFeedback('medium');
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: loading === true }}
      onPress={handlePress}
      disabled={loading === true}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pressed && (isPrimary ? styles.primaryPressed : styles.secondaryPressed),
      ]}
    >
      <View style={styles.content}>
        {loading === true ? (
          <ActivityIndicator size="large" color={isPrimary ? elderColors.onPrimary : elderColors.text} />
        ) : (
          <Text style={[styles.label, !isPrimary && styles.labelSecondary]}>{title}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: elderSizes.touchMin + 8,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: elderColors.primary,
    shadowColor: elderColors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryPressed: { backgroundColor: elderColors.primaryPressed, transform: [{ scale: 0.98 }] },
  secondary: { backgroundColor: elderColors.frame, borderWidth: 2, borderColor: elderColors.border },
  secondaryPressed: { backgroundColor: elderColors.memorySoft },
  content: { alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: elderType.large, fontWeight: '800', color: elderColors.onPrimary, textAlign: 'center', lineHeight: 34 },
  labelSecondary: { fontSize: elderType.body, fontWeight: '700', color: elderColors.text },
});
