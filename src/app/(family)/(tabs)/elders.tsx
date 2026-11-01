import { router } from 'expo-router';

import { useFamilyContext } from '@/features/auth-pairing';
import { AddLovedOneButton, ElderListItem, useElders } from '@/features/elder-config';
import { usePlan } from '@/features/subscription';
import { AppText, LoadingState, Notice, Screen } from '@/shared/ui-family';

export default function LovedOnes() {
  const session = useFamilyContext();
  const elders = useElders(session?.familyId);
  const plan = usePlan(session?.familyId);

  if (session === null) {
    return null;
  }
  const list = elders.data ?? [];

  return (
    <Screen>
      <AppText variant="title">Seres queridos</AppText>
      <AppText variant="muted">
        Las personas a las que acompaña el círculo. Su móvil se actualiza solo: no tienen que tocar nada.
      </AppText>
      {elders.isLoading && <LoadingState />}
      {elders.isError && <LoadingState error="No hemos podido cargar a tus seres queridos." onRetry={() => void elders.refetch()} />}
      {!elders.isLoading && list.length === 0 && (
        <Notice text="Todavía no acompañáis a nadie. Añade a tu madre, tu abuelo, tu madrina o esa vecina especial." />
      )}
      {list.map((elder, index) => (
        <ElderListItem
          key={elder.id}
          elder={elder}
          inactiveByPlan={plan !== null && index >= plan.maxLovedOnes}
          onPress={() => router.push(`/elder/${elder.id}`)}
        />
      ))}
      {session.role === 'admin' ? (
        <AddLovedOneButton familyId={session.familyId} />
      ) : (
        <Notice text="Solo los acompañantes pueden añadir o configurar seres queridos." />
      )}
    </Screen>
  );
}
