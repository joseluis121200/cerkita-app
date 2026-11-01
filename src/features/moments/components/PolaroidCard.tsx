import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { AppText, familyColors, familySpacing, polaroidShadow } from '@/shared/ui-family';
import { formatClock } from '@/shared/utils/format';

import type { MomentWithAuthor, PostcardComment, Reaction } from '../schemas';
import { CommentsBlock } from './CommentsBlock';
import { ReactionBar } from './ReactionBar';

type Props = {
  moment: MomentWithAuthor;
  timeZone: string;
  width: number;
  myUserId: string;
  reactions: Reaction[];
  comments: PostcardComment[];
  nameOf: (userId: string) => string;
  colorOf: (userId: string) => string;
  onToggleReaction: (emoji: string, active: boolean) => void;
  onAddComment: (body: string) => void;
};

// Postal con acabado "Polaroid táctil": marco con cuerpo, hora estilo carrete y color del autor.
export function PolaroidCard(props: Props) {
  const { moment, timeZone, width, myUserId, reactions, comments, nameOf, colorOf, onToggleReaction, onAddComment } = props;
  return (
    <View style={[styles.polaroid, { width }]}>
      <View>
        <Image source={{ uri: moment.imageUrl }} style={styles.photo} contentFit="cover" transition={250} />
        <View style={[styles.author, { backgroundColor: colorOf(moment.authorId) }]}>
          <Text style={styles.authorText} numberOfLines={1}>
            {moment.authorLabel ?? moment.authorName}
          </Text>
        </View>
        <View style={styles.film}>
          <Text style={styles.filmText}>{`${formatClock(moment.createdAt, timeZone)} · HOY`}</Text>
        </View>
      </View>
      {moment.caption !== null && moment.caption.length > 0 && <AppText style={styles.caption}>{moment.caption}</AppText>}
      <ReactionBar momentId={moment.id} reactions={reactions} myUserId={myUserId} onToggle={onToggleReaction} nameOf={nameOf} />
      <CommentsBlock comments={comments.filter((c) => c.momentId === moment.id)} nameOf={nameOf} colorOf={colorOf} onAdd={onAddComment} />
    </View>
  );
}

const styles = StyleSheet.create({
  polaroid: {
    backgroundColor: familyColors.surface,
    borderRadius: 20,
    padding: 12,
    paddingBottom: 18,
    gap: familySpacing.md,
    marginVertical: 14,
    ...polaroidShadow,
  },
  photo: { width: '100%', aspectRatio: 4 / 5, borderRadius: 12, backgroundColor: familyColors.surfaceWarm },
  author: { position: 'absolute', left: 10, top: 10, maxWidth: '70%', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  authorText: { color: familyColors.white, fontWeight: '800', fontSize: 13 },
  film: { position: 'absolute', right: 10, bottom: 10, backgroundColor: familyColors.filmChip, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  filmText: { color: familyColors.gold, fontWeight: '800', fontSize: 12, letterSpacing: 1.2, fontVariant: ['tabular-nums'] },
  caption: { fontSize: 18, fontWeight: '700', lineHeight: 24, paddingHorizontal: 2 },
});
