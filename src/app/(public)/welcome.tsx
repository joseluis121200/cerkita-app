import { router } from 'expo-router';
import { Heart, Mail, Sun } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { isDemoMode } from '@/shared/api/mode';
import { AppText, Button, familyColors, familyRadius, familySpacing, Notice, Screen } from '@/shared/ui-family';

const VALUES = [
  { icon: Mail, title: 'Postales cada día', text: 'Cada persona del círculo le manda una foto sencilla de su día. La ve en grande, como en un marco.' },
  { icon: Sun, title: 'Buenos días con un toque', text: 'Tu ser querido responde con un solo botón. Sin escribir, sin menús.' },
  { icon: Heart, title: 'Tranquilidad compartida', text: 'Si un día no saluda, el círculo lo sabe para llamarle a tiempo.' },
] as const;

export default function Welcome() {
  return (
    <Screen withBottomInset>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Heart size={40} color={familyColors.white} fill={familyColors.white} />
        </View>
        <AppText variant="title" center>Cerca</AppText>
        <AppText center color={familyColors.textMuted}>
          La postal diaria que mantiene unido a tu círculo de seres queridos
        </AppText>
      </View>
      {VALUES.map((value) => (
        <View key={value.title} style={styles.value}>
          <View style={styles.icon}>
            <value.icon size={22} color={familyColors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText bold>{value.title}</AppText>
            <AppText variant="muted">{value.text}</AppText>
          </View>
        </View>
      ))}
      {isDemoMode && <Notice text="Modo prueba: datos de ejemplo guardados solo en este móvil." />}
      <Button title="Crear o unirme a un círculo" onPress={() => router.push('/login')} />
      <Button title="Tengo un código" variant="secondary" onPress={() => router.push('/pair-elder')} />
      <AppText variant="tiny" center>
        Gratis para siempre: 1 postal al día para cada persona del círculo. Cerca no es un servicio médico ni sustituye al 112.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: familySpacing.sm, paddingTop: familySpacing.xl, paddingBottom: familySpacing.md },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: familyColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: familySpacing.sm,
  },
  value: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    padding: familySpacing.lg,
    borderRadius: familyRadius.lg,
    backgroundColor: familyColors.surface,
    borderWidth: 1,
    borderColor: familyColors.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: familyColors.accentSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1, gap: 2 },
});
