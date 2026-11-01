import { router } from 'expo-router';
import { useState } from 'react';

import { useElderContext, useFamily, useSignOut } from '@/features/auth-pairing';
import { ElderButton, ElderScreen, ElderText, elderColors } from '@/shared/ui-elder';

// Ajustes ocultos del móvil de la persona acompañada. Solo los usa quien la acompaña (pulsación larga).
export default function ElderSettings() {
  const session = useElderContext();
  const family = useFamily(session?.familyId);
  const signOut = useSignOut();
  const [confirming, setConfirming] = useState(false);

  function unpair() {
    signOut.mutate(undefined, { onSuccess: () => router.replace('/') });
  }

  return (
    <ElderScreen>
      <ElderText variant="title">Este móvil</ElderText>
      <ElderText>{`Está unido a «${family.data?.name ?? 'tu círculo'}» como ${session?.elderName ?? 'persona acompañada'}.`}</ElderText>
      <ElderText color={elderColors.textSoft}>
        Los horarios y todo lo demás se cambian desde el móvil de quien te acompaña.
      </ElderText>
      <ElderButton title="Volver" onPress={() => router.back()} />
      {confirming ? (
        <>
          <ElderText color={elderColors.memory}>¿Seguro? Para volver a usar Cerca harán falta un código nuevo.</ElderText>
          <ElderButton title="Sí, quitarlo" variant="secondary" loading={signOut.isPending} onPress={unpair} />
          <ElderButton title="No, cancelar" variant="secondary" onPress={() => setConfirming(false)} />
        </>
      ) : (
        <ElderButton title="Quitar este móvil del círculo" variant="secondary" onPress={() => setConfirming(true)} />
      )}
    </ElderScreen>
  );
}
