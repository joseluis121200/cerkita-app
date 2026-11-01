import { router } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';

import { PlusUpsellSheet, usePlan } from '@/features/subscription';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { Button, familyColors, Notice } from '@/shared/ui-family';

import { useElders } from '../hooks';

const MAX_LOVED_ONES = 4;

type Props = { familyId: string };

/**
 * «Añadir ser querido» con las dos situaciones bien resueltas:
 *  A) Hay cupo → abre el alta completa.
 *  B) El plan gratuito ya tiene 1 → hoja explicativa con acceso a Círculo Plus (nunca falla en silencio).
 */
export function AddLovedOneButton({ familyId }: Props) {
  const elders = useElders(familyId);
  const plan = usePlan(familyId);
  const [sheetOpen, setSheetOpen] = useState(false);
  const count = elders.data?.length ?? 0;

  if (count >= MAX_LOVED_ONES) {
    return <Notice text="Habéis llegado al máximo de 4 seres queridos por círculo." />;
  }
  const reachedPlanLimit = plan !== null && count >= plan.maxLovedOnes;

  function start() {
    if (reachedPlanLimit) {
      setSheetOpen(true);
      return;
    }
    router.push('/elder/new');
  }

  return (
    <>
      <Button
        title={count === 0 ? 'Añadir a tu primer ser querido' : 'Añadir ser querido'}
        icon={<Plus size={20} color={familyColors.onPrimary} />}
        onPress={start}
      />
      <PlusUpsellSheet
        visible={sheetOpen}
        title="Acompañad a más seres queridos"
        message={
          FEATURE_FLAGS.SHOW_PLUS_UPSELL
            ? 'Tu plan gratuito incluye 1 persona acompañada. Con Círculo Plus podéis acompañar hasta a 4 seres queridos, con postales ilimitadas y avisos por push y email.'
            : 'Tu plan gratuito incluye 1 persona acompañada.'
        }
        onClose={() => setSheetOpen(false)}
        onUpgrade={() => router.push('/paywall')}
      />
    </>
  );
}
