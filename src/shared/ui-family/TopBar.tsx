import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { familyColors, familySpacing } from './theme';

type Props = { title: string; onBack: () => void };

// Cabecera de las pantallas que se abren encima de las pestañas (ficha, invitar…).
export function TopBar({ title, onBack }: Props) {
  return (
    <View style={styles.row}>
      <IconButton icon={<ChevronLeft size={22} color={familyColors.text} />} onPress={onBack} accessibilityLabel="Volver" />
      <AppText variant="heading" numberOfLines={1} style={styles.title}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.md },
  title: { flex: 1 },
});
