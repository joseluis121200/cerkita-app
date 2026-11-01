import { Redirect, Stack } from 'expo-router';

import { useElderContext, useSession } from '@/features/auth-pairing';
import { useCheckinQueueSync } from '@/features/checkin-engine';
import { elderColors } from '@/shared/ui-elder';
import { LoadingState } from '@/shared/ui-family';

// Shell del mayor: sin pestañas, sin gestos de retroceso accidentales.
export default function ElderLayout() {
  const { isLoading } = useSession();
  const elder = useElderContext();
  useCheckinQueueSync(elder?.familyId);

  if (isLoading) {
    return <LoadingState />;
  }
  if (elder === null) {
    return <Redirect href="/" />;
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: elderColors.background },
      }}
    />
  );
}
