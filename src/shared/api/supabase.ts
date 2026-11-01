import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import type { Database } from './database.types';
import { isDemoMode, SUPABASE_ANON_KEY, SUPABASE_URL } from './mode';

export { isDemoMode };

// Bucket privado de la migración 0001 (AGENTS.md regla 8).
export const MOMENTS_BUCKET = 'family-moments';

function makeClient() {
  return createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

export type AppSupabaseClient = ReturnType<typeof makeClient>;

const client: AppSupabaseClient | null = isDemoMode ? null : makeClient();

if (client !== null && Platform.OS !== 'web') {
  // Refresca la sesión solo con la app en primer plano (recomendación de Supabase para RN).
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      client.auth.startAutoRefresh();
    } else {
      client.auth.stopAutoRefresh();
    }
  });
}

/** Solo para archivos api.ts de las features (AGENTS.md regla 2). */
export function requireSupabase(): AppSupabaseClient {
  if (client === null) {
    throw new Error('Supabase no está configurado: la app está en modo prueba');
  }
  return client;
}
