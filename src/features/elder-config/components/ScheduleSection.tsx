import { StyleSheet, View } from 'react-native';

import { PlusLockRow } from '@/features/subscription';
import { AppText, familySpacing } from '@/shared/ui-family';

import type { ElderInput } from '../schemas';
import { TimeStepper } from './TimeStepper';

type Props = { values: ElderInput; isPlus: boolean; onChange: (changes: Partial<ElderInput>) => void; onUpsell: () => void };

export function ScheduleSection({ values, isPlus, onChange, onUpsell }: Props) {
  return (
    <View style={styles.wrapper}>
      <AppText variant="heading">Horario del saludo</AppText>
      <AppText variant="muted">
        {isPlus
          ? 'Si no manda los buenos días, primero le recordamos con cariño y solo después avisamos a los acompañantes.'
          : 'Si a la hora límite no ha mandado los buenos días, lo verás en el panel de la app.'}
      </AppText>
      <TimeStepper
        label="Empieza la mañana"
        helper="Desde esta hora cuenta su saludo"
        value={values.windowStart}
        onChange={(time) => onChange({ windowStart: time })}
      />
      {isPlus ? (
        <>
          <TimeStepper
            label="Primer recordatorio suave"
            helper="Notificación amable en su móvil"
            value={values.reminder1At}
            onChange={(time) => onChange({ reminder1At: time })}
          />
          <TimeStepper
            label="Segundo recordatorio"
            helper="Otro aviso con sonido en su móvil"
            value={values.reminder2At}
            onChange={(time) => onChange({ reminder2At: time })}
          />
        </>
      ) : (
        <PlusLockRow title="Doble recordatorio suave" detail="Le avisamos con cariño antes de la hora límite" onPress={onUpsell} />
      )}
      <TimeStepper
        label="Hora límite"
        helper={isPlus ? 'Push prioritario + email a los acompañantes' : 'Aviso dentro de la app'}
        value={values.adminAlertAt}
        onChange={(time) => onChange({ adminAlertAt: time })}
      />
    </View>
  );
}

const styles = StyleSheet.create({ wrapper: { gap: familySpacing.xs } });
