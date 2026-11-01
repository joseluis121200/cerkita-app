import { Pressable, StyleSheet } from 'react-native';

import { tapFeedback } from '../utils/haptics';
import { familyColors } from './theme';

type Props = { icon: React.ReactNode; onPress: () => void; accessibilityLabel: string; tone?: 'light' | 'dark' };

// Botón solo icono de 40 × 40 dp (por ejemplo, el ⋯ de cada persona del círculo).
export function IconButton({ icon, onPress, accessibilityLabel, tone = 'light' }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.button, tone === 'dark' && styles.dark, pressed && styles.pressed]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: familyColors.surfaceWarm,
    borderWidth: 1,
    borderColor: familyColors.border,
  },
  dark: { backgroundColor: 'transparent', borderColor: familyColors.onNightMuted },
  pressed: { opacity: 0.6 },
});
