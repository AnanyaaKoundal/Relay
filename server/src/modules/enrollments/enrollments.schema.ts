import { z } from "zod";

export const enrollInCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export const updateProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});

export const courseIdParamSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export const lessonIdParamSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});

export const submitQuizAttemptSchema = z.object({
  answers: z.array(z.number().int().min(0)).min(1, "At least one answer required"),
});
