import { StyleSheet, Text, View } from 'react-native';

import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, BottomSheet, Button, familyColors, GradientCard } from '@/shared/ui-family';

type Props = { visible: boolean; title: string; message: string; onClose: () => void; onUpgrade: () => void };

// Hoja que explica un límite del plan gratuito. Con SHOW_PLUS_UPSELL = false solo informa.
export function PlusUpsellSheet({ visible, title, message, onClose, onUpgrade }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <GradientCard variant="coral">
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>{title}</Text>
      </GradientCard>
      <AppText>{message}</AppText>
      <View style={styles.actions}>
        {FEATURE_FLAGS.SHOW_PLUS_UPSELL ? (
          <>
            <Button title="Ver Círculo Plus" onPress={() => { onClose(); onUpgrade(); }} />
            <Button title="Ahora no" variant="ghost" onPress={onClose} />
          </>
        ) : (
          <Button title="Entendido" variant="secondary" onPress={onClose} />
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  emoji: { fontSize: 32 },
  title: { color: familyColors.white, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  actions: { gap: 8 },
});
