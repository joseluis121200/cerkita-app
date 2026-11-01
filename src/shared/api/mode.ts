// ¿Hay Supabase configurado en .env? Este archivo NO crea el cliente, así que cualquier
// pantalla puede consultarlo sin romper la regla 2 de AGENTS.md.
const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const SUPABASE_URL = url;
export const SUPABASE_ANON_KEY = anonKey;

// Sin .env la app arranca en MODO PRUEBA con datos locales (src/shared/demo).
export const isDemoMode = url.length === 0 || anonKey.length === 0;
