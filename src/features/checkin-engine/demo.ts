import { demoLatency, readDemo, updateDemo } from '@/shared/demo';
import { createId } from '@/shared/utils/ids';
import { localDateIn } from '@/shared/utils/dates';

import type { CheckinSource, DayCheckin } from './schemas';

export async function demoFetchCheckins(): Promise<DayCheckin[]> {
  const state = await readDemo();
  return state.checkins.map((c) => ({ ...c }));
}

export async function demoRegisterCheckin(source: CheckinSource, occurredAt: string): Promise<boolean> {
  await demoLatency(300);
  return updateDemo((state) => {
    if (state.persona.kind !== 'elder') {
      throw new Error('Only paired elder devices can check in');
    }
    const elderId = state.persona.elderId;
    const elder = state.elders.find((e) => e.id === elderId);
    if (elder === undefined) {
      throw new Error('Only paired elder devices can check in');
    }
    const localDate = localDateIn(elder.timezone, new Date(occurredAt));
    const existing = state.checkins.find((c) => c.elderId === elderId && c.localDate === localDate);
    if (existing === undefined) {
      state.checkins.push({
        id: createId(),
        elderId,
        localDate,
        status: 'ok',
        confirmedAt: occurredAt,
        source,
        resolvedByUserId: null,
        resolutionNote: null,
      });
      return true;
    }
    const wasOk = existing.status === 'ok';
    existing.status = 'ok';
    if (existing.confirmedAt === null || occurredAt < existing.confirmedAt) {
      existing.confirmedAt = occurredAt;
      existing.source = source;
    }
    return !wasOk;
  });
}

export async function demoResolveCheckin(checkinId: string, note: string | null): Promise<boolean> {
  await demoLatency(400);
  return updateDemo((state) => {
    const row = state.checkins.find((c) => c.id === checkinId);
    if (row === undefined || row.status === 'ok' || row.status === 'resolved_by_admin') {
      return false;
    }
    row.status = 'resolved_by_admin';
    row.source = 'manual_admin';
    row.confirmedAt = new Date().toISOString();
    row.resolvedByUserId = state.persona.kind === 'family' ? state.persona.userId : null;
    row.resolutionNote = note;
    return true;
  });
}
