import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { useUiStore } from '@/shared/stores/ui-store';
import { LoadingState } from '@/shared/ui-family';
import { extractUuid } from '@/shared/utils/ids';

// Destino del enlace de invitación de WhatsApp: guarda el token y deja que la puerta decida.
export default function Join() {
  const params = useLocalSearchParams<{ token?: string }>();
  const setPendingInviteToken = useUiStore((state) => state.setPendingInviteToken);
  const token = typeof params.token === 'string' ? extractUuid(params.token) : null;

  useEffect(() => {
    if (token !== null) {
      setPendingInviteToken(token);
    }
    router.replace('/');
  }, [token, setPendingInviteToken]);

  return <LoadingState label="Abriendo la invitación…" />;
}
