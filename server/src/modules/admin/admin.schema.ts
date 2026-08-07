import { z } from "zod";

// Users
export const listUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["admin", "instructor", "learner"]).optional(),
  status: z.enum(["ACTIVE", "BANNED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BANNED"]),
});

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean().optional(),
  isInstructor: z.boolean().optional(),
});

// Courses
export const listCoursesSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
  instructorId: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Categories
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).optional(),
});

// Payments
export const listPaymentsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["PENDING", "SUCCEEDED", "REFUNDED", "FAILED"]).optional(),
  instructorId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const refundPaymentSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

// Payouts
export const listPayoutsSchema = z.object({
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
  instructorId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const processPayoutSchema = z.object({
  notes: z.string().max(500).optional(),
});

// Settings
export const updateSettingsSchema = z.object({
  platformName: z.string().min(1).max(100).optional(),
  commissionRate: z.number().min(0).max(100).optional(),
  currency: z.string().min(3).max(3).optional(),
  taxRates: z.record(z.string(), z.number().min(0).max(100)).optional(),
});

// Types
export type ListUsersInput = z.infer<typeof listUsersSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type ListCoursesInput = z.infer<typeof listCoursesSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListPaymentsInput = z.infer<typeof listPaymentsSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type ListPayoutsInput = z.infer<typeof listPayoutsSchema>;
export type ProcessPayoutInput = z.infer<typeof processPayoutSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
