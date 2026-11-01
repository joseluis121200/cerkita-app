import type { Family } from '@/features/auth-pairing';

// Modelo de lanzamiento: gratis para siempre + Círculo Plus opcional (migración 0003).
// El servidor aplica los límites; aquí solo calculamos qué mostrar.
export type EffectivePlan = {
  kind: 'plus' | 'grace' | 'free';
  isPlus: boolean;
  maxLovedOnes: number;
  dailyPostcards: number | null; // por persona y día · null = ilimitadas
  historyDays: number | null; // null = sin límite
  advancedAlerts: boolean; // doble recordatorio + push/email a acompañantes + modo vacaciones
};

export const FREE_LIMITS = { lovedOnes: 1, dailyPostcards: 1, historyDays: 14 } as const;

const PLUS: EffectivePlan = {
  kind: 'plus',
  isPlus: true,
  maxLovedOnes: 4,
  dailyPostcards: null,
  historyDays: null,
  advancedAlerts: true,
};

const FREE: EffectivePlan = {
  kind: 'free',
  isPlus: false,
  maxLovedOnes: FREE_LIMITS.lovedOnes,
  dailyPostcards: FREE_LIMITS.dailyPostcards,
  historyDays: FREE_LIMITS.historyDays,
  advancedAlerts: false,
};

export function effectivePlan(family: Pick<Family, 'planStatus' | 'paidUntil'>, now: Date = new Date()): EffectivePlan {
  if (family.planStatus === 'active_paid') {
    if (family.paidUntil === null || new Date(family.paidUntil).getTime() > now.getTime()) {
      return PLUS;
    }
    return FREE;
  }
  if (family.planStatus === 'grace_period') {
    return { ...PLUS, kind: 'grace' };
  }
  return FREE;
}

export const FREE_FEATURES = [
  '1 postal gratis al día para cada persona del círculo',
  'Saludo diario de tu ser querido y confirmación en vivo',
  'Acompañar a 1 ser querido con aviso en la app',
  'Recuerdos de los últimos 14 días',
] as const;

export const PLUS_FEATURES = [
  'Postales ilimitadas cada día para todo el círculo',
  'Acompañar hasta a 4 seres queridos',
  'Todos vuestros recuerdos, sin límite de tiempo',
  'Doble recordatorio suave antes de avisar',
  'Aviso automático por push prioritario y email a todos los acompañantes',
  'Modo vacaciones / acompañado',
] as const;

export type PlanOption = 'monthly' | 'yearly';

export const PLAN_OPTIONS: Record<PlanOption, { title: string; price: string; detail: string; badge: string | null }> = {
  yearly: { title: 'Anual', price: '39,99 €/año', detail: 'Sale a 3,33 € al mes para todo el círculo', badge: 'Ahorra un 33 %' },
  monthly: { title: 'Mensual', price: '4,99 €/mes', detail: 'Cancela cuando quieras', badge: null },
};
