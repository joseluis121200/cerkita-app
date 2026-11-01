import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppText, Avatar, familyColors, familyGradients, familySpacing } from '@/shared/ui-family';
import { tapFeedback } from '@/shared/utils/haptics';

export type StoryItem = {
  key: string;
  name: string;
  color: string;
  active: boolean;
  badge: { text: string; tone: 'coral' | 'emerald' | 'amber' } | null;
  onPress?: () => void;
  nudge?: { sent: boolean; onPress: () => void };
};

const badgeColors = {
  coral: familyColors.primary,
  emerald: familyColors.emerald,
  amber: familyColors.amber,
} as const;

// Burbujas del círculo hoy: anillo de colores = ya ha mandado su postal (o ya ha saludado).
export function StoriesBar({ items }: { items: StoryItem[] }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => (
        <View key={item.key} style={styles.item}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}${item.badge !== null ? `: ${item.badge.text}` : ''}`}
            disabled={item.onPress === undefined}
            onPress={() => {
              tapFeedback();
              item.onPress?.();
            }}
          >
            {item.active ? (
              <LinearGradient colors={familyGradients.coral} style={styles.ring}>
                <View style={styles.inner}>
                  <Avatar name={item.name} size={58} />
                </View>
              </LinearGradient>
            ) : (
              <View style={[styles.ring, styles.idleRing, { borderColor: item.color }]}>
                <Avatar name={item.name} size={58} />
              </View>
            )}
          </Pressable>
          <AppText variant="tiny" bold numberOfLines={1} style={styles.name}>
            {item.name}
          </AppText>
          {item.badge !== null && (
            <View style={[styles.badge, { backgroundColor: badgeColors[item.badge.tone] }]}>
              <Text style={styles.badgeText} numberOfLines={1}>{item.badge.text}</Text>
            </View>
          )}
          {item.nudge !== undefined && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={item.nudge.sent ? `Ya has animado a ${item.name}` : `Animar a ${item.name} a mandar su postal`}
              disabled={item.nudge.sent}
              onPress={item.nudge.onPress}
              style={[styles.nudge, item.nudge.sent && styles.nudgeSent]}
            >
              <Text style={styles.nudgeText}>{item.nudge.sent ? 'Animado ✓' : 'Animar 👋'}</Text>
            </Pressable>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: familySpacing.md, paddingVertical: 4, paddingRight: familySpacing.lg },
  item: { width: 78, alignItems: 'center', gap: 4 },
  ring: { width: 70, height: 70, borderRadius: 35, alignItems: 'center', justifyContent: 'center' },
  inner: { width: 64, height: 64, borderRadius: 32, backgroundColor: familyColors.background, alignItems: 'center', justifyContent: 'center' },
  idleRing: { borderWidth: 2, borderStyle: 'dashed' },
  name: { maxWidth: 76, textAlign: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, maxWidth: 78 },
  badgeText: { color: familyColors.white, fontSize: 11, fontWeight: '800' },
  nudge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: familyColors.violetSoft },
  nudgeSent: { opacity: 0.6 },
  nudgeText: { color: familyColors.violet, fontSize: 11, fontWeight: '800' },
});
