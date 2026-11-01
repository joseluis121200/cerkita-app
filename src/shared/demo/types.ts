// Modelo del motor local de prueba. Refleja las tablas de Supabase para que las features
// puedan alternar entre "modo prueba" y "modo real" sin cambiar la interfaz.
export type DemoRole = 'admin' | 'member' | 'elder';
export type DemoPlanStatus = 'trialing' | 'free_limited' | 'active_paid' | 'grace_period';
export type DemoCheckinStatus = 'pending' | 'ok' | 'reminded_1' | 'reminded_2' | 'alerted_admins' | 'resolved_by_admin';
export type DemoCheckinSource = 'morning_button' | 'photo_opened' | 'manual_admin';

export type DemoPersona =
  | { kind: 'signed_out' }
  | { kind: 'family'; userId: string }
  | { kind: 'elder'; elderId: string };

export type DemoFamily = {
  id: string;
  name: string;
  planStatus: DemoPlanStatus;
  trialEndsAt: string;
  paidUntil: string | null;
  inviteToken: string;
};

export type DemoProfile = { id: string; displayName: string; email: string };

export type DemoMember = {
  id: string;
  userId: string;
  role: DemoRole;
  label: string | null;
  receiveCriticalEmails: boolean;
  joinedAt: string;
};

export type DemoElder = {
  id: string;
  userId: string | null;
  displayName: string;
  relationshipLabel: string | null;
  timezone: 'Europe/Madrid' | 'Atlantic/Canary';
  phoneForCall: string | null;
  windowStart: string;
  reminder1At: string;
  reminder2At: string;
  adminAlertAt: string;
  activeDaysMask: number;
  pausedUntil: string | null;
  isEnabled: boolean;
  createdAt: string;
};

export type DemoMoment = { id: string; authorId: string; imageUrl: string; caption: string | null; createdAt: string };

export type DemoCheckin = {
  id: string;
  elderId: string;
  localDate: string;
  status: DemoCheckinStatus;
  confirmedAt: string | null;
  source: DemoCheckinSource | null;
  resolvedByUserId: string | null;
  resolutionNote: string | null;
};

export type DemoPairingCode = { code: string; elderId: string; expiresAt: string };

export type DemoReaction = { momentId: string; userId: string; emoji: string };

export type DemoComment = { id: string; momentId: string; authorId: string; body: string; createdAt: string };

export type DemoNudge = { fromUserId: string; toUserId: string; localDate: string };

export type DemoState = {
  version: 3;
  persona: DemoPersona;
  family: DemoFamily;
  profiles: DemoProfile[];
  members: DemoMember[];
  elders: DemoElder[];
  moments: DemoMoment[];
  checkins: DemoCheckin[];
  pairingCodes: DemoPairingCode[];
  reactions: DemoReaction[];
  comments: DemoComment[];
  nudges: DemoNudge[];
  // Simulación "día sin foto nueva": el mayor verá un recuerdo del álbum.
  hideTodayPhotos: boolean;
};
