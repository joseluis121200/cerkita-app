import type { FamilyMember } from '@/features/auth-pairing';
import { formatClock } from '@/shared/utils/format';

import type { ElderDayState } from './schemas';
import { shortDate } from './status';

export type DayStateText = { title: string; detail: string | null; tone: 'calm' | 'warm' | 'alert' | 'muted' };

// Textos del panel de tranquilidad. En la interfaz familiar decimos "aviso", nunca "alarma".
export function describeDayState(state: ElderDayState, timeZone: string, members: FamilyMember[]): DayStateText {
  switch (state.kind) {
    case 'ok': {
      const at = state.at === null ? '' : ` a las ${formatClock(state.at, timeZone)}`;
      const verb = state.source === 'photo_opened' ? 'Vio la postal del día' : 'Mandó los buenos días';
      return { title: `${verb}${at} ☀️`, detail: null, tone: 'calm' };
    }
    case 'resolved': {
      const who = members.find((m) => m.userId === state.byUserId)?.displayName;
      return {
        title: 'Todo bien ✅',
        detail: `${who !== undefined ? `Confirmado por ${who}` : 'Confirmado por el círculo'}${state.note !== null ? ` · «${state.note}»` : ''}`,
        tone: 'calm',
      };
    }
    case 'alerted':
      return { title: 'Aún no ha mandado los buenos días', detail: 'Llámale para quedaros tranquilos.', tone: 'alert' };
    case 'reminded':
      return {
        title: 'Aún no ha saludado hoy',
        detail: state.level === 1 ? 'Le hemos enviado un recordatorio suave.' : 'Le hemos enviado un segundo recordatorio.',
        tone: 'warm',
      };
    case 'pending':
      return { title: 'Aún no ha saludado hoy', detail: null, tone: 'warm' };
    case 'paused':
      return { title: `Modo vacaciones hasta el ${shortDate(state.until)}`, detail: 'Sin recordatorios ni avisos.', tone: 'muted' };
    case 'rest_day':
      return { title: 'Hoy no hay avisos', detail: 'Día sin aviso según su configuración.', tone: 'muted' };
    case 'disabled':
      return { title: 'Avisos desactivados', detail: 'Actívalos en «Seres queridos».', tone: 'muted' };
    case 'not_paired':
      return { title: 'Falta unir su móvil', detail: 'Genera su código en «Seres queridos».', tone: 'muted' };
  }
}
