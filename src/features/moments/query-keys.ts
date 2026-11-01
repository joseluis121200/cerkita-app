export const momentKeys = {
  list: (familyId: string) => ['moments', familyId] as const,
  simulation: ['moments-simulation'] as const,
  locked: (familyId: string) => ['moments-locked', familyId] as const,
  reactions: (familyId: string) => ['reactions', familyId] as const,
  comments: (familyId: string) => ['comments', familyId] as const,
  nudges: (familyId: string) => ['nudges', familyId] as const,
};
