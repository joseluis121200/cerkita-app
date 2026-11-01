import { Tabs } from 'expo-router';
import { Heart, House, Images, Mail, Settings } from 'lucide-react-native';

import { familyColors } from '@/shared/ui-family';

// Barra de pestañas en Tinta Noche: más presencia de marca y contraste con el contenido.
export default function CircleTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: familyColors.coralLight,
        tabBarInactiveTintColor: familyColors.onNightMuted,
        tabBarStyle: { backgroundColor: familyColors.night, borderTopColor: familyColors.night },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Hoy', tabBarIcon: ({ color, size }) => <House color={color} size={size} /> }} />
      <Tabs.Screen name="upload" options={{ title: 'Postal', tabBarIcon: ({ color, size }) => <Mail color={color} size={size} /> }} />
      <Tabs.Screen name="album" options={{ title: 'Recuerdos', tabBarIcon: ({ color, size }) => <Images color={color} size={size} /> }} />
      <Tabs.Screen name="elders" options={{ title: 'Seres queridos', tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Ajustes', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }} />
    </Tabs>
  );
}
