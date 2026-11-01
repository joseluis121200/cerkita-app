import { Flame, Phone } from 'lucide-react-native';
import { Linking, StyleSheet, View } from 'react-native';

import type { FamilyMember } from '@/features/auth-pairing';
import { lovedOneTitle } from '@/features/elder-config';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, Avatar, Button, Card, familyColors, familySpacing } from '@/shared/ui-family';
import { telUrl } from '@/shared/utils/format';
import { logError } from '@/shared/utils/logger';

import { describeDayState } from '../describe';
import type { ElderOverview } from '../hooks';

type Props = { overview: ElderOverview; members: FamilyMember[] };

const chipColors = {
  calm: { bg: familyColors.calmSoft, text: familyColors.calmText },
  warm: { bg: familyColors.warningSoft, text: familyColors.warningText },
  alert: { bg: familyColors.accentSoft, text: familyColors.primaryPressed },
  muted: { bg: familyColors.surfaceWarm, text: familyColors.textMuted },
} as const;

export function callPhone(phone: string): void {
  Linking.openURL(telUrl(phone)).catch((error: unknown) => logError('call-phone', error));
}

export function ElderStatusCard({ overview, members }: Props) {
  const { elder, state, streak, planNote } = overview;
  const text = describeDayState(state, elder.timezone, members);
  const chip = chipColors[text.tone];

  return (
    <Card>
      <View style={styles.header}>
        <Avatar name={elder.displayName} size={52} />
        <View style={styles.flex}>
          <AppText variant="heading">{lovedOneTitle(elder)}</AppText>
          <View style={[styles.chip, { backgroundColor: chip.bg }]}>
            <AppText variant="small" bold color={chip.text}>
              {text.title}
            </AppText>
          </View>
          {text.detail !== null && <AppText variant="muted">{text.detail}</AppText>}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.streak}>
          <Flame size={18} color={familyColors.accent} />
          <AppText variant="small">{streak === 1 ? '1 día saludando' : `${streak} días seguidos saludando`}</AppText>
        </View>
        {elder.phoneForCall !== null && (
          <Button
            title="Llamar"
            variant="secondary"
            icon={<Phone size={16} color={familyColors.text} />}
            onPress={() => callPhone(elder.phoneForCall ?? '')}
            accessibilityLabel={`Llamar a ${elder.displayName}`}
            style={styles.call}
          />
        )}
      </View>
      {planNote === 'basic' && (
        <AppText variant="tiny">
          {FEATURE_FLAGS.SHOW_PLUS_UPSELL
            ? 'Plan gratuito: aviso dentro de la app. Con Círculo Plus, también push y email a todos los acompañantes.'
            : 'Si un día no saluda, verás el aviso aquí, en la app.'}
        </AppText>
      )}
      {planNote === 'inactive' && <AppText variant="tiny">Sin avisos: el plan gratuito incluye 1 ser querido.</AppText>}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: familySpacing.md, alignItems: 'flex-start' },
  flex: { flex: 1, gap: 6 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: familySpacing.sm },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  call: { minHeight: 40 },
});
