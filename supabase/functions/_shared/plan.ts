// Mismas reglas que src/features/subscription/plan.ts, aplicadas en el servidor (quien decide).
// Modelo de lanzamiento: gratis para siempre + Círculo Plus opcional (migración 0003).
export type FamilyPlanRow = { plan_status: string; paid_until: string | null };

export function hasPlus(family: FamilyPlanRow, now: Date): boolean {
  if (family.plan_status === 'active_paid') {
    return family.paid_until === null || new Date(family.paid_until).getTime() > now.getTime();
  }
  return family.plan_status === 'grace_period';
}
