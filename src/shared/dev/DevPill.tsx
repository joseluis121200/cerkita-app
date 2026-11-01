import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { isDemoMode } from '../api/mode';
import {
  DEMO_IDS,
  freeMyPostcardToday,
  restartDemo,
  setDemoPersona,
  simulateMissedGreeting,
  startWithZeroLovedOnes,
  toggleNoPhotoToday,
  togglePlusPlan,
} from '../demo';
import { logError } from '../utils/logger';

type Action = { label: string; run: () => Promise<unknown> };

const ACTIONS: Action[] = [
  { label: '💗 Vista Rubén (acompañante)', run: () => setDemoPersona({ kind: 'family', userId: DEMO_IDS.ruben }) },
  { label: '👧 Vista Lucía (miembro)', run: () => setDemoPersona({ kind: 'family', userId: DEMO_IDS.lucia }) },
  { label: '👵 Vista Carmen (persona acompañada)', run: () => setDemoPersona({ kind: 'elder', elderId: DEMO_IDS.carmen }) },
  { label: '0️⃣ Empezar con 0 seres queridos', run: startWithZeroLovedOnes },
  { label: '⭐ Alternar Círculo Plus', run: togglePlusPlan },
  { label: '📸 Liberar mi postal de hoy', run: freeMyPostcardToday },
  { label: '🖼️ Día sin postales nuevas (on/off)', run: toggleNoPhotoToday },
  { label: '⏰ Simular hora límite sin saludo', run: simulateMissedGreeting },
  { label: '🚪 Cerrar sesión', run: () => setDemoPersona({ kind: 'signed_out' }) },
  { label: '♻️ Reiniciar datos de prueba', run: restartDemo },
];

// Píldora flotante "Modo Prueba Rápida": solo en desarrollo y sin Supabase configurado.
export function DevPill() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  if (!__DEV__ || !isDemoMode) {
    return null;
  }

  async function run(action: Action) {
    setBusy(true);
    try {
      await action.run();
      await queryClient.resetQueries();
      router.replace('/');
      setOpen(false);
    } catch (error) {
      logError('dev-pill', error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View pointerEvents="box-none" style={[styles.container, { top: insets.top + 6 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={open ? 'Cerrar el menú de prueba' : 'Abrir el menú de prueba'}
        onPress={() => setOpen(!open)}
        style={styles.pill}
      >
        <Text style={styles.pillText}>{open ? '✕ Cerrar' : '🧪 Prueba'}</Text>
      </Pressable>
      {open && (
        <View style={styles.panel}>
          <Text style={styles.title}>Modo Prueba Rápida</Text>
          {ACTIONS.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              disabled={busy}
              onPress={() => void run(action)}
              style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
            >
              <Text style={styles.actionText}>{action.label}</Text>
            </Pressable>
          ))}
          <Text style={styles.footnote}>Datos locales de ejemplo · sin Supabase</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', right: 8, alignItems: 'flex-end', zIndex: 1000 },
  pill: { backgroundColor: '#16161A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, opacity: 0.88 },
  pillText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  panel: {
    marginTop: 6,
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  title: { fontSize: 13, fontWeight: '800', color: '#16161A', marginBottom: 4 },
  action: { paddingVertical: 9, paddingHorizontal: 8, borderRadius: 10 },
  actionPressed: { backgroundColor: '#FFF5F6' },
  actionText: { fontSize: 14, color: '#16161A' },
  footnote: { fontSize: 11, color: '#6E6A63', marginTop: 4 },
});
