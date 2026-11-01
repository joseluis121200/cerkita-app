import { router } from 'expo-router';
import { useState } from 'react';

import { emailSchema, firstIssue, SocialButtons, useSendEmailCode, useSocialSignIn, type SocialProvider } from '@/features/auth-pairing';
import { toUserMessage } from '@/shared/api/errors';
import { isDemoMode } from '@/shared/api/mode';
import { useUiStore } from '@/shared/stores/ui-store';
import { AppText, Button, Notice, Screen, TextField } from '@/shared/ui-family';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null);
  const setPendingEmail = useUiStore((state) => state.setPendingEmail);
  const sendCode = useSendEmailCode();
  const social = useSocialSignIn();

  function submit() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(firstIssue(parsed));
      return;
    }
    setError(null);
    sendCode.mutate(parsed.data, {
      onSuccess: () => {
        setPendingEmail(parsed.data);
        router.push('/verify');
      },
      onError: (sendError) => setError(toUserMessage(sendError)),
    });
  }

  function signInWith(provider: SocialProvider) {
    setSocialLoading(provider);
    social.mutate(provider, {
      onSuccess: () => router.replace('/'),
      onError: (socialError) => setError(toUserMessage(socialError)),
      onSettled: () => setSocialLoading(null),
    });
  }

  return (
    <Screen withBottomInset>
      <AppText variant="title">Entra en tu círculo</AppText>
      <AppText variant="muted">Sin contraseñas: te enviamos un código de 6 números a tu email.</AppText>
      <TextField
        label="Tu email"
        value={email}
        onChangeText={setEmail}
        placeholder="nombre@gmail.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
      />
      <Button title="Enviarme el código" loading={sendCode.isPending} onPress={submit} />
      <AppText variant="muted" center>
        o
      </AppText>
      <SocialButtons onPress={signInWith} loading={socialLoading} />
      {isDemoMode && (
        <Notice text="Modo prueba: cualquier email y cualquier código de 6 cifras valen. Con lucia@ejemplo.es entras como miembro del círculo." />
      )}
      <Button title="Volver" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
