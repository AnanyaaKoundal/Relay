import { z } from "zod";

export const browseCoursesSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  free: z
    .string()
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(5000),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.coerce.number().min(0).optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.coerce.number().min(0).optional(),
  status: z
    .enum(["DRAFT", "PENDING_APPROVAL", "PUBLISHED", "REJECTED"])
    .optional(),
  thumbnailUrl: z.string().nullable().optional(),
});
