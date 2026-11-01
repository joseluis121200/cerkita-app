import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { elderColors, elderType } from './theme';

type Variant = 'body' | 'large' | 'title' | 'hero';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  center?: boolean;
  style?: StyleProp<TextStyle>;
};

// Nunca desactivamos allowFontScaling: si el mayor agranda la letra del sistema, se respeta.
export function ElderText({ children, variant = 'body', color, center, style }: Props) {
  return (
    <Text style={[styles[variant], color !== undefined && { color }, center === true && styles.center, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: elderType.body, lineHeight: 31, color: elderColors.text },
  large: { fontSize: elderType.large, lineHeight: 34, color: elderColors.text, fontWeight: '600' },
  title: { fontSize: elderType.title, lineHeight: 39, color: elderColors.text, fontWeight: '700', letterSpacing: -0.3 },
  hero: { fontSize: elderType.hero, lineHeight: 44, color: elderColors.text, fontWeight: '800', letterSpacing: -0.5 },
  center: { textAlign: 'center' },
});
