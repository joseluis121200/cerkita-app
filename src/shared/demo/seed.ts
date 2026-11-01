import { addDays, isoAtLocalTime, localDateIn } from '../utils/dates';
import { demoPhotoUrl, seedComments, seedMoments, seedReactions } from './seed-postcards';
import type { DemoCheckin, DemoState } from './types';

export { demoPhotoUrl };

// "El círculo de Carmen": hijos, nieta y una vecina querida acompañan a la abuela Carmen.
export const DEMO_IDS = {
  family: 'f0000000-0000-4000-8000-000000000001',
  ruben: 'u0000000-0000-4000-8000-000000000001',
  marta: 'u0000000-0000-4000-8000-000000000002',
  lucia: 'u0000000-0000-4000-8000-000000000003',
  ana: 'u0000000-0000-4000-8000-000000000004',
  pablo: 'u0000000-0000-4000-8000-000000000005',
  carmen: 'e0000000-0000-4000-8000-000000000001',
  carmenUser: 'u-elder-carmen',
} as const;

function seedCheckins(now: Date): DemoCheckin[] {
  const checkins: DemoCheckin[] = [];
  for (let daysAgo = 9; daysAgo >= 1; daysAgo--) {
    const localDate = addDays(localDateIn('Europe/Madrid', now), -daysAgo);
    checkins.push({
      id: `c-carmen-${daysAgo}`,
      elderId: DEMO_IDS.carmen,
      localDate,
      status: 'ok',
      confirmedAt: isoAtLocalTime('Europe/Madrid', localDate, '09:05'),
      source: 'morning_button',
      resolvedByUserId: null,
      resolutionNote: null,
    });
  }
  return checkins; // hoy todavía no ha saludado: así se puede probar su pantalla
}

export function buildSeed(now: Date = new Date()): DemoState {
  const joinedAt = new Date(now.getTime() - 45 * 86_400_000).toISOString();
  return {
    version: 3,
    persona: { kind: 'signed_out' },
    family: {
      id: DEMO_IDS.family,
      name: 'El círculo de Carmen',
      planStatus: 'free_limited',
      trialEndsAt: now.toISOString(),
      paidUntil: null,
      inviteToken: '7c0f4f8e-5d2a-4c1b-9a63-2f1e8b7d6c5a',
    },
    profiles: [
      { id: DEMO_IDS.ruben, displayName: 'Rubén', email: 'ruben@ejemplo.es' },
      { id: DEMO_IDS.marta, displayName: 'Marta', email: 'marta@ejemplo.es' },
      { id: DEMO_IDS.lucia, displayName: 'Lucía', email: 'lucia@ejemplo.es' },
      { id: DEMO_IDS.ana, displayName: 'Ana', email: 'ana@ejemplo.es' },
      { id: DEMO_IDS.pablo, displayName: 'Pablo', email: 'pablo@ejemplo.es' },
    ],
    members: [
      { id: 'fm-ruben', userId: DEMO_IDS.ruben, role: 'admin', label: 'Hijo Rubén', receiveCriticalEmails: true, joinedAt },
      { id: 'fm-marta', userId: DEMO_IDS.marta, role: 'admin', label: 'Hija Marta', receiveCriticalEmails: true, joinedAt },
      { id: 'fm-lucia', userId: DEMO_IDS.lucia, role: 'member', label: 'Nieta Lucía', receiveCriticalEmails: false, joinedAt },
      { id: 'fm-ana', userId: DEMO_IDS.ana, role: 'member', label: 'Vecina Ana', receiveCriticalEmails: false, joinedAt },
      { id: 'fm-pablo', userId: DEMO_IDS.pablo, role: 'member', label: 'Nieto Pablo', receiveCriticalEmails: false, joinedAt },
      { id: 'fm-carmen', userId: DEMO_IDS.carmenUser, role: 'elder', label: 'Carmen', receiveCriticalEmails: false, joinedAt },
    ],
    elders: [
      {
        id: DEMO_IDS.carmen,
        userId: DEMO_IDS.carmenUser,
        displayName: 'Carmen',
        relationshipLabel: 'Abuela',
        timezone: 'Europe/Madrid',
        phoneForCall: '+34600111222',
        windowStart: '07:30',
        reminder1At: '10:30',
        reminder2At: '11:05',
        adminAlertAt: '11:30',
        activeDaysMask: 127,
        pausedUntil: null,
        isEnabled: true,
        createdAt: joinedAt,
      },
    ],
    moments: seedMoments(now),
    checkins: seedCheckins(now),
    pairingCodes: [],
    reactions: seedReactions(),
    comments: seedComments(now),
    nudges: [],
    hideTodayPhotos: false,
  };
}
