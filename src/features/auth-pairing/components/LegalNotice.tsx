import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AppText, Card, familyColors, familySpacing } from '@/shared/ui-family';

// Aviso legal obligatorio (CONTEXT.md 2.2): Cerca no es un servicio médico ni de emergencias.
export function LegalNotice() {
  return (
    <Card tone="warm">
      <View style={styles.header}>
        <ShieldCheck size={22} color={familyColors.calmText} />
        <AppText variant="heading">Qué es (y qué no es) Cerca</AppText>
      </View>
      <AppText variant="small">
        Cerca es una app privada de comunicación diaria entre seres queridos. No es un servicio médico, no hace
        diagnósticos ni sustituye a la teleasistencia ni al 112.
      </AppText>
      <AppText variant="small" bold>
        Ante cualquier urgencia, llama siempre al 112.
      </AppText>
      <AppText variant="tiny">
        Tus datos se guardan en servidores de la Unión Europea y las postales solo las ve tu círculo.
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({ header: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.sm } });
