export const checkinKeys = {
  recent: (familyId: string) => ['checkins', familyId] as const,
  buttonPressed: ['greeting-button-pressed'] as const,
};
