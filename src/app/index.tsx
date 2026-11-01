import { Redirect } from 'expo-router';

import { useSession } from '@/features/auth-pairing';
import { toUserMessage } from '@/shared/api/errors';
import { LoadingState, Screen } from '@/shared/ui-family';

// Puerta de entrada: decide qué ve cada persona según su sesión.
export default function Index() {
  const { data, isLoading, error, refetch } = useSession();

  if (isLoading) {
    return <LoadingState label="Abriendo Cerca…" />;
  }
  if (data === undefined) {
    return (
      <Screen scroll={false}>
        <LoadingState error={toUserMessage(error)} onRetry={() => void refetch()} />
      </Screen>
    );
  }

  switch (data.status) {
    case 'signed_out':
      return <Redirect href="/welcome" />;
    case 'needs_profile':
    case 'needs_family':
      return <Redirect href="/onboarding" />;
    case 'elder':
      return <Redirect href="/elder" />;
    case 'family':
      return <Redirect href="/home" />;
  }
}
