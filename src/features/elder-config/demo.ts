import { demoLatency, readDemo, updateDemo, type DemoElder } from '@/shared/demo';
import { createId } from '@/shared/utils/ids';

import type { Elder, ElderInput, PairingCode } from './schemas';

function toElder(row: DemoElder, familyId: string): Elder {
  return {
    id: row.id,
    familyId,
    isPaired: row.userId !== null,
    displayName: row.displayName,
    relationshipLabel: row.relationshipLabel,
    timezone: row.timezone,
    phoneForCall: row.phoneForCall,
    windowStart: row.windowStart,
    reminder1At: row.reminder1At,
    reminder2At: row.reminder2At,
    adminAlertAt: row.adminAlertAt,
    activeDaysMask: row.activeDaysMask,
    pausedUntil: row.pausedUntil,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
  };
}

export async function demoListElders(): Promise<Elder[]> {
  const state = await readDemo();
  return state.elders.map((row) => toElder(row, state.family.id));
}

export async function demoCreateElder(input: ElderInput): Promise<Elder> {
  await demoLatency();
  return updateDemo((state) => {
    if (state.elders.length >= 4) {
      throw new Error('A family can have at most 4 elders');
    }
    const hasPlus = state.family.planStatus === 'active_paid' || state.family.planStatus === 'grace_period';
    if (state.elders.length >= 1 && !hasPlus) {
      throw new Error('Free plan allows 1 loved one'); // mismo límite que el trigger del servidor
    }
    const row: DemoElder = { ...input, id: createId(), userId: null, createdAt: new Date().toISOString() };
    state.elders.push(row);
    return toElder(row, state.family.id);
  });
}

export async function demoUpdateElder(elderId: string, input: ElderInput): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    const row = state.elders.find((e) => e.id === elderId);
    if (row !== undefined) {
      Object.assign(row, input);
    }
  });
}

export async function demoDeleteElder(elderId: string): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    const row = state.elders.find((e) => e.id === elderId);
    state.elders = state.elders.filter((e) => e.id !== elderId);
    state.checkins = state.checkins.filter((c) => c.elderId !== elderId);
    if (row?.userId !== null && row?.userId !== undefined) {
      const elderUserId = row.userId;
      state.members = state.members.filter((m) => m.userId !== elderUserId);
    }
  });
}

export async function demoCreatePairingCode(elderId: string): Promise<PairingCode> {
  await demoLatency(400);
  return updateDemo((state) => {
    const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    const validUntil = new Date(Date.now() + 30 * 60_000).toISOString();
    state.pairingCodes = state.pairingCodes.filter((p) => p.elderId !== elderId);
    state.pairingCodes.push({ code, elderId, expiresAt: validUntil });
    return { code, validUntil };
  });
}
