import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { useFamilyContext } from '@/features/auth-pairing';
import {
  DEFAULT_ELDER_INPUT,
  ElderForm,
  PairingCodeCard,
  useCreateElder,
  useCreatePairingCode,
  useDeleteElder,
  useElders,
  useUpdateElder,
  type ElderInput,
  type PairingCode,
} from '@/features/elder-config';
import { usePlan } from '@/features/subscription';
import { toUserMessage } from '@/shared/api/errors';
import { Button, LoadingState, Notice, Screen, TopBar } from '@/shared/ui-family';

// Ficha de un ser querido: alta ("new") o edición + código para unir su móvil al círculo.
export default function ElderDetail() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const session = useFamilyContext();
  const familyId = session?.familyId ?? '';
  const elders = useElders(session?.familyId);
  const create = useCreateElder(familyId);
  const update = useUpdateElder(familyId);
  const remove = useDeleteElder(familyId);
  const pairingCode = useCreatePairingCode();
  const plan = usePlan(session?.familyId);
  const [pairing, setPairing] = useState<PairingCode | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);
  const autoCode = useRef(false);
  const justCreated = fresh === '1';

  // Recién creado: generamos ya su código de 6 cifras / QR para unir su móvil.
  useEffect(() => {
    if (!justCreated || autoCode.current || id === 'new') {
      return;
    }
    autoCode.current = true;
    pairingCode.mutate(id, { onSuccess: setPairing });
  }, [justCreated, id, pairingCode]);

  if (session === null) {
    return null;
  }
  if (session.role !== 'admin') {
    return (
      <Screen>
        <Notice text="Solo los acompañantes (administradores) pueden configurar a los seres queridos." />
        <Button title="Volver" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const isNew = id === 'new';
  const elder = elders.data?.find((e) => e.id === id);
  if (!isNew && elder === undefined) {
    return elders.isLoading ? <LoadingState /> : <LoadingState error="No encontramos a este ser querido." onRetry={() => router.back()} />;
  }

  const initial: ElderInput = elder === undefined ? DEFAULT_ELDER_INPUT : { ...elder };
  const mutationError = create.error ?? update.error;

  function submit(values: ElderInput) {
    setSaved(false);
    if (isNew) {
      create.mutate(values, {
        onSuccess: (created) => router.replace({ pathname: '/elder/[id]', params: { id: created.id, fresh: '1' } }),
      });
      return;
    }
    update.mutate({ elderId: id, values }, { onSuccess: () => setSaved(true) });
  }

  return (
    <Screen>
      <TopBar title={isNew ? 'Nuevo ser querido' : (elder?.displayName ?? '')} onBack={() => router.back()} />
      {justCreated && elder !== undefined && (
        <Notice tone="calm" text={`¡${elder.displayName} ya está en el círculo! 🎉 Ahora une su móvil con este código.`} />
      )}
      {!isNew && elder !== undefined && (
        <PairingCodeCard
          elderName={elder.displayName}
          isPaired={elder.isPaired}
          pairing={pairing}
          loading={pairingCode.isPending}
          onGenerate={() => pairingCode.mutate(elder.id, { onSuccess: setPairing })}
        />
      )}
      {pairingCode.isError && <Notice tone="warning" text={toUserMessage(pairingCode.error)} />}
      <ElderForm
        key={elder?.id ?? 'new'}
        initial={initial}
        submitLabel={isNew ? 'Crear y continuar' : 'Guardar cambios'}
        saving={create.isPending || update.isPending}
        serverError={mutationError !== null ? toUserMessage(mutationError) : null}
        isPlus={plan?.advancedAlerts === true}
        onSubmit={submit}
        onUpsell={() => router.push('/paywall')}
      />
      {saved && <Notice tone="calm" text="Guardado. Su móvil ya tiene los cambios ✅" />}
      {!isNew && elder !== undefined && (
        confirmDelete ? (
          <>
            <Notice tone="warning" text={`Se quitará a ${elder.displayName} del círculo con su historial. Su móvil dejará de estar unido.`} />
            <Button
              title="Sí, borrar"
              variant="danger"
              loading={remove.isPending}
              onPress={() => remove.mutate(elder.id, { onSuccess: () => router.back() })}
            />
            <Button title="Cancelar" variant="ghost" onPress={() => setConfirmDelete(false)} />
          </>
        ) : (
          <Button title={`Quitar a ${elder.displayName} del círculo`} variant="danger" onPress={() => setConfirmDelete(true)} />
        )
      )}
    </Screen>
  );
}
