import AsyncStorage from '@react-native-async-storage/async-storage';

// Recordamos (solo en este móvil) el día en que el mayor pulsó «Buenos días».
// Así la confirmación sigue visible aunque el día ya contase por haber visto la foto.
const KEY = 'cerca-greeting-pressed-v1';

export async function rememberButtonPress(localDate: string): Promise<void> {
  await AsyncStorage.setItem(KEY, localDate);
}

export async function readButtonPressDate(): Promise<string | null> {
  return AsyncStorage.getItem(KEY);
}
