import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useFamilyContext } from '@/features/auth-pairing';
import { FREE_FEATURES, PLUS_FEATURES, PlanOptionCard, usePlan, usePurchasePlan, useRestorePurchases, type PlanOption } from '@/features/subscription';
import { toUserMessage } from '@/shared/api/errors';
import { AppText, Button, Card, familyColors, familySpacing, Notice, Screen, TopBar } from '@/shared/ui-family';

// Paywall ético: precios claros, sin trucos, y Cerca sigue siendo gratis para siempre sin pagar.
export default function Paywall() {
  const session = useFamilyContext();
  const plan = usePlan(session?.familyId);
  const purchase = usePurchasePlan();
  const restore = useRestorePurchases();
  const [option, setOption] = useState<PlanOption>('yearly');
  const [message, setMessage] = useState<string | null>(null);

  function buy() {
    setMessage(null);
    purchase.mutate(option, {
      onSuccess: (result) => {
        if (result.status === 'purchased') setMessage('¡Gracias! Círculo Plus ya está activo para todo el círculo ✨');
        if (result.status === 'unavailable') setMessage(result.reason);
      },
      onError: (error) => setMessage(toUserMessage(error)),
    });
  }

  function restoreAll() {
    restore.mutate(undefined, {
      onSuccess: (result) => {
        if (result.status === 'unavailable') setMessage(result.reason);
        if (result.status === 'restored') setMessage(result.found ? 'Compras restauradas ✅' : 'No hemos encontrado compras anteriores.');
      },
    });
  }

  return (
    <Screen>
      <TopBar title="Círculo Plus ✨" onBack={() => router.back()} />
      <AppText variant="muted">Un solo pago para todo el círculo. Sin pagar, Cerca sigue siendo gratis para siempre.</AppText>
      {plan?.isPlus === true && <Notice tone="calm" text="Vuestro círculo ya tiene Círculo Plus ✅" />}
      <Card tone="alert">
        <AppText variant="heading">Con Círculo Plus</AppText>
        {PLUS_FEATURES.map((feature) => (
          <View key={feature} style={styles.feature}>
            <Check size={18} color={familyColors.primary} />
            <AppText style={styles.flex}>{feature}</AppText>
          </View>
        ))}
      </Card>
      <PlanOptionCard option="yearly" selected={option === 'yearly'} onSelect={() => setOption('yearly')} />
      <PlanOptionCard option="monthly" selected={option === 'monthly'} onSelect={() => setOption('monthly')} />
      {message !== null && <Notice text={message} />}
      <Button title="Activar Círculo Plus" loading={purchase.isPending} onPress={buy} />
      <Button title="Restaurar compras" variant="secondary" loading={restore.isPending} onPress={restoreAll} />
      <Card>
        <AppText bold>Siempre gratis</AppText>
        {FREE_FEATURES.map((feature) => (
          <AppText key={feature} variant="muted">{`· ${feature}`}</AppText>
        ))}
      </Card>
      <AppText variant="tiny">
        El pago se hace con tu cuenta de Apple o Google y se renueva automáticamente. Puedes cancelarlo cuando quieras
        desde la tienda, como mínimo 24 h antes de la renovación.
      </AppText>
      <Button title="Ahora no" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  feature: { flexDirection: 'row', gap: familySpacing.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
});
