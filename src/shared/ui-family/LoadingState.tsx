import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { familyColors, familySpacing } from './theme';

type Props = { label?: string; error?: string | null; onRetry?: () => void };

// Estado de carga / error reutilizable para cualquier pantalla familiar.
export function LoadingState({ label = 'Cargando…', error, onRetry }: Props) {
  if (error !== undefined && error !== null) {
    return (
      <View style={styles.box}>
        <AppText center>{error}</AppText>
        {onRetry !== undefined && <Button title="Reintentar" variant="secondary" onPress={onRetry} />}
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <ActivityIndicator color={familyColors.primaryPressed} size="large" />
      <AppText variant="muted">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: familySpacing.md, padding: familySpacing.xl },
});
