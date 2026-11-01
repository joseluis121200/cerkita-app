import { Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';

import type { EffectivePlan } from '../plan';

type Props = { plan: EffectivePlan; onPress: () => void };

// Banner discreto del plan. En el plan gratuito solo aparece si SHOW_PLUS_UPSELL está activo.
export function PlanBanner({ plan, onPress }: Props) {
  if (plan.kind === 'free' && !FEATURE_FLAGS.SHOW_PLUS_UPSELL) {
    return null;
  }
  const info =
    plan.kind === 'plus'
      ? { title: 'Círculo Plus activo', detail: 'Postales ilimitadas y avisos avanzados para todo el círculo.' }
      : plan.kind === 'grace'
        ? { title: 'Hay un problema con el pago', detail: 'Revisa tu método de pago en la tienda para no perder Plus.' }
        : { title: 'Descubre Círculo Plus', detail: 'Postales ilimitadas, hasta 4 seres queridos y avisos por push y email.' };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${info.title}. ${info.detail}`}
      onPress={onPress}
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Sparkles size={20} color={familyColors.primary} />
      </View>
      <View style={styles.texts}>
        <AppText bold>{info.title}</AppText>
        <AppText variant="tiny">{info.detail}</AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    padding: familySpacing.md,
    borderRadius: familyRadius.lg,
    backgroundColor: familyColors.accentSurface,
    borderWidth: 1,
    borderColor: familyColors.accentSoft,
  },
  pressed: { opacity: 0.85 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: familyColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
});
