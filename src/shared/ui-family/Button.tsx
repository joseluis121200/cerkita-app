import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { tapFeedback } from '../utils/haptics';
import { familyColors, familyRadius, familySpacing } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'calm';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const palette: Record<Variant, { bg: string; pressed: string; text: string; border: string }> = {
  primary: { bg: familyColors.primary, pressed: familyColors.primaryPressed, text: familyColors.onPrimary, border: familyColors.primary },
  secondary: { bg: familyColors.surface, pressed: familyColors.surfaceWarm, text: familyColors.text, border: familyColors.border },
  ghost: { bg: 'transparent', pressed: familyColors.surfaceWarm, text: familyColors.text, border: 'transparent' },
  danger: { bg: familyColors.dangerSoft, pressed: familyColors.dangerPressed, text: familyColors.danger, border: familyColors.dangerPressed },
  calm: { bg: familyColors.calm, pressed: familyColors.calmPressed, text: familyColors.white, border: familyColors.calm },
};

export function Button({ title, onPress, variant = 'primary', icon, loading, disabled, accessibilityLabel, style }: Props) {
  const colors = palette[variant];
  const isDisabled = disabled === true || loading === true;

  function handlePress() {
    tapFeedback();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading === true }}
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: pressed ? colors.pressed : colors.bg, borderColor: colors.border },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading === true ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.label, { color: colors.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 54,
    borderRadius: familyRadius.pill,
    borderWidth: 1,
    paddingHorizontal: familySpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.sm },
  label: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  disabled: { opacity: 0.5 },
});
