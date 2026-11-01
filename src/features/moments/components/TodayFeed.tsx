import { useEffect, useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';

import { familyColors } from '@/shared/ui-family';

import type { MomentWithAuthor } from '../schemas';

type Props = {
  postcards: MomentWithAuthor[];
  focusMomentId: string | null;
  renderCard: (moment: MomentWithAuthor, width: number) => React.ReactElement;
};

const GAP = 14;

// Carrusel de las postales de hoy. Se ve un trocito de la siguiente para invitar a deslizar.
export function TodayFeed({ postcards, focusMomentId, renderCard }: Props) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width - 64, 420);
  const listRef = useRef<FlatList<MomentWithAuthor>>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (focusMomentId === null) {
      return;
    }
    const index = postcards.findIndex((m) => m.id === focusMomentId);
    if (index >= 0) {
      listRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [focusMomentId, postcards]);

  return (
    <View>
      <FlatList
        ref={listRef}
        horizontal
        data={postcards}
        keyExtractor={(moment) => moment.id}
        renderItem={({ item }) => <View style={{ width: cardWidth, marginRight: GAP }}>{renderCard(item, cardWidth)}</View>}
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardWidth + GAP}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: cardWidth + GAP, offset: (cardWidth + GAP) * index, index })}
        onMomentumScrollEnd={(event) => setPage(Math.round(event.nativeEvent.contentOffset.x / (cardWidth + GAP)))}
        contentContainerStyle={styles.content}
      />
      {postcards.length > 1 && (
        <View style={styles.dots}>
          {postcards.map((moment, index) => (
            <View key={moment.id} style={[styles.dot, index === page && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 2, paddingRight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: familyColors.border },
  dotActive: { width: 22, backgroundColor: familyColors.primary },
});
