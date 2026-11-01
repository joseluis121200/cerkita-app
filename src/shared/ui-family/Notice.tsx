import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { familyColors, familyRadius, familySpacing } from './theme';

type Tone = 'info' | 'warning' | 'calm';

const tones: Record<Tone, { bg: string; text: string }> = {
  info: { bg: familyColors.surfaceWarm, text: familyColors.text },
  warning: { bg: familyColors.warningSoft, text: familyColors.warningText },
  calm: { bg: familyColors.calmSoft, text: familyColors.calmText },
};

type Props = { text: string; tone?: Tone; icon?: React.ReactNode };

export function Notice({ text, tone = 'info', icon }: Props) {
  const colors = tones[tone];
  return (
    <View style={[styles.box, { backgroundColor: colors.bg }]}>
      {icon}
      <AppText variant="small" color={colors.text} style={styles.text}>
        {text}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.sm,
    padding: familySpacing.md,
    borderRadius: familyRadius.md,
  },
  text: { flex: 1 },
});
