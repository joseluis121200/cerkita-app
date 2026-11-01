import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { familyGradients, familyRadius, familySpacing } from './theme';

type Props = { children: React.ReactNode; variant: keyof typeof familyGradients; style?: StyleProp<ViewStyle> };

// Tarjeta de alto impacto con degradado (racha, reto del día, Círculo Plus…).
export function GradientCard({ children, variant, style }: Props) {
  return (
    <LinearGradient
      colors={familyGradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: familyRadius.lg + 2, padding: familySpacing.lg + 2, gap: familySpacing.sm, overflow: 'hidden' },
});
