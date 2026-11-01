import { StyleSheet, Text, View } from 'react-native';

import { ElderText, elderColors, elderSizes } from '@/shared/ui-elder';

type Props = { at: string | null; timeZone: string };

function formatTime(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone }).format(new Date(iso));
}

// Estado confirmado, sereno y elegante. Fijo: no desaparece solo (AGENTS.md 6).
export function GreetingConfirmation({ at, timeZone }: Props) {
  return (
    <View style={styles.box} accessibilityLiveRegion="polite" accessible>
      <View style={styles.sun}>
        <Text style={styles.sunEmoji}>☀️</Text>
      </View>
      <ElderText variant="title" center>
        ¡Buenos días enviados!
      </ElderText>
      <ElderText color={elderColors.textSoft} center>
        {at !== null ? `Tu círculo ya lo sabe · ${formatTime(at, timeZone)}` : 'Tu círculo ya lo sabe'}
      </ElderText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: elderColors.confirmedSurface,
    borderRadius: elderSizes.radius,
    borderWidth: 1,
    borderColor: elderColors.accentSoft,
    paddingVertical: 26,
    paddingHorizontal: 20,
    gap: 6,
    alignItems: 'center',
  },
  sun: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: elderColors.frame,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sunEmoji: { fontSize: 36 },
});
