import { TreePalm } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { PlusLockRow } from '@/features/subscription';
import { AppText, Button, Chip, familyColors, familySpacing } from '@/shared/ui-family';
import { addDays, localDateIn, type TimeZoneId } from '@/shared/utils/dates';

type Props = {
  pausedUntil: string | null;
  timezone: TimeZoneId;
  isPlus: boolean;
  onChange: (until: string | null) => void;
  onUpsell: () => void;
};

const OPTIONS = [
  { label: 'Hoy', days: 0 },
  { label: '3 días', days: 2 },
  { label: '1 semana', days: 6 },
  { label: '2 semanas', days: 13 },
] as const;

function formatDay(localDate: string): string {
  const [y, m, d] = localDate.split('-').map(Number);
  const date = new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, d ?? 1, 12));
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(date);
}

// "Modo Vacaciones / Acompañado": pausa los recordatorios y avisos sin que el mayor toque nada.
export function VacationSection({ pausedUntil, timezone, isPlus, onChange, onUpsell }: Props) {
  const today = localDateIn(timezone);
  const isActive = pausedUntil !== null && pausedUntil >= today;
  if (!isPlus) {
    return <PlusLockRow title="Modo vacaciones / acompañado" detail="Pausa los avisos cuando está acompañado o de viaje" onPress={onUpsell} />;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TreePalm size={22} color={familyColors.accent} />
        <AppText variant="heading">Modo vacaciones / acompañado</AppText>
      </View>
      <AppText variant="muted">
        Útil cuando está acompañado o de viaje: no habrá recordatorios ni avisos.
      </AppText>
      {isActive ? (
        <View style={styles.active}>
          <AppText bold color={familyColors.calmText}>{`En pausa hasta el ${formatDay(pausedUntil)} (incluido)`}</AppText>
          <Button title="Quitar la pausa" variant="secondary" onPress={() => onChange(null)} />
        </View>
      ) : (
        <View style={styles.row}>
          {OPTIONS.map((option) => (
            <Chip key={option.label} label={option.label} selected={false} onPress={() => onChange(addDays(today, option.days))} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: familySpacing.sm },
  active: { gap: familySpacing.sm },
});
