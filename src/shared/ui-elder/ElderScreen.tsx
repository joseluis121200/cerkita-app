import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { elderColors, elderSizes } from './theme';

type Props = { children: React.ReactNode };

// Con ScrollView el diseño no se rompe aunque el mayor tenga la fuente del sistema al máximo.
export function ElderScreen({ children }: Props) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: elderColors.background },
  content: { padding: elderSizes.padding, gap: elderSizes.gap + 4, flexGrow: 1 },
});
