import { router } from 'expo-router';
import { UserPlus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFamily, useFamilyContext, useMembers, type FamilyMember } from '@/features/auth-pairing';
import { AlertCard, circleStreak, CircleHeroCard, ElderStatusCard, greetingDays, useElderOverviews, useFamilyCheckins, type ElderOverview } from '@/features/checkin-engine';
import { AddLovedOneButton } from '@/features/elder-config';
import {
  DailyWinkCard, PolaroidCard, postcardDays, StoriesBar, TodayFeed, todaysPostcards, useAddComment, useComments,
  useMoments, useMyNudges, useReactions, useSendNudge, useToggleReaction, type MomentWithAuthor, type StoryItem,
} from '@/features/moments';
import { PlanBanner, usePlan } from '@/features/subscription';
import { AppText, Button, colorForPerson, familyColors, familySpacing, GradientCard, Notice } from '@/shared/ui-family';
import { DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';

type StoryInput = {
  me: FamilyMember | undefined;
  people: FamilyMember[];
  today: MomentWithAuthor[];
  overviews: ElderOverview[];
  nudged: string[];
  onFocus: (momentId: string) => void;
  onNudge: (member: FamilyMember) => void;
};

// Burbujas del círculo: yo primero, luego quien ha mandado postal, después el resto y los seres queridos.
function buildStories({ me, people, today, overviews, nudged, onFocus, onNudge }: StoryInput): StoryItem[] {
  const postedBy = (userId: string) => today.find((m) => m.authorId === userId);
  const items: StoryItem[] = [];
  if (me !== undefined) {
    const mine = postedBy(me.userId);
    items.push({
      key: me.id, name: 'Tú', color: colorForPerson(me.userId), active: mine !== undefined,
      badge: mine === undefined ? { text: '+ Tu postal', tone: 'coral' } : null,
      onPress: () => (mine === undefined ? router.push('/upload') : onFocus(mine.id)),
    });
  }
  const others = people.filter((p) => p.userId !== me?.userId);
  const sorted = [...others.filter((p) => postedBy(p.userId) !== undefined), ...others.filter((p) => postedBy(p.userId) === undefined)];
  for (const person of sorted) {
    const posted = postedBy(person.userId);
    items.push({
      key: person.id, name: person.displayName, color: colorForPerson(person.userId), active: posted !== undefined, badge: null,
      onPress: posted !== undefined ? () => onFocus(posted.id) : undefined,
      nudge: posted === undefined ? { sent: nudged.includes(person.userId), onPress: () => onNudge(person) } : undefined,
    });
  }
  for (const { elder, state } of overviews) {
    const greeted = state.kind === 'ok' || state.kind === 'resolved';
    items.push({
      key: elder.id, name: elder.displayName, color: colorForPerson(elder.id), active: greeted,
      badge: greeted ? { text: '☀️ Saludó', tone: 'emerald' } : { text: '⏳ Pendiente', tone: 'amber' },
    });
  }
  return items;
}

export default function Home() {
  const session = useFamilyContext();
  const familyId = session?.familyId;
  const userId = session?.userId ?? '';
  const family = useFamily(familyId);
  const members = useMembers(familyId);
  const plan = usePlan(familyId);
  const { moments } = useMoments(familyId);
  const checkins = useFamilyCheckins(familyId);
  const { overviews, refetch } = useElderOverviews(familyId);
  const today = todaysPostcards(moments);
  const ids = today.map((m) => m.id);
  const reactions = useReactions(familyId, ids);
  const comments = useComments(familyId, ids);
  const toggle = useToggleReaction(familyId ?? '', ids);
  const addComment = useAddComment(familyId ?? '');
  const nudges = useMyNudges(familyId, userId);
  const sendNudge = useSendNudge(familyId ?? '', userId);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const streak = useMemo(
    () => circleStreak([...postcardDays(moments), ...greetingDays(checkins.data ?? [])], localDateIn(DEFAULT_TIME_ZONE)),
    [moments, checkins.data],
  );

  if (session === null) {
    return null;
  }
  const all = members.data ?? [];
  const people = all.filter((m) => m.role !== 'elder');
  const nameOf = (id: string) => (id === userId ? 'Tú' : (all.find((m) => m.userId === id)?.displayName ?? 'Alguien'));
  const stories = buildStories({
    me: people.find((p) => p.userId === userId), people, today, overviews, nudged: nudges.data ?? [],
    onFocus: setFocusId,
    onNudge: (person) => sendNudge.mutate(person.userId, { onSuccess: () => setNotice(`¡Has animado a ${person.displayName} a subir su postal de hoy! 👋`) }),
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={false} onRefresh={() => void refetch()} />}>
        <View>
          <AppText variant="muted">{`Hola, ${session.displayName} 👋`}</AppText>
          <AppText variant="title" numberOfLines={2}>{family.data?.name ?? 'Tu círculo'}</AppText>
        </View>
        <StoriesBar items={stories} />
        {notice !== null && <Notice tone="calm" text={notice} />}
        <CircleHeroCard streak={streak} overviews={overviews} postcardsToday={today.length} peopleCount={people.length} />
        {overviews.filter((o) => o.state.kind === 'alerted').map((overview) => (
          <AlertCard key={overview.elder.id} overview={overview} familyId={session.familyId} canResolve={session.role === 'admin'} />
        ))}

        <AppText variant="heading">Las postales de hoy</AppText>
        {today.length === 0 ? (
          <GradientCard variant="coral">
            <AppText variant="heading" color={familyColors.white}>Todavía no hay postales hoy 💌</AppText>
            <AppText color={familyColors.white}>Sé la primera persona del círculo en mandar la suya.</AppText>
            <Button title="Mandar mi postal" variant="secondary" onPress={() => router.push('/upload')} />
          </GradientCard>
        ) : (
          <TodayFeed
            postcards={today}
            focusMomentId={focusId}
            renderCard={(moment, width) => (
              <PolaroidCard
                moment={moment} timeZone={DEFAULT_TIME_ZONE} width={width} myUserId={userId}
                reactions={reactions.data ?? []} comments={comments.data ?? []} nameOf={nameOf} colorOf={colorForPerson}
                onToggleReaction={(emoji, active) => toggle.mutate({ momentId: moment.id, userId, emoji, active })}
                onAddComment={(body) => addComment.mutate({ momentId: moment.id, body })}
              />
            )}
          />
        )}
        <DailyWinkCard onAnswer={() => router.push('/upload')} />

        <AppText variant="heading">Tus seres queridos</AppText>
        {overviews.filter((o) => o.state.kind !== 'alerted').map((overview) => (
          <ElderStatusCard key={overview.elder.id} overview={overview} members={all} />
        ))}
        {session.role === 'admin' && overviews.length === 0 && <AddLovedOneButton familyId={session.familyId} />}
        {plan !== null && <PlanBanner plan={plan} onPress={() => router.push('/paywall')} />}
        <Button title="Invitar al círculo" variant="secondary" icon={<UserPlus size={20} color={familyColors.text} />} onPress={() => router.push('/invite')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: familyColors.background },
  content: { padding: familySpacing.lg, gap: familySpacing.lg, paddingBottom: familySpacing.xxl },
});
