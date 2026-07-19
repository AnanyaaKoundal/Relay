import { z } from "zod";

export const enrollInCourseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
});

export const updateProgressSchema = z.object({
  lessonId: z.string().uuid("Invalid lesson ID"),
});
