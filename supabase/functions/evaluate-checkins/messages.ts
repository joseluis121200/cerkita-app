import type { PushMessage } from '../_shared/notify.ts';

// Textos cálidos de "Tu Círculo". Prohibido: "alarma", "emergencia", "vigilancia"… (AGENTS.md 1).
export const elderMorning: PushMessage = {
  title: 'Buenos días ☀️',
  body: 'Tu círculo te ha mandado la postal de hoy. Toca aquí para verla y saludar.',
};

export const elderReminder1: PushMessage = {
  title: '¿Mandas los buenos días? ☀️',
  body: 'Tus seres queridos están deseando saber de ti. Toca aquí para saludar.',
};

export const elderReminder2: PushMessage = {
  title: 'Tu círculo te manda un abrazo 💛',
  body: 'Toca aquí para mandar los buenos días.',
  priority: 'high',
};

export function adminAlertPush(elderName: string, elderId: string): PushMessage {
  return {
    title: `${elderName} aún no ha mandado los buenos días`,
    body: 'Lo más probable es que esté bien. Llámale para quedaros tranquilos.',
    priority: 'high',
    data: { type: 'alert', elderId },
  };
}

export function adminAlertEmail(elderName: string): { subject: string; html: string } {
  return {
    subject: `${elderName} aún no ha mandado los buenos días`,
    html: `<p>Hola,</p>
<p><strong>${elderName}</strong> todavía no ha mandado los buenos días en Cerca y ya ha pasado su hora habitual.</p>
<p>Lo más probable es que esté bien. Una llamada rápida os dejará tranquilos. Cuando habléis con él o ella,
pulsad «Ya hablé con…» en la app para avisar al resto del círculo.</p>
<p style="color:#6E6A63;font-size:12px">Cerca es una app de comunicación entre seres queridos. No es un servicio médico ni de
emergencias: ante cualquier urgencia, llama al 112.</p>`,
  };
}

export function familyGreeting(elderName: string): PushMessage {
  return { title: `${elderName} os ha mandado los buenos días ☀️`, body: '¡Mandadle la postal de hoy para alegrarle la mañana!' };
}

export function familyResolved(elderName: string, resolverName: string): PushMessage {
  return { title: `Todo bien con ${elderName} ✅`, body: `${resolverName} ya ha hablado con ${elderName}.` };
}
