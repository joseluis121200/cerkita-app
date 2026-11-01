// Cada persona del círculo tiene su color de anillo (el mismo en todas las pantallas).
const RING_COLORS = ['#F43F5E', '#7C3AED', '#F59E0B', '#10B981', '#0EA5E9', '#EC4899', '#F97316', '#6366F1'] as const;

export function colorForPerson(personId: string): string {
  let hash = 0;
  for (let i = 0; i < personId.length; i++) {
    hash = (hash * 31 + personId.charCodeAt(i)) % 9973;
  }
  return RING_COLORS[hash % RING_COLORS.length] ?? '#F43F5E';
}
