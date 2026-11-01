import { StyleSheet, Text, View } from 'react-native';

import { familyColors, GradientCard } from '@/shared/ui-family';
import { formatClock } from '@/shared/utils/format';

import type { ElderOverview } from '../hooks';

type Props = { streak: number; overviews: ElderOverview[]; postcardsToday: number; peopleCount: number };

function statusLine(overview: ElderOverview): { text: string; color: string } {
  const { elder, state } = overview;
  if (state.kind === 'ok') {
    const at = state.at === null ? '' : ` a las ${formatClock(state.at, elder.timezone)}`;
    return { text: `☀️ ${elder.displayName} ha saludado${at}`, color: familyColors.emerald };
  }
  if (state.kind === 'resolved') return { text: `✅ Todo bien con ${elder.displayName}`, color: familyColors.emerald };
  if (state.kind === 'alerted') return { text: `💗 ${elder.displayName} aún no ha saludado: llámale`, color: familyColors.coralLight };
  if (state.kind === 'paused') return { text: `🌴 ${elder.displayName} está de vacaciones`, color: familyColors.onNightMuted };
  if (state.kind === 'not_paired') return { text: `🔗 Falta unir el móvil de ${elder.displayName}`, color: familyColors.onNightMuted };
  return { text: `⏳ ${elder.displayName} aún no ha saludado`, color: familyColors.amber };
}

// Tarjeta Hero en Tinta Noche: racha del círculo, estado de cada ser querido y postales de hoy.
export function CircleHeroCard({ streak, overviews, postcardsToday, peopleCount }: Props) {
  return (
    <GradientCard variant="night">
      <Text style={styles.overline}>TU CÍRCULO HOY</Text>
      <View style={styles.streakRow} accessible accessibilityLabel={`Racha: ${streak} días seguidos conectados`}>
        <Text style={styles.streak}>{`🔥 ${streak}`}</Text>
        <Text style={styles.streakLabel}>{streak === 1 ? 'día conectados' : 'días seguidos\nconectados'}</Text>
      </View>
      {overviews.map((overview) => {
        const line = statusLine(overview);
        return (
          <Text key={overview.elder.id} style={[styles.status, { color: line.color }]}>
            {line.text}
          </Text>
        );
      })}
      <Text style={styles.footer}>{`📸 ${postcardsToday} ${postcardsToday === 1 ? 'postal' : 'postales'} hoy · ${peopleCount} personas en el círculo`}</Text>
    </GradientCard>
  );
}

const styles = StyleSheet.create({
  overline: { color: familyColors.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.4 },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streak: { color: familyColors.gold, fontSize: 44, fontWeight: '900', letterSpacing: -1 },
  streakLabel: { color: familyColors.white, fontSize: 15, fontWeight: '700', lineHeight: 19 },
  status: { fontSize: 16, fontWeight: '700' },
  footer: { color: familyColors.onNightMuted, fontSize: 13, marginTop: 4 },
});
