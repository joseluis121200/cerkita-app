import { router } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useFamilyContext, useMembers } from '@/features/auth-pairing';
import { greetingDays, useFamilyCheckins } from '@/features/checkin-engine';
import {
  computeWeekPulse, MomentGrid, MomentViewer, useComments, useDeleteMoment, useLockedMoments, useMoments, useReactions,
  WeekPulseCard, type MomentWithAuthor,
} from '@/features/moments';
import { usePlan } from '@/features/subscription';
import { FEATURE_FLAGS } from '@/shared/config/featureFlags';
import { AppText, familyColors, familyRadius, familySpacing, LoadingState, Notice, Screen } from '@/shared/ui-family';
import { addDays, DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';

export default function Album() {
  const session = useFamilyContext();
  const familyId = session?.familyId;
  const { moments, isLoading, isError, refetch } = useMoments(familyId);
  const members = useMembers(familyId);
  const checkins = useFamilyCheckins(familyId);
  const locked = useLockedMoments(familyId);
  const plan = usePlan(familyId);
  const remove = useDeleteMoment(familyId ?? '');
  const [selected, setSelected] = useState<MomentWithAuthor | null>(null);

  const weekStart = addDays(localDateIn(DEFAULT_TIME_ZONE), -6);
  const weekIds = moments.filter((m) => localDateIn(DEFAULT_TIME_ZONE, new Date(m.createdAt)) >= weekStart).map((m) => m.id);
  const reactions = useReactions(familyId, weekIds);
  const comments = useComments(familyId, weekIds);
  const pulse = useMemo(
    () => computeWeekPulse(moments, greetingDays(checkins.data ?? []), reactions.data ?? [], comments.data ?? []),
    [moments, checkins.data, reactions.data, comments.data],
  );

  if (session === null) {
    return null;
  }
  const starName = pulse.star === null ? null : (members.data?.find((m) => m.userId === pulse.star?.userId)?.displayName ?? null);
  const starDetail = pulse.star === null ? null : `${pulse.star.postcards} postales y ${pulse.star.kindness} detalles de cariño esta semana`;
  const lockedCount = locked.data ?? 0;
  const historyText =
    plan === null || plan.historyDays === null
      ? 'Círculo Plus: todos vuestros recuerdos, sin límite de tiempo.'
      : `Plan gratuito: veis los recuerdos de los últimos ${plan.historyDays} días.`;

  return (
    <Screen>
      <AppText variant="title">Recuerdos</AppText>
      <WeekPulseCard days={pulse.days} starName={starName} starDetail={starDetail} />
      <Notice tone="info" text={historyText} />
      {isLoading && <LoadingState label="Cargando recuerdos…" />}
      {isError && <LoadingState error="No hemos podido cargar los recuerdos." onRetry={() => void refetch()} />}
      {!isLoading && moments.length === 0 && <AppText variant="muted">Todavía no hay postales. ¡Manda la primera! 💌</AppText>}
      <MomentGrid moments={moments} onOpen={setSelected} />
      {lockedCount > 0 && (
        <Pressable accessibilityRole="button" disabled={!FEATURE_FLAGS.SHOW_PLUS_UPSELL} onPress={() => router.push('/paywall')} style={styles.locked}>
          <Lock size={22} color={familyColors.primary} />
          <View style={styles.flex}>
            <AppText bold>{`${lockedCount} ${lockedCount === 1 ? 'recuerdo más antiguo' : 'recuerdos más antiguos'}`}</AppText>
            <AppText variant="tiny">
              {FEATURE_FLAGS.SHOW_PLUS_UPSELL ? 'Siguen guardados. Desbloquéalos con Círculo Plus.' : 'Siguen guardados de forma segura.'}
            </AppText>
          </View>
        </Pressable>
      )}
      <MomentViewer
        moment={selected}
        canDelete={selected !== null && (selected.authorId === session.userId || session.role === 'admin')}
        deleting={remove.isPending}
        onDelete={(moment) => remove.mutate(moment, { onSuccess: () => setSelected(null) })}
        onClose={() => setSelected(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: familySpacing.md,
    padding: familySpacing.lg,
    borderRadius: familyRadius.lg,
    backgroundColor: familyColors.accentSurface,
    borderWidth: 1,
    borderColor: familyColors.accentSoft,
  },
  flex: { flex: 1 },
});
