import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuthListener } from '@/features/auth-pairing';
import { QUERY_CACHE_MAX_AGE, queryClient, queryPersister } from '@/shared/api/query-client';
import { DevPill } from '@/shared/dev/DevPill';
import { familyColors } from '@/shared/ui-family';

function AuthListener() {
  useAuthListener();
  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister: queryPersister, maxAge: QUERY_CACHE_MAX_AGE }}>
        <AuthListener />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: familyColors.background } }} />
        <DevPill />
      </PersistQueryClientProvider>
    </SafeAreaProvider>
  );
}
