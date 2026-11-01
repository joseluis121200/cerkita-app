import { StyleSheet, View } from 'react-native';

import { AppText, Chip, familySpacing } from '@/shared/ui-family';

import { describeActiveDays, WEEK_DAYS } from '../schemas';

type Props = { mask: number; onChange: (mask: number) => void };

export function DaysSelector({ mask, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <AppText bold>Días con aviso</AppText>
      <View style={styles.row}>
        {WEEK_DAYS.map((day) => {
          const selected = (mask & day.bit) !== 0;
          return (
            <Chip
              key={day.bit}
              label={day.short}
              selected={selected}
              accessibilityLabel={`${day.name}: ${selected ? 'activo' : 'sin aviso'}`}
              onPress={() => onChange(selected ? mask & ~day.bit : mask | day.bit)}
            />
          );
        })}
      </View>
      <AppText variant="tiny">{describeActiveDays(mask)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: familySpacing.sm },
});
