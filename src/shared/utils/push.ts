import { logInfo } from './logger';

// Adaptador de notificaciones push. Expo Go (Android) ya no admite push remotas, así que
// en esta fase devolvemos null sin lanzar errores. Al pasar a development build:
// 1) npx expo install expo-notifications expo-device
// 2) pedir permiso, obtener getExpoPushTokenAsync({ projectId }) y devolverlo aquí.
// El resto de la app (registerPushToken en auth-pairing) ya está preparado para usarlo.
export type PushRegistration = { token: string; platform: 'ios' | 'android' };

export async function getPushRegistration(): Promise<PushRegistration | null> {
  logInfo('push', 'Push remotas desactivadas en Expo Go: se activarán con el development build');
  return null;
}
