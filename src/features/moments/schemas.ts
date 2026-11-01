import { z } from 'zod';

export type Moment = {
  id: string;
  familyId: string;
  authorId: string;
  imageUrl: string;
  storagePath: string | null;
  caption: string | null;
  createdAt: string;
};

export type MomentWithAuthor = Moment & { authorName: string; authorLabel: string | null };

export type PhotoOfTheDay = { moment: MomentWithAuthor; isMemory: boolean };

export type PickedPhoto = { uri: string; width: number; height: number };

// Reacciones rápidas a la postal (mismo listado que el CHECK de la migración 0003).
export const REACTIONS = ['❤️', '🥰', '☀️', '👏'] as const;
export type ReactionEmoji = (typeof REACTIONS)[number];
export type Reaction = { momentId: string; userId: string; emoji: string };

export const captionSchema = z.string().trim().max(140, 'El texto puede tener como máximo 140 caracteres');

/** Cómo ve el mayor al autor: "Tu nieta Lucía" si hay etiqueta familiar; si no, su nombre. */
export function authorForElder(moment: MomentWithAuthor): string {
  if (moment.authorLabel === null || moment.authorLabel.trim().length === 0) {
    return moment.authorName;
  }
  const label = moment.authorLabel.trim();
  return `Tu ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
}

export type PostcardComment = { id: string; momentId: string; authorId: string; body: string; createdAt: string };

export const commentSchema = z
  .string()
  .trim()
  .min(1, 'Escribe algo bonito')
  .max(100, 'Máximo 100 caracteres');
