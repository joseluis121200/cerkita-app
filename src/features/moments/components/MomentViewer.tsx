import { Image } from 'expo-image';
import { Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, familyColors, familySpacing } from '@/shared/ui-family';
import { formatClock } from '@/shared/utils/format';
import { DEFAULT_TIME_ZONE, relativeDayLabel } from '@/shared/utils/dates';

import type { MomentWithAuthor } from '../schemas';

type Props = {
  moment: MomentWithAuthor | null;
  canDelete: boolean;
  deleting: boolean;
  onDelete: (moment: MomentWithAuthor) => void;
  onClose: () => void;
};

export function MomentViewer({ moment, canDelete, deleting, onDelete, onClose }: Props) {
  return (
    <Modal visible={moment !== null} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        {moment !== null && (
          <View style={styles.content}>
            <Image source={{ uri: moment.imageUrl }} style={styles.image} contentFit="contain" />
            <AppText variant="heading">{moment.authorName}</AppText>
            <AppText variant="muted">{`${relativeDayLabel(moment.createdAt, DEFAULT_TIME_ZONE)} · ${formatClock(moment.createdAt, DEFAULT_TIME_ZONE)}`}</AppText>
            {moment.caption !== null && <AppText>{moment.caption}</AppText>}
            <View style={styles.actions}>
              {canDelete && <Button title="Borrar foto" variant="danger" loading={deleting} onPress={() => onDelete(moment)} />}
              <Button title="Cerrar" variant="secondary" onPress={onClose} />
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: familyColors.background },
  content: { flex: 1, padding: familySpacing.lg, gap: familySpacing.sm },
  image: { flex: 1, borderRadius: 22, backgroundColor: familyColors.surfaceWarm },
  actions: { gap: familySpacing.sm, marginTop: familySpacing.sm },
});
