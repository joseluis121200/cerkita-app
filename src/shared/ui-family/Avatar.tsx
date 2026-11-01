import { StyleSheet, Text, View } from 'react-native';

import { familyColors } from './theme';

type Props = { name: string; size?: number; ring?: boolean; ringColor?: string };

// Avatar con inicial. ring = borde blanco (postales); ringColor = anillo de color de la persona.
export function Avatar({ name, size = 40, ring = false, ringColor }: Props) {
  const initial = name.trim().slice(0, 1).toUpperCase() || '·';
  const border = ringColor !== undefined ? { borderWidth: Math.max(2.5, size / 14), borderColor: ringColor } : null;
  const white = ring ? { borderWidth: Math.max(2, size / 14), borderColor: familyColors.white } : null;
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }, white, border]} accessible={false}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: familyColors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  initial: { color: familyColors.primaryPressed, fontWeight: '800' },
});
