import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { familyColors, familySpacing } from './theme';

type Props = { visible: boolean; onClose: () => void; children: React.ReactNode };

// Hoja inferior moderna: fondo oscurecido, esquinas grandes y asa. Tocar fuera la cierra.
export function BottomSheet({ visible, onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + familySpacing.lg }]}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(24,24,38,0.55)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: familyColors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: familySpacing.sm,
  },
  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: familyColors.border, marginBottom: familySpacing.sm },
  content: { paddingHorizontal: familySpacing.lg, gap: familySpacing.md },
});
