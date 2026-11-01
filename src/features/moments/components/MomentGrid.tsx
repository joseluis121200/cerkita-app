import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { familyColors, familySpacing } from '@/shared/ui-family';

import type { MomentWithAuthor } from '../schemas';

type Props = { moments: MomentWithAuthor[]; onOpen: (moment: MomentWithAuthor) => void };

// Rejilla de 3 columnas del álbum familiar (la pantalla ya hace scroll).
export function MomentGrid({ moments, onOpen }: Props) {
  return (
    <View style={styles.grid}>
      {moments.map((moment) => (
        <Pressable
          key={moment.id}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Foto de ${moment.authorName}${moment.caption !== null ? `: ${moment.caption}` : ''}`}
          onPress={() => onOpen(moment)}
          style={styles.cell}
        >
          <Image source={{ uri: moment.imageUrl }} style={styles.image} contentFit="cover" transition={200} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: familySpacing.xs },
  cell: { width: '32.5%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden', backgroundColor: familyColors.surfaceWarm },
  image: { width: '100%', height: '100%' },
});
