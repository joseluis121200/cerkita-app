import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

import { logError } from './logger';

type Strength = 'light' | 'medium';

// Respuesta háptica suave en cada toque. En web no existe, así que allí no se llama.
export function tapFeedback(strength: Strength = 'light'): void {
  if (Platform.OS === 'web') {
    return;
  }
  const style = strength === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light;
  Haptics.impactAsync(style).catch((error: unknown) => logError('haptics', error));
}

export function successFeedback(): void {
  if (Platform.OS === 'web') {
    return;
  }
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch((error: unknown) => logError('haptics', error));
}
