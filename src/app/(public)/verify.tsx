import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { firstIssue, otpSchema, useSendEmailCode, useVerifyEmailCode } from '@/features/auth-pairing';
import { toUserMessage } from '@/shared/api/errors';
import { useUiStore } from '@/shared/stores/ui-store';
import { AppText, Button, familyColors, familyRadius, Notice, Screen } from '@/shared/ui-family';

export default function Verify() {
  const email = useUiStore((state) => state.pendingEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);
  const verify = useVerifyEmailCode();
  const resend = useSendEmailCode();

  if (email === null) {
    return (
      <Screen>
        <Notice tone="warning" text="Primero escribe tu email." />
        <Button title="Volver" onPress={() => router.replace('/login')} />
      </Screen>
    );
  }
  const currentEmail = email;

  function submit(value: string) {
    const parsed = otpSchema.safeParse(value);
    if (!parsed.success) {
      setError(firstIssue(parsed));
      return;
    }
    setError(null);
    verify.mutate(
      { email: currentEmail, code: parsed.data },
      { onSuccess: () => router.replace('/'), onError: (verifyError) => setError(toUserMessage(verifyError)) },
    );
  }

  function change(text: string) {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(digits);
    if (digits.length === 6) {
      submit(digits);
    }
  }

  return (
    <Screen withBottomInset>
      <AppText variant="title">Revisa tu email</AppText>
      <AppText variant="muted">{`Hemos enviado un código de 6 números a ${currentEmail}.`}</AppText>
      <TextInput
        accessibilityLabel="Código de 6 números"
        value={code}
        onChangeText={change}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        style={styles.input}
        placeholder="••••••"
        placeholderTextColor={familyColors.textMuted}
      />
      {error !== null && <Notice tone="warning" text={error} />}
      {resent && <Notice tone="calm" text="Te hemos enviado otro código." />}
      <Button title="Entrar" loading={verify.isPending} onPress={() => submit(code)} />
      <Button
        title="Enviar otro código"
        variant="ghost"
        loading={resend.isPending}
        onPress={() => resend.mutate(currentEmail, { onSuccess: () => setResent(true) })}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 36,
    letterSpacing: 12,
    textAlign: 'center',
    fontWeight: '800',
    color: familyColors.text,
    borderWidth: 1,
    borderColor: familyColors.border,
    borderRadius: familyRadius.md,
    backgroundColor: familyColors.surface,
    paddingVertical: 14,
  },
});
