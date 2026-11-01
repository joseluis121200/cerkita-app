import { Camera, Images } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, familyColors, familySpacing } from '@/shared/ui-family';

import type { PickSource } from '../picker';

type Props = { onPick: (source: PickSource) => void; disabled: boolean };

export function PhotoSourceButtons({ onPick, disabled }: Props) {
  return (
    <View style={styles.row}>
      <Button
        title="Hacer foto"
        icon={<Camera size={20} color={familyColors.onPrimary} />}
        disabled={disabled}
        onPress={() => onPick('camera')}
        style={styles.flex}
      />
      <Button
        title="Galería"
        variant="secondary"
        icon={<Images size={20} color={familyColors.text} />}
        disabled={disabled}
        onPress={() => onPick('library')}
        style={styles.flex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: familySpacing.sm },
  flex: { flex: 1 },
});
