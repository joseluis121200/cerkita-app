import * as Linking from 'expo-linking';
import { Share2 } from 'lucide-react-native';
import { Share } from 'react-native';

import { AppText, Button, Card, familyColors } from '@/shared/ui-family';
import { logError } from '@/shared/utils/logger';

type Props = { title: string; description: string; message: string };

export function buildInviteLink(inviteToken: string): string {
  return Linking.createURL('/join', { queryParams: { token: inviteToken } });
}

// Tarjeta de invitación: abre la hoja de compartir del sistema (WhatsApp aparece la primera).
export function InviteShareCard({ title, description, message }: Props) {
  async function share() {
    try {
      await Share.share({ message });
    } catch (error) {
      logError('invite-share', error);
    }
  }

  return (
    <Card tone="warm">
      <AppText variant="heading">{title}</AppText>
      <AppText variant="muted">{description}</AppText>
      <Button title="Compartir por WhatsApp" icon={<Share2 size={18} color={familyColors.onPrimary} />} onPress={() => void share()} />
    </Card>
  );
}
