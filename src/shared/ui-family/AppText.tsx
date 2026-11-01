import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { familyColors, familyType } from './theme';

type Variant = 'title' | 'heading' | 'body' | 'small' | 'muted' | 'tiny';

type Props = {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  center?: boolean;
  bold?: boolean;
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
};

export function AppText({ children, variant = 'body', color, center, bold, numberOfLines, style }: Props) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        styles[variant],
        color !== undefined && { color },
        center === true && styles.center,
        bold === true && styles.bold,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: familyType.title, fontWeight: '800', color: familyColors.text, lineHeight: 34, letterSpacing: -0.4 },
  heading: { fontSize: familyType.heading, fontWeight: '700', color: familyColors.text, lineHeight: 26, letterSpacing: -0.2 },
  body: { fontSize: familyType.body, color: familyColors.text, lineHeight: 22 },
  small: { fontSize: familyType.small, color: familyColors.text, lineHeight: 20 },
  muted: { fontSize: familyType.small, color: familyColors.textMuted, lineHeight: 20 },
  tiny: { fontSize: familyType.tiny, color: familyColors.textMuted, lineHeight: 16 },
  center: { textAlign: 'center' },
  bold: { fontWeight: '700' },
});
