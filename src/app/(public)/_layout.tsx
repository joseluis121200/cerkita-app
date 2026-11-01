import { Stack } from 'expo-router';

import { familyColors } from '@/shared/ui-family';

export default function PublicLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: familyColors.background } }} />;
}
