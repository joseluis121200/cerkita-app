import { StyleSheet, Text, View } from 'react-native';

import { familyColors, GradientCard } from '@/shared/ui-family';

import type { PulseDay } from '../week-pulse';

type Props = { days: PulseDay[]; starName: string | null; starDetail: string | null };

function cellColor(postcards: number): string {
  if (postcards >= 3) return familyColors.gold;
  if (postcards === 2) return familyColors.coralLight;
  if (postcards === 1) return familyColors.accent;
  return familyColors.nightCell;
}

// «Pulso de la semana»: los últimos 7 días del círculo y su Estrella 🏆.
export function WeekPulseCard({ days, starName, starDetail }: Props) {
  return (
    <GradientCard variant="night">
      <Text style={styles.overline}>PULSO DE LA SEMANA</Text>
      <View style={styles.grid}>
        {days.map((day) => (
          <View
            key={day.date}
            style={styles.column}
            accessible
            accessibilityLabel={`${day.letter}: ${day.postcards} postales${day.greeted ? ', con saludo' : ''}`}
          >
            <View style={[styles.cell, { backgroundColor: cellColor(day.postcards) }]}>
              <Text style={styles.count}>{day.postcards}</Text>
            </View>
            <Text style={styles.letter}>{day.letter}</Text>
            <Text style={styles.sun}>{day.greeted ? '☀️' : '·'}</Text>
          </View>
        ))}
      </View>
      {starName !== null && (
        <View style={styles.star}>
          <Text style={styles.starTitle}>{`🏆 Estrella del círculo: ${starName}`}</Text>
          {starDetail !== null && <Text style={styles.starDetail}>{starDetail}</Text>}
        </View>
      )}
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  overline: { color: familyColors.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.4 },
  grid: { flexDirection: 'row', gap: 6, marginTop: 4 },
  column: { flex: 1, alignItems: 'center', gap: 4 },
  cell: { width: '100%', aspectRatio: 0.8, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  count: { color: familyColors.white, fontWeight: '800', fontSize: 16 },
  letter: { color: familyColors.onNightMuted, fontWeight: '700', fontSize: 12 },
  sun: { fontSize: 12, color: familyColors.onNightMuted },
  star: { marginTop: 6, gap: 2 },
  starTitle: { color: familyColors.white, fontWeight: '800', fontSize: 16 },
  starDetail: { color: familyColors.onNightMuted, fontSize: 13 },
});
