import { demoLatency, readDemo, updateDemo } from '@/shared/demo';

import type { Family, FamilyMember, MemberRole } from './schemas';

export async function demoFetchFamily(): Promise<Family> {
  const state = await readDemo();
  return { ...state.family };
}

export async function demoFetchMembers(): Promise<FamilyMember[]> {
  const state = await readDemo();
  const result: FamilyMember[] = [];
  for (const member of state.members) {
    const profile = state.profiles.find((p) => p.id === member.userId);
    result.push({
      id: member.id,
      userId: member.userId,
      role: member.role,
      displayName: profile?.displayName ?? member.label ?? 'Miembro',
      label: member.label,
      receiveCriticalEmails: member.receiveCriticalEmails,
    });
  }
  return result;
}

export async function demoSaveProfile(userId: string, displayName: string): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    const profile = state.profiles.find((p) => p.id === userId);
    if (profile !== undefined) {
      profile.displayName = displayName;
    } else {
      state.profiles.push({ id: userId, displayName, email: '' });
    }
  });
}

export async function demoCreateFamily(name: string): Promise<string> {
  await demoLatency();
  return updateDemo((state) => {
    state.family.name = name;
    return state.family.id;
  });
}

export async function demoJoinFamily(token: string): Promise<string> {
  await demoLatency();
  const state = await readDemo();
  if (token !== state.family.inviteToken) {
    throw new Error('Invalid invite link');
  }
  return state.family.id;
}

export async function demoSetMemberRole(memberId: string, role: MemberRole): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    const member = state.members.find((m) => m.id === memberId);
    if (member === undefined || member.role === 'elder') {
      throw new Error('Not allowed');
    }
    const admins = state.members.filter((m) => m.role === 'admin');
    if (member.role === 'admin' && role === 'member' && admins.length <= 1) {
      throw new Error('A family needs at least one admin');
    }
    member.role = role;
    if (role === 'admin') {
      member.receiveCriticalEmails = true;
    }
  });
}

export async function demoUpdateMyPreferences(memberId: string, changes: { label?: string | null; receiveCriticalEmails?: boolean }): Promise<void> {
  await demoLatency(150);
  await updateDemo((state) => {
    const member = state.members.find((m) => m.id === memberId);
    if (member === undefined) {
      return;
    }
    if (changes.label !== undefined) member.label = changes.label;
    if (changes.receiveCriticalEmails !== undefined) member.receiveCriticalEmails = changes.receiveCriticalEmails;
  });
}

export async function demoRenameFamily(name: string): Promise<void> {
  await demoLatency();
  await updateDemo((state) => {
    state.family.name = name;
  });
}

export async function demoSetMemberLabel(memberId: string, label: string): Promise<void> {
  await demoLatency(200);
  await updateDemo((state) => {
    const member = state.members.find((m) => m.id === memberId);
    if (member !== undefined) {
      member.label = label.trim().length > 0 ? label.trim() : null;
    }
  });
}

export async function demoRemoveMember(memberId: string): Promise<void> {
  await demoLatency(300);
  await updateDemo((state) => {
    const member = state.members.find((m) => m.id === memberId);
    if (member === undefined || member.role === 'elder') {
      throw new Error('Not allowed');
    }
    const admins = state.members.filter((m) => m.role === 'admin');
    if (member.role === 'admin' && admins.length <= 1) {
      throw new Error('A family needs at least one admin');
    }
    state.members = state.members.filter((m) => m.id !== memberId);
  });
}
