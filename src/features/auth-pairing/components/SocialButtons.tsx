import { StyleSheet, View } from 'react-native';

import { Button } from '@/shared/ui-family';

import type { SocialProvider } from '../session.api';

type Props = { onPress: (provider: SocialProvider) => void; loading: SocialProvider | null };

// Botones preparados para Apple y Google. En Expo Go explican que llegan con la app instalada.
export function SocialButtons({ onPress, loading }: Props) {
  return (
    <View style={styles.column}>
      <Button
        title="Continuar con Apple"
        variant="secondary"
        loading={loading === 'apple'}
        onPress={() => onPress('apple')}
      />
      <Button
        title="Continuar con Google"
        variant="secondary"
        loading={loading === 'google'}
        onPress={() => onPress('google')}
      />
    </View>
  );
}

const styles = StyleSheet.create({ column: { gap: 10 } });
