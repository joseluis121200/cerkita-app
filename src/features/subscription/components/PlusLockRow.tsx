import { Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';

type Props = { title: string; detail: string; onPress: () => void };

// Fila de función bloqueada. Con SHOW_PLUS_UPSELL = false se muestra sin invitar a pagar.
export function PlusLockRow({ title, detail, onPress }: Props) {
  const content = (
    <>
      <Lock size={18} color={familyColors.textMuted} />
      <View style={styles.texts}>
        <AppText bold>{title}</AppText>
        <AppText variant="tiny">{FEATURE_FLAGS.SHOW_PLUS_UPSELL ? `${detail} · Con Círculo Plus` : detail}</AppText>
      </View>
    </>
  );
  if (!FEATURE_FLAGS.SHOW_PLUS_UPSELL) {
    return <View style={styles.row}>{content}</View>;
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${title}. Disponible con Círculo Plus`} onPress={onPress} style={styles.row}>
      {content}
      <AppText variant="small" bold color={familyColors.primary}>
        Ver
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    padding: familySpacing.md,
    borderRadius: familyRadius.md,
    backgroundColor: familyColors.surfaceWarm,
    borderWidth: 1,
    borderColor: familyColors.border,
  },
  texts: { flex: 1 },
});
