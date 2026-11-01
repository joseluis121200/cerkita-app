import { Send } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { AppText, familyColors, familyRadius, familySpacing, IconButton } from '@/shared/ui-family';

import { commentSchema, type PostcardComment } from '../schemas';

type Props = {
  comments: PostcardComment[];
  nameOf: (userId: string) => string;
  colorOf: (userId: string) => string;
  onAdd: (body: string) => void;
};

// Mini-comentarios de cariño: una línea, máximo 100 caracteres.
export function CommentsBlock({ comments, nameOf, colorOf, onAdd }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const visible = comments.slice(-3);

  function send() {
    const parsed = commentSchema.safeParse(text);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Revisa el texto');
      return;
    }
    onAdd(parsed.data);
    setText('');
    setError(null);
  }

  return (
    <View style={styles.wrapper}>
      {comments.length > visible.length && (
        <AppText variant="tiny">{`+${comments.length - visible.length} comentarios más`}</AppText>
      )}
      {visible.map((comment) => (
        <AppText key={comment.id} variant="small" numberOfLines={2}>
          <AppText variant="small" bold color={colorOf(comment.authorId)}>
            {`${nameOf(comment.authorId)}  `}
          </AppText>
          {comment.body}
        </AppText>
      ))}
      <View style={styles.inputRow}>
        <TextInput
          accessibilityLabel="Escribe un comentario"
          value={text}
          onChangeText={setText}
          placeholder="Escribe algo bonito…"
          placeholderTextColor={familyColors.textMuted}
          maxLength={100}
          returnKeyType="send"
          onSubmitEditing={send}
          style={styles.input}
        />
        <IconButton icon={<Send size={18} color={familyColors.primary} />} onPress={send} accessibilityLabel="Enviar comentario" />
      </View>
      {error !== null && (
        <AppText variant="tiny" color={familyColors.danger}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: familySpacing.sm },
  input: {
    flex: 1,
    minHeight: 42,
    borderRadius: familyRadius.pill,
    borderWidth: 1,
    borderColor: familyColors.border,
    backgroundColor: familyColors.surfaceWarm,
    paddingHorizontal: familySpacing.md,
    fontSize: 15,
    color: familyColors.text,
  },
});
