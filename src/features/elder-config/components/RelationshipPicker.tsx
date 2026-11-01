import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, Chip, familySpacing, TextField } from '@/shared/ui-family';

import { RELATIONSHIP_OPTIONS } from '../schemas';

type Props = { value: string | null; onChange: (label: string | null) => void };

const OPTIONS: readonly string[] = RELATIONSHIP_OPTIONS;

// "¿Quién es para vosotros?": etiquetas cercanas o una personalizada.
export function RelationshipPicker({ value, onChange }: Props) {
  const isCustom = value !== null && !OPTIONS.includes(value);
  const [custom, setCustom] = useState(isCustom);

  return (
    <View style={styles.wrapper}>
      <AppText bold>¿Quién es para vosotros?</AppText>
      <View style={styles.row}>
        {RELATIONSHIP_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={!custom && value === option}
            onPress={() => {
              setCustom(false);
              onChange(value === option ? null : option);
            }}
          />
        ))}
        <Chip label="Otra…" selected={custom} onPress={() => { setCustom(true); onChange(''); }} />
      </View>
      {custom && (
        <TextField
          label="Escribe la relación"
          value={value ?? ''}
          onChangeText={(text) => onChange(text)}
          placeholder="Ej. Mi profesora de piano"
          maxLength={30}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: familySpacing.sm },
});
