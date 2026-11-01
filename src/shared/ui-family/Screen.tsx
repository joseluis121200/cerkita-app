import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { familyColors, familySpacing } from './theme';

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  // En las pestañas la barra inferior ya respeta el borde inferior.
  withBottomInset?: boolean;
};

export function Screen({ children, scroll = true, withBottomInset = false }: Props) {
  const edges = withBottomInset ? (['top', 'bottom'] as const) : (['top'] as const);
  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: familyColors.background },
  flex: { flex: 1 },
  content: { padding: familySpacing.lg, gap: familySpacing.lg, paddingBottom: familySpacing.xxl },
});
