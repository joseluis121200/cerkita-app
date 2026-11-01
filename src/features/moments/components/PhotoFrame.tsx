import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { ElderText, elderColors, elderSizes } from '@/shared/ui-elder';
import { Avatar } from '@/shared/ui-family';
import { relativeDayLabel } from '@/shared/utils/dates';
import { formatClock } from '@/shared/utils/format';

import { authorForElder, type PhotoOfTheDay } from '../schemas';

type Props = { photo: PhotoOfTheDay; timeZone: string };

// Marco fotográfico de revista para la persona acompañada: foto protagonista y texto editorial.
export function PhotoFrame({ photo, timeZone }: Props) {
  const { moment, isMemory } = photo;
  const when = `${relativeDayLabel(moment.createdAt, timeZone)} · ${formatClock(moment.createdAt, timeZone)}`;

  return (
    <View style={styles.frame}>
      <View>
        <Image
          source={{ uri: moment.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          accessibilityLabel={moment.caption ?? 'Foto de tu círculo'}
        />
        {isMemory && (
          <View style={styles.memoryBadge}>
            <ElderText color={elderColors.memory}>Un recuerdo de tu círculo 💛</ElderText>
          </View>
        )}
        <View style={styles.avatar}>
          <Avatar name={moment.authorName} size={64} ring />
        </View>
      </View>
      <View style={styles.texts}>
        <ElderText color={elderColors.textSoft}>{`De ${authorForElder(moment).replace(/^Tu /, 'tu ')}`}</ElderText>
        <ElderText color={elderColors.textSoft}>{when}</ElderText>
        {moment.caption !== null && moment.caption.length > 0 && (
          <ElderText variant="title" style={styles.caption}>
            {moment.caption}
          </ElderText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: elderColors.frame,
    borderRadius: elderSizes.radius,
    borderWidth: 1,
    borderColor: elderColors.border,
    padding: 12,
    shadowColor: elderColors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  image: { width: '100%', aspectRatio: 4 / 5, borderRadius: 22, backgroundColor: elderColors.memorySoft },
  memoryBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    backgroundColor: elderColors.overlay,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  avatar: { position: 'absolute', left: 16, bottom: -28 },
  texts: { paddingTop: 36, paddingHorizontal: 8, paddingBottom: 10, gap: 2 },
  caption: { marginTop: 10 },
});
