import { z } from 'zod';

export type CheckinStatus = 'pending' | 'ok' | 'reminded_1' | 'reminded_2' | 'alerted_admins' | 'resolved_by_admin';
export type CheckinSource = 'morning_button' | 'photo_opened' | 'manual_admin';

export type DayCheckin = {
  id: string;
  elderId: string;
  localDate: string;
  status: CheckinStatus;
  confirmedAt: string | null;
  source: CheckinSource | null;
  resolvedByUserId: string | null;
  resolutionNote: string | null;
};

// Estado de hoy de un mayor, ya interpretado para la interfaz.
export type ElderDayState =
  | { kind: 'ok'; at: string | null; source: CheckinSource | null }
  | { kind: 'resolved'; byUserId: string | null; note: string | null }
  | { kind: 'alerted'; checkinId: string }
  | { kind: 'reminded'; level: 1 | 2; checkinId: string }
  | { kind: 'pending' }
  | { kind: 'paused'; until: string }
  | { kind: 'rest_day' }
  | { kind: 'disabled' }
  | { kind: 'not_paired' };

export const resolutionNoteSchema = z.string().trim().max(200, 'La nota puede tener como máximo 200 caracteres');
