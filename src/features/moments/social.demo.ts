import { demoLatency, readDemo, updateDemo } from '@/shared/demo';
import { DEFAULT_TIME_ZONE, localDateIn } from '@/shared/utils/dates';
import { createId } from '@/shared/utils/ids';

import type { PostcardComment } from './schemas';

export async function demoFetchComments(momentIds: string[]): Promise<PostcardComment[]> {
  const state = await readDemo();
  return state.comments.filter((c) => momentIds.includes(c.momentId)).map((c) => ({ ...c }));
}

export async function demoAddComment(momentId: string, body: string): Promise<void> {
  await demoLatency(200);
  await updateDemo((state) => {
    const authorId = state.persona.kind === 'family' ? state.persona.userId : 'desconocido';
    state.comments.push({ id: createId(), momentId, authorId, body, createdAt: new Date().toISOString() });
  });
}

export async function demoFetchMyNudges(userId: string): Promise<string[]> {
  const state = await readDemo();
  const today = localDateIn(DEFAULT_TIME_ZONE);
  return state.nudges.filter((n) => n.fromUserId === userId && n.localDate === today).map((n) => n.toUserId);
}

export async function demoSendNudge(fromUserId: string, toUserId: string): Promise<void> {
  await demoLatency(200);
  await updateDemo((state) => {
    const today = localDateIn(DEFAULT_TIME_ZONE);
    const exists = state.nudges.some((n) => n.fromUserId === fromUserId && n.toUserId === toUserId && n.localDate === today);
    if (!exists) {
      state.nudges.push({ fromUserId, toUserId, localDate: today });
    }
  });
}
