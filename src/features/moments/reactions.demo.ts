import { demoLatency, readDemo, updateDemo } from '@/shared/demo';

import type { Reaction } from './schemas';

export async function demoFetchReactions(momentIds: string[]): Promise<Reaction[]> {
  const state = await readDemo();
  return state.reactions.filter((r) => momentIds.includes(r.momentId)).map((r) => ({ ...r }));
}

export async function demoSetReaction(momentId: string, userId: string, emoji: string, active: boolean): Promise<void> {
  await demoLatency(120);
  await updateDemo((state) => {
    state.reactions = state.reactions.filter((r) => !(r.momentId === momentId && r.userId === userId && r.emoji === emoji));
    if (active) {
      state.reactions.push({ momentId, userId, emoji });
    }
  });
}
