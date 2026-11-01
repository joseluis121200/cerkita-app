import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '@/shared/utils/logger';

import { registerCheckin } from './api';

// Cola offline del saludo del mayor (AGENTS.md 8): si no hay cobertura, el toque se guarda
// con su hora real y se envía en cuanto vuelve la conexión. El servidor acepta hasta 36 h.
const QUEUE_KEY = 'cerca-checkin-queue-v1';
const MAX_ATTEMPTS = 50;

type QueuedCheckin = { source: 'morning_button' | 'photo_opened'; occurredAt: string; attempts: number };

async function readQueue(): Promise<QueuedCheckin[]> {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (raw === null) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QueuedCheckin[]) : [];
  } catch (error) {
    logError('checkin-queue', error);
    return [];
  }
}

async function writeQueue(queue: QueuedCheckin[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueCheckin(source: QueuedCheckin['source'], occurredAt: string): Promise<void> {
  const queue = await readQueue();
  queue.push({ source, occurredAt, attempts: 0 });
  // Con 10 toques pendientes basta: el servidor solo necesita el primero de cada día.
  await writeQueue(queue.slice(-10));
}

let flushing = false;

/** Envía lo pendiente. Devuelve true si algún envío fue el primer saludo del día. */
export async function flushCheckinQueue(): Promise<boolean> {
  if (flushing) {
    return false;
  }
  flushing = true;
  let anyFirst = false;
  try {
    const queue = await readQueue();
    const remaining: QueuedCheckin[] = [];
    for (const item of queue) {
      try {
        const first = await registerCheckin(item.source, item.occurredAt);
        anyFirst = anyFirst || first;
      } catch (error) {
        logError('checkin-flush', error, { attempts: item.attempts });
        if (item.attempts + 1 < MAX_ATTEMPTS) {
          remaining.push({ ...item, attempts: item.attempts + 1 });
        }
      }
    }
    await writeQueue(remaining);
  } finally {
    flushing = false;
  }
  return anyFirst;
}
