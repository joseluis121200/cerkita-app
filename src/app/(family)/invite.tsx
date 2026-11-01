import { router } from 'expo-router';

import { buildInviteLink, InviteShareCard, useFamily, useFamilyContext } from '@/features/auth-pairing';
import { AppText, LoadingState, Notice, Screen, TopBar } from '@/shared/ui-family';

// Multiplicador de WhatsApp: un solo enlace por círculo (families.invite_token).
export default function Invite() {
  const session = useFamilyContext();
  const family = useFamily(session?.familyId);

  if (session === null) {
    return null;
  }
  if (family.data === undefined) {
    return <LoadingState />;
  }
  const link = buildInviteLink(family.data.inviteToken);
  const circle = family.data.name;

  return (
    <Screen>
      <TopBar title="Invitar al círculo" onBack={() => router.back()} />
      <AppText variant="muted">Cuantos más seáis, más postales recibe cada mañana. Unirse es gratis para todos.</AppText>
      <InviteShareCard
        title="Acompañantes"
        description="Hermanos, hijos o personas de confianza que configuran los horarios y reciben los avisos. Cuando entren, hazlos administradores en Ajustes → Personas del círculo."
        message={`Te invito a «${circle}» en Cerca ☀️ Cada mañana sabemos que está bien y le mandamos una postal. Entra aquí: ${link}`}
      />
      <InviteShareCard
        title="Miembros del círculo"
        description="Nietos, sobrinos, amigos o vecinos que mandan postales y cariño."
        message={`¡Únete a «${circle}» en Cerca! 💌 Cada día le mandamos una postal y nos da los buenos días con un toque. Entra aquí: ${link}`}
      />
      <Notice text={`Si el enlace no abre la app, pega este código al registrarte: ${family.data.inviteToken}`} />
    </Screen>
  );
}
