import { useState } from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { AppText, Button, Card, Chip, familyColors, familySpacing, Notice, TextField } from '@/shared/ui-family';

import { elderInputSchema, normalizePhone, spreadReminders, TIME_ZONE_LABELS, type ElderInput } from '../schemas';
import { DaysSelector } from './DaysSelector';
import { RelationshipPicker } from './RelationshipPicker';
import { ScheduleSection } from './ScheduleSection';
import { VacationSection } from './VacationSection';

type Props = {
  initial: ElderInput;
  submitLabel: string;
  saving: boolean;
  serverError: string | null;
  isPlus: boolean;
  onSubmit: (values: ElderInput) => void;
  onUpsell: () => void;
};

export function ElderForm({ initial, submitLabel, saving, serverError, isPlus, onSubmit, onUpsell }: Props) {
  const [values, setValues] = useState<ElderInput>(initial);
  const [phoneText, setPhoneText] = useState(initial.phoneForCall ?? '');
  const [error, setError] = useState<string | null>(null);

  function change(changes: Partial<ElderInput>) {
    setValues((current) => ({ ...current, ...changes }));
    setError(null);
  }

  function submit() {
    const label = values.relationshipLabel?.trim() ?? '';
    const candidate: ElderInput = {
      ...values,
      relationshipLabel: label.length > 0 ? label : null,
      phoneForCall: normalizePhone(phoneText),
    };
    const result = elderInputSchema.safeParse(isPlus ? candidate : spreadReminders(candidate));
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Revisa los datos');
      return;
    }
    onSubmit(result.data);
  }

  return (
    <View style={styles.wrapper}>
      <Card>
        <TextField
          label="Su nombre"
          value={values.displayName}
          onChangeText={(text) => change({ displayName: text })}
          placeholder="Ej. Carmen"
          maxLength={40}
          autoCapitalize="words"
        />
        <RelationshipPicker value={values.relationshipLabel} onChange={(label) => change({ relationshipLabel: label })} />
        <TextField
          label="Teléfono para llamarle"
          value={phoneText}
          onChangeText={setPhoneText}
          placeholder="Ej. 600 11 22 33"
          keyboardType="phone-pad"
          helper="Lo usa el botón «Llamar ahora» si un día no saluda"
        />
        <AppText bold>¿Dónde vive?</AppText>
        <View style={styles.row}>
          {(Object.keys(TIME_ZONE_LABELS) as (keyof typeof TIME_ZONE_LABELS)[]).map((zone) => (
            <Chip key={zone} label={TIME_ZONE_LABELS[zone]} selected={values.timezone === zone} onPress={() => change({ timezone: zone })} />
          ))}
        </View>
      </Card>

      <Card>
        <ScheduleSection values={values} isPlus={isPlus} onChange={change} onUpsell={onUpsell} />
        <DaysSelector mask={values.activeDaysMask} onChange={(mask) => change({ activeDaysMask: mask })} />
        <View style={styles.switchRow}>
          <View style={styles.flex}>
            <AppText bold>Avisos de tranquilidad activos</AppText>
            <AppText variant="tiny">Si lo apagas, no habrá recordatorios ni avisos para esta persona.</AppText>
          </View>
          <Switch
            accessibilityLabel="Avisos de tranquilidad activos"
            value={values.isEnabled}
            onValueChange={(isEnabled) => change({ isEnabled })}
            trackColor={{ true: familyColors.primary, false: familyColors.border }}
          />
        </View>
      </Card>

      <Card tone="warm">
        <VacationSection
          pausedUntil={values.pausedUntil}
          timezone={values.timezone}
          isPlus={isPlus}
          onChange={(until) => change({ pausedUntil: until })}
          onUpsell={onUpsell}
        />
      </Card>

      {(error ?? serverError) !== null && <Notice tone="warning" text={error ?? serverError ?? ''} />}
      <Button title={submitLabel} loading={saving} onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: familySpacing.sm },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.md, marginTop: familySpacing.sm },
  flex: { flex: 1 },
});
