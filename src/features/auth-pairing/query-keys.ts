export const authKeys = {
  session: ['session'] as const,
  family: (familyId: string) => ['family', familyId] as const,
  members: (familyId: string) => ['members', familyId] as const,
};
