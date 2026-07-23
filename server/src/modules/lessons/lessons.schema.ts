import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  contentType: z.enum(["VIDEO", "TEXT", "QUIZ"]),
  orderIndex: z.coerce.number().int().min(0).optional(),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),

  // Content data — provided inline, stored in separate content tables
  videoUrl: z.string().optional(),
  s3Key: z.string().optional(),
  body: z.string().optional(), // for TEXT content
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctAnswer: z.number().int().min(0),
        explanation: z.string().optional(),
      }),
    )
    .optional(), // for QUIZ content
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  orderIndex: z.coerce.number().int().min(0).optional(),
  durationSeconds: z.coerce.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
  videoUrl: z.string().url().nullable().optional(),
  s3Key: z.string().nullable().optional(),
  body: z.string().optional(),
  questions: z
    .array(
      z.object({
        question: z.string().min(1),
        options: z.array(z.string().min(1)).min(2),
        correctAnswer: z.number().int().min(0),
        explanation: z.string().optional(),
      }),
    )
    .min(1)
    .optional(),
});

export const reorderLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});

export const publishLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});

export const unpublishLessonsSchema = z.object({
  lessonIds: z.array(z.string().uuid()).min(1),
});
