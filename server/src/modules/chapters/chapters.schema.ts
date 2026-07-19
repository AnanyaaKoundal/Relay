import { z } from "zod";

export const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  orderIndex: z.coerce.number().int().min(0).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
});

export const reorderChaptersSchema = z.object({
  chapterIds: z.array(z.string().uuid()).min(1),
});
