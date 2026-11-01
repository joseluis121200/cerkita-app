import { router } from 'expo-router';
import { useState } from 'react';

import {
  displayNameSchema,
  familyNameSchema,
  firstIssue,
  useCreateFamily,
  useJoinFamily,
  useSaveProfile,
  useSession,
} from '@/features/auth-pairing';
import { toUserMessage } from '@/shared/api/errors';
import { useUiStore } from '@/shared/stores/ui-store';
import { AppText, Button, Card, Chip, LoadingState, Notice, Screen, TextField } from '@/shared/ui-family';
import { extractUuid } from '@/shared/utils/ids';

type Mode = 'create' | 'join';

export default function Onboarding() {
  const { data: session } = useSession();
  const pendingToken = useUiStore((state) => state.pendingInviteToken);
  const setPendingToken = useUiStore((state) => state.setPendingInviteToken);
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>(pendingToken !== null ? 'join' : 'create');
  const [familyName, setFamilyName] = useState('');
  const [invite, setInvite] = useState(pendingToken ?? '');
  const [error, setError] = useState<string | null>(null);
  const saveProfile = useSaveProfile();
  const createFamily = useCreateFamily();
  const joinFamily = useJoinFamily();

  if (session === undefined || (session.status !== 'needs_profile' && session.status !== 'needs_family')) {
    return <LoadingState />;
  }
  const needsName = session.status === 'needs_profile';
  const userId = session.userId;
  const busy = saveProfile.isPending || createFamily.isPending || joinFamily.isPending;

  async function submit() {
    setError(null);
    try {
      if (needsName) {
        const parsedName = displayNameSchema.safeParse(name);
        if (!parsedName.success) {
          setError(firstIssue(parsedName));
          return;
        }
        await saveProfile.mutateAsync({ userId, displayName: parsedName.data });
      }
      if (mode === 'create') {
        const parsedFamily = familyNameSchema.safeParse(familyName);
        if (!parsedFamily.success) {
          setError(firstIssue(parsedFamily));
          return;
        }
        await createFamily.mutateAsync(parsedFamily.data);
      } else {
        const token = extractUuid(invite);
        if (token === null) {
          setError('Pega el enlace completo que te enviaron por WhatsApp.');
          return;
        }
        await joinFamily.mutateAsync(token);
        setPendingToken(null);
      }
      router.replace('/');
    } catch (submitError) {
      setError(toUserMessage(submitError));
    }
  }

  return (
    <Screen withBottomInset>
      <AppText variant="title">¡Te damos la bienvenida a Cerca! ☀️</AppText>
      {needsName && (
        <TextField label="¿Cómo te llamas?" value={name} onChangeText={setName} placeholder="Ej. Rubén" autoCapitalize="words" maxLength={60} />
      )}
      <Card>
        <AppText variant="heading">¿Qué quieres hacer?</AppText>
        <Chip label="Crear un círculo" selected={mode === 'create'} onPress={() => setMode('create')} />
        <Chip label="Unirme con un enlace de invitación" selected={mode === 'join'} onPress={() => setMode('join')} />
      </Card>
      {mode === 'create' ? (
        <>
          <TextField label="Nombre del círculo" value={familyName} onChangeText={setFamilyName} placeholder="Ej. El círculo de mamá" maxLength={60} />
          <Notice tone="calm" text="Gratis para siempre: 1 postal al día para cada persona del círculo y 1 ser querido. Sin tarjeta." />
        </>
      ) : (
        <TextField
          label="Enlace o código de invitación"
          value={invite}
          onChangeText={setInvite}
          placeholder="Pega aquí el enlace de WhatsApp"
          autoCapitalize="none"
        />
      )}
      {error !== null && <Notice tone="warning" text={error} />}
      <Button title={mode === 'create' ? 'Crear el círculo' : 'Unirme al círculo'} loading={busy} onPress={() => void submit()} />
    </Screen>
  );
}
