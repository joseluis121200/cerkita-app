import { StyleSheet, Text } from 'react-native';

import { Button, familyColors, GradientCard } from '@/shared/ui-family';

import { winkOfTheDay } from '../daily-wink';

type Props = { onAnswer: () => void };

// «El Guiño del Día»: una idea de foto distinta cada día para que todos suban la suya.
export function DailyWinkCard({ onAnswer }: Props) {
  return (
    <GradientCard variant="wink">
      <Text style={styles.overline}>✨ EL GUIÑO DEL DÍA</Text>
      <Text style={styles.idea}>{winkOfTheDay()}</Text>
      <Text style={styles.helper}>Es solo una idea: cualquier foto de tu día vale.</Text>
      <Button title="Subir mi respuesta 📸" variant="secondary" onPress={onAnswer} />
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  overline: { color: familyColors.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.4 },
  idea: { color: familyColors.white, fontWeight: '800', fontSize: 22, lineHeight: 28 },
  helper: { color: familyColors.white, opacity: 0.85, fontSize: 14 },
});
