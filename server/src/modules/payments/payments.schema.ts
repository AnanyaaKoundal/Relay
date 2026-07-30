import { z } from "zod";

export const purchaseSchema = z.object({
  courseId: z.string().uuid("Invalid course ID"),
  billingCountry: z.string().min(2).max(2),
  subtotal: z.number().positive("Subtotal must be positive"),
  taxAmount: z.number().min(0, "Tax amount cannot be negative"),
  totalAmount: z.number().positive("Total amount must be positive"),
});
