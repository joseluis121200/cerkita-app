import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { AppText } from './AppText';
import { familyColors, familyRadius, familySpacing } from './theme';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  helper?: string;
  maxLength?: number;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words';
  autoFocus?: boolean;
};

export function TextField(props: Props) {
  const { label, value, onChangeText, placeholder, error, helper, maxLength, multiline, keyboardType, autoCapitalize, autoFocus } = props;
  const hasError = error !== undefined && error !== null && error.length > 0;

  return (
    <View style={styles.wrapper}>
      <AppText variant="small" bold>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={familyColors.textMuted}
        maxLength={maxLength}
        multiline={multiline}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoFocus={autoFocus}
        style={[styles.input, multiline === true && styles.multiline, hasError && styles.inputError]}
      />
      <View style={styles.footer}>
        {hasError ? (
          <AppText variant="small" color={familyColors.danger}>
            {error}
          </AppText>
        ) : (
          <AppText variant="tiny">{helper ?? ''}</AppText>
        )}
        {maxLength !== undefined && <AppText variant="tiny">{`${value.length}/${maxLength}`}</AppText>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: familySpacing.xs },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: familyColors.border,
    borderRadius: familyRadius.md,
    backgroundColor: familyColors.surface,
    paddingHorizontal: familySpacing.md,
    fontSize: 16,
    color: familyColors.text,
  },
  multiline: { minHeight: 96, paddingTop: familySpacing.md, textAlignVertical: 'top' },
  inputError: { borderColor: familyColors.danger },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: familySpacing.sm },
});
