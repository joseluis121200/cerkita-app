import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { familyColors, familyRadius, familyShadow, familySpacing } from './theme';

type Tone = 'default' | 'warm' | 'calm' | 'alert' | 'warning';

const tones: Record<Tone, { bg: string; border: string }> = {
  default: { bg: familyColors.surface, border: familyColors.border },
  warm: { bg: familyColors.surfaceWarm, border: familyColors.border },
  calm: { bg: familyColors.surface, border: familyColors.border },
  alert: { bg: familyColors.accentSurface, border: familyColors.accent },
  warning: { bg: familyColors.warningSoft, border: familyColors.warningBorder },
};

type Props = { children: React.ReactNode; tone?: Tone; style?: StyleProp<ViewStyle> };

export function Card({ children, tone = 'default', style }: Props) {
  const colors = tones[tone];
  return <View style={[styles.card, { backgroundColor: colors.bg, borderColor: colors.border }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: familyRadius.lg,
    borderWidth: 1,
    padding: familySpacing.lg + 2,
    gap: familySpacing.sm,
    ...familyShadow,
  },
});
