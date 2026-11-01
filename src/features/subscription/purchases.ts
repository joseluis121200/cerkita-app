import { isDemoMode } from '@/shared/api/supabase';
import { demoLatency, updateDemo } from '@/shared/demo';

import type { PlanOption } from './plan';

// Adaptador de compras. RevenueCat (react-native-purchases) necesita development build:
// en Expo Go nunca se importa, así que jamás lanza "módulo nativo nulo".
// Al pasar a development build, sustituir el bloque "modo real" por Purchases.purchasePackage(...)
// usando appUserID = family_id (lo que espera el webhook revenuecat-webhook).
export type PurchaseResult =
  | { status: 'purchased' }
  | { status: 'restored'; found: boolean }
  | { status: 'unavailable'; reason: string };

const UNAVAILABLE = 'Las compras se activan en la versión instalada de la app (development build). En Expo Go no es posible pagar.';

export async function purchasePlan(option: PlanOption): Promise<PurchaseResult> {
  if (!isDemoMode) {
    return { status: 'unavailable', reason: UNAVAILABLE };
  }
  await demoLatency(800);
  await updateDemo((state) => {
    const months = option === 'yearly' ? 12 : 1;
    const until = new Date();
    until.setMonth(until.getMonth() + months);
    state.family.planStatus = 'active_paid';
    state.family.paidUntil = until.toISOString();
  });
  return { status: 'purchased' };
}

export async function restorePurchases(): Promise<PurchaseResult> {
  if (!isDemoMode) {
    return { status: 'unavailable', reason: UNAVAILABLE };
  }
  await demoLatency(600);
  return { status: 'restored', found: false };
}
