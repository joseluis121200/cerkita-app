import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useFamilyContext, useRegisterPushToken, useSession } from '@/features/auth-pairing';
import { familyColors, LoadingState } from '@/shared/ui-family';

// Shell de acompañantes y miembros. Las pestañas viven en (tabs); la ficha de un ser querido,
// invitar y Círculo Plus se abren ENCIMA en este Stack (así push, replace y volver funcionan siempre).
export default function CircleLayout() {
  const { isLoading } = useSession();
  const circle = useFamilyContext();
  const registerPush = useRegisterPushToken();
  const familyId = circle?.familyId;

  useEffect(() => {
    if (familyId !== undefined) {
      registerPush.mutate();
    }
    // Solo una vez por círculo: registerPush es estable para TanStack Query.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyId]);

  if (isLoading) {
    return <LoadingState />;
  }
  if (circle === null) {
    return <Redirect href="/" />;
  }
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: familyColors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="elder/[id]" />
      <Stack.Screen name="invite" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
