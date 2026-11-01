import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '../utils/logger';
import { buildSeed } from './seed';
import type { DemoState } from './types';

// Motor local persistente: todo el "backend" del modo prueba vive en AsyncStorage.
// v3: postal gratis por persona + comentarios + toques (los datos anteriores se vuelven a sembrar).
const STORAGE_KEY = 'cerca-demo-state-v3';

let cache: DemoState | null = null;

async function persist(state: DemoState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isDemoState(value: unknown): value is DemoState {
  return typeof value === 'object' && value !== null && (value as { version?: unknown }).version === 3;
}

export async function readDemo(): Promise<DemoState> {
  if (cache !== null) {
    return cache;
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (isDemoState(parsed)) {
        cache = parsed;
        return parsed;
      }
    }
  } catch (error) {
    logError('demo-store', error); // datos corruptos: volvemos a sembrar
  }
  const seeded = buildSeed();
  cache = seeded;
  await persist(seeded);
  return seeded;
}

/** Aplica un cambio al estado de prueba y lo guarda. Devuelve lo que devuelva `change`. */
export async function updateDemo<T>(change: (state: DemoState) => T): Promise<T> {
  const state = await readDemo();
  const result = change(state);
  await persist(state);
  return result;
}

export async function resetDemo(): Promise<void> {
  const seeded = buildSeed();
  cache = seeded;
  await persist(seeded);
}

/** Pequeña espera para que el modo prueba se comporte como una red real (spinners incluidos). */
export function demoLatency(ms = 250): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
