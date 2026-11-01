import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppText, familyColors, familyRadius, familySpacing } from '@/shared/ui-family';
import { tapFeedback } from '@/shared/utils/haptics';

import { REACTIONS, type Reaction } from '../schemas';

type Props = {
  momentId: string;
  reactions: Reaction[];
  myUserId: string;
  onToggle: (emoji: string, active: boolean) => void;
  nameOf: (userId: string) => string;
};

/** "Reaccionaron Lucía, Marta y 2 más" */
function reactorsLine(reactions: Reaction[], momentId: string, nameOf: (userId: string) => string): string | null {
  const users: string[] = [];
  for (const r of reactions) {
    if (r.momentId === momentId && !users.includes(r.userId)) users.push(r.userId);
  }
  if (users.length === 0) return null;
  const names = users.map(nameOf);
  if (names.length <= 2) return `Reaccionaron ${names.join(' y ')}`;
  return `Reaccionaron ${names[0] ?? ''}, ${names[1] ?? ''} y ${names.length - 2} más`;
}

// Reacciones rápidas con vibración y micro-rebote (❤️ 🥰 ☀️ 👏).
export function ReactionBar({ momentId, reactions, myUserId, onToggle, nameOf }: Props) {
  const line = reactorsLine(reactions, momentId, nameOf);
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {REACTIONS.map((emoji) => {
          const forEmoji = reactions.filter((r) => r.momentId === momentId && r.emoji === emoji);
          const mine = forEmoji.some((r) => r.userId === myUserId);
          return (
            <BounceReaction key={emoji} emoji={emoji} count={forEmoji.length} mine={mine} onPress={() => onToggle(emoji, !mine)} />
          );
        })}
      </View>
      {line !== null && <AppText variant="tiny">{line}</AppText>}
    </View>
  );
}

type BounceProps = { emoji: string; count: number; mine: boolean; onPress: () => void };

function BounceReaction({ emoji, count, mine, onPress }: BounceProps) {
  const [scale] = useState(() => new Animated.Value(1));

  function press() {
    tapFeedback(mine ? 'light' : 'medium');
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 60, bounciness: 14 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 12 }),
    ]).start();
    onPress();
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${mine ? 'Quitar' : 'Enviar'} reacción ${emoji}. ${count} en total`}
      accessibilityState={{ selected: mine }}
      onPress={press}
      style={[styles.pill, mine && styles.pillMine]}
    >
      <Animated.Text style={[styles.emoji, { transform: [{ scale }] }]}>{emoji}</Animated.Text>
      {count > 0 && <Text style={[styles.count, mine && styles.countMine]}>{count}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  row: { flexDirection: 'row', gap: familySpacing.sm },
  pill: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: familyRadius.pill,
    borderWidth: 1.5,
    borderColor: familyColors.border,
    backgroundColor: familyColors.surfaceWarm,
  },
  pillMine: { borderColor: familyColors.accent, backgroundColor: familyColors.accentSoft },
  emoji: { fontSize: 21 },
  count: { fontSize: 14, fontWeight: '800', color: familyColors.textMuted },
  countMine: { color: familyColors.primary },
});
