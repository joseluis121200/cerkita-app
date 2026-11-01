import { router } from 'expo-router';
import { useState } from 'react';

import {
  DangerZone,
  familyNameSchema,
  firstIssue,
  LegalNotice,
  MembersSection,
  ProfileSection,
  useFamily,
  useFamilyContext,
  useRenameFamily,
  useSignOut,
} from '@/features/auth-pairing';
import { PlanBanner, usePlan } from '@/features/subscription';
import { AppText, Button, Card, Notice, Screen, TextField } from '@/shared/ui-family';

export default function Settings() {
  const session = useFamilyContext();
  const family = useFamily(session?.familyId);
  const plan = usePlan(session?.familyId);
  const rename = useRenameFamily(session?.familyId ?? '');
  const signOut = useSignOut();
  const [familyName, setFamilyName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (session === null) {
    return null;
  }
  const isAdmin = session.role === 'admin';
  const currentName = familyName ?? family.data?.name ?? '';

  function saveFamilyName() {
    const parsed = familyNameSchema.safeParse(currentName);
    if (!parsed.success) {
      setError(firstIssue(parsed));
      return;
    }
    setError(null);
    rename.mutate(parsed.data);
  }

  return (
    <Screen>
      <AppText variant="title">Ajustes</AppText>
      <ProfileSection
        familyId={session.familyId}
        userId={session.userId}
        memberId={session.memberId}
        displayName={session.displayName}
      />
      {isAdmin && (
        <Card>
          <TextField label="Nombre del círculo" value={currentName} onChangeText={setFamilyName} maxLength={60} error={error} />
          <Button title="Guardar nombre" variant="secondary" loading={rename.isPending} onPress={saveFamilyName} />
          {rename.isSuccess && <Notice tone="calm" text="Nombre actualizado ✅" />}
        </Card>
      )}
      <MembersSection familyId={session.familyId} myUserId={session.userId} isAdmin={isAdmin} />
      <Button title="Invitar al círculo" variant="secondary" onPress={() => router.push('/invite')} />
      {plan !== null && <PlanBanner plan={plan} onPress={() => router.push('/paywall')} />}
      <LegalNotice />
      <Button
        title="Cerrar sesión"
        variant="secondary"
        loading={signOut.isPending}
        onPress={() => signOut.mutate(undefined, { onSuccess: () => router.replace('/') })}
      />
      <DangerZone onDeleted={() => router.replace('/')} />
    </Screen>
  );
}
